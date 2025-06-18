using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;
using ClosedXML.Excel;
using System.IO;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class RespostaController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public RespostaController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Resposta>> CreateResposta(RespostaDto respostaDto)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios)
                .ThenInclude(qq => qq.Questao)
                .FirstOrDefaultAsync(q => q.Id == respostaDto.QuestionarioId);

            if (questionario == null)
            {
                return NotFound("Questionário não encontrado");
            }

            var aluno = await _context.Alunos.FindAsync(respostaDto.AlunoId);
            if (aluno == null)
            {
                return NotFound("Aluno não encontrado");
            }

            // Verifica se o aluno já respondeu o questionário
            var respostaExistente = await _context.Respostas
                .FirstOrDefaultAsync(r => r.QuestionarioId == respostaDto.QuestionarioId && r.AlunoId == respostaDto.AlunoId);

            if (respostaExistente != null)
            {
                return BadRequest("Aluno já respondeu este questionário");
            }

            // Verifica se todas as questões do questionário foram respondidas
            var questoesQuestionario = questionario.QuestoesQuestionarios.Select(qq => qq.QuestaoId).ToList();
            var questoesRespondidas = respostaDto.RespostasQuestoes.Select(rq => rq.QuestaoId).ToList();

            if (!questoesQuestionario.All(q => questoesRespondidas.Contains(q)))
            {
                return BadRequest("Todas as questões do questionário devem ser respondidas");
            }

            // Verifica se as opções selecionadas existem e pertencem às questões corretas
            foreach (var respostaQuestao in respostaDto.RespostasQuestoes)
            {
                if (respostaQuestao.OpcaoId.HasValue)
                {
                    var opcaoExiste = await _context.OpcoesQuestao
                        .AnyAsync(o => o.Id == respostaQuestao.OpcaoId && o.QuestaoId == respostaQuestao.QuestaoId);

                    if (!opcaoExiste)
                    {
                        return BadRequest($"A opção {respostaQuestao.OpcaoId} não existe para a questão {respostaQuestao.QuestaoId}");
                    }
                }
            }

            var resposta = new Resposta
            {
                QuestionarioId = respostaDto.QuestionarioId,
                AlunoId = respostaDto.AlunoId,
                DataResposta = DateTime.UtcNow,
                RespostasQuestoes = respostaDto.RespostasQuestoes.Select(rq => new RespostaQuestao
                {
                    QuestaoId = rq.QuestaoId,
                    OpcaoId = rq.OpcaoId
                }).ToList()
            };

            _context.Respostas.Add(resposta);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetResposta), new { id = resposta.Id }, resposta);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<Resposta>> GetResposta(int id)
        {
            var resposta = await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                .ThenInclude(rq => rq.Questao)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (resposta == null)
            {
                return NotFound();
            }

            return resposta;
        }

        [HttpGet]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<IEnumerable<Resposta>>> GetRespostas()
        {
            return await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                .ThenInclude(rq => rq.Questao)
                .ToListAsync();
        }

        [HttpGet("questionario/{questionarioId}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<IEnumerable<Resposta>>> GetRespostasPorQuestionario(int questionarioId)
        {
            return await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                .ThenInclude(rq => rq.Questao)
                .Where(r => r.QuestionarioId == questionarioId)
                .ToListAsync();
        }

        [HttpGet("aluno/{alunoId}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<IEnumerable<Resposta>>> GetRespostasPorAluno(int alunoId)
        {
            return await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                .ThenInclude(rq => rq.Questao)
                .Where(r => r.AlunoId == alunoId)
                .ToListAsync();
        }

        [HttpPost("importar-participantes/{id}")]
        public async Task<IActionResult> ImportarParticipantesXls(int id)
        {
            try
            {
                var questionario = await _context.Questionarios
                    .Include(q => q.Participantes)
                    .FirstOrDefaultAsync(q => q.Id == id);
                
                if (questionario == null)
                    return NotFound(new { message = "Questionário não encontrado" });

                var file = Request.Form.Files.FirstOrDefault();
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "Arquivo não enviado" });

                var participantesInseridos = new List<object>();
                
                using (var stream = file.OpenReadStream())
                {
                    using (var workbook = new XLWorkbook(stream))
                    {
                        var worksheet = workbook.Worksheet(1);
                        var rowCount = worksheet.LastRowUsed().RowNumber();

                        for (int row = 2; row <= rowCount; row++)
                        {
                            try
                            {
                                var filial = worksheet.Cell(row, 1).GetValue<string>()?.Trim();
                                var nivelEnsino = worksheet.Cell(row, 2).GetValue<string>()?.Trim();
                                var periodoLetivo = worksheet.Cell(row, 3).GetValue<string>()?.Trim();
                                var nome = worksheet.Cell(row, 4).GetValue<string>()?.Trim();
                                var matricula = worksheet.Cell(row, 5).GetValue<string>()?.Trim();
                                var cursoNome = worksheet.Cell(row, 6).GetValue<string>()?.Trim();
                                var turno = worksheet.Cell(row, 7).GetValue<string>()?.Trim();
                                var emailInstitucional = worksheet.Cell(row, 8).GetValue<string>()?.Trim();
                                var emailPessoal = worksheet.Cell(row, 9).GetValue<string>()?.Trim();
                                var fone = worksheet.Cell(row, 10).GetValue<string>()?.Trim();
                                var statusNoPeriodoLetivo = worksheet.Cell(row, 11).GetValue<string>()?.Trim();

                                // Skip empty rows
                                if (string.IsNullOrWhiteSpace(nome) || string.IsNullOrWhiteSpace(matricula))
                                    continue;

                                // Validar/obter Curso
                                var curso = await _context.Cursos.FirstOrDefaultAsync(c => c.Nome == cursoNome);
                                if (curso == null)
                                {
                                    curso = new Curso { Nome = cursoNome };
                                    _context.Cursos.Add(curso);
                                    await _context.SaveChangesAsync();
                                }

                                // Validar/obter Aluno
                                var aluno = await _context.Alunos.FirstOrDefaultAsync(a =>
                                    a.Nome == nome &&
                                    a.Filial == filial &&
                                    a.NivelEnsino == nivelEnsino &&
                                    a.PeriodoLetivo == periodoLetivo &&
                                    a.Matricula == matricula &&
                                    a.CursoId == curso.Id &&
                                    a.Turno == turno
                                );

                                bool novoAluno = false;
                                if (aluno == null)
                                {
                                    aluno = new Aluno
                                    {
                                        Nome = nome,
                                        Filial = filial,
                                        NivelEnsino = nivelEnsino,
                                        PeriodoLetivo = periodoLetivo,
                                        Matricula = matricula,
                                        CursoId = curso.Id,
                                        Turno = turno,
                                        EmailInstitucional = emailInstitucional,
                                        EmailPessoal = emailPessoal,
                                        Fone = fone,
                                        StatusNoPeriodoLetivo = statusNoPeriodoLetivo
                                    };
                                    _context.Alunos.Add(aluno);
                                    await _context.SaveChangesAsync();
                                    novoAluno = true;
                                }

                                // Adicionar como participante se ainda não for
                                var jaParticipante = await _context.ParticipantesQuestionarios
                                    .AnyAsync(p => p.QuestionarioId == id && p.AlunoId == aluno.Id);
                                
                                if (!jaParticipante)
                                {
                                    var participante = new ParticipanteQuestionario
                                    {
                                        QuestionarioId = id,
                                        AlunoId = aluno.Id
                                    };
                                    _context.ParticipantesQuestionarios.Add(participante);
                                    await _context.SaveChangesAsync();
                                }

                                participantesInseridos.Add(new
                                {
                                    alunoId = aluno.Id,
                                    nome = aluno.Nome,
                                    curso = curso.Nome,
                                    novoAluno
                                });
                            }
                            catch (Exception ex)
                            {
                                return BadRequest(new { message = $"Erro na linha {row}: {ex.Message}" });
                            }
                        }
                    }
                }

                return Ok(new { 
                    message = "Importação concluída com sucesso",
                    participantes = participantesInseridos 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Erro ao processar arquivo: {ex.Message}" });
            }
        }

        [HttpGet("download-template-participantes")]
        public IActionResult DownloadTemplateParticipantes()
        {
            try
            {
                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Participantes");

                    // Add headers
                    worksheet.Cell(1, 1).Value = "Filial";
                    worksheet.Cell(1, 2).Value = "Nível de Ensino";
                    worksheet.Cell(1, 3).Value = "Período Letivo";
                    worksheet.Cell(1, 4).Value = "Nome";
                    worksheet.Cell(1, 5).Value = "Matrícula";
                    worksheet.Cell(1, 6).Value = "Curso";
                    worksheet.Cell(1, 7).Value = "Turno";
                    worksheet.Cell(1, 8).Value = "Email Institucional";
                    worksheet.Cell(1, 9).Value = "Email Pessoal";
                    worksheet.Cell(1, 10).Value = "Fone";
                    worksheet.Cell(1, 11).Value = "Status no Período Letivo";

                    // Style the header row
                    var headerRange = worksheet.Range(1, 1, 1, 11);
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    // Add example data in row 2
                    worksheet.Cell(2, 1).Value = "Exemplo";
                    worksheet.Cell(2, 2).Value = "Graduação";
                    worksheet.Cell(2, 3).Value = "2024.1";
                    worksheet.Cell(2, 4).Value = "João Silva";
                    worksheet.Cell(2, 5).Value = "123456";
                    worksheet.Cell(2, 6).Value = "Ciência da Computação";
                    worksheet.Cell(2, 7).Value = "Noturno";
                    worksheet.Cell(2, 8).Value = "joao.silva@email.com";
                    worksheet.Cell(2, 9).Value = "joao.silva@gmail.com";
                    worksheet.Cell(2, 10).Value = "(11) 99999-9999";
                    worksheet.Cell(2, 11).Value = "Ativo";

                    // Auto-fit columns
                    worksheet.Columns().AdjustToContents();

                    // Create memory stream
                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        stream.Position = 0;

                        // Return the file
                        return File(
                            stream.ToArray(),
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "template_importacao_participantes.xlsx"
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Erro ao gerar template: {ex.Message}" });
            }
        }
    }
} 