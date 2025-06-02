using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;
using NpsPesquisa.Api.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class QuestionarioController : ControllerBase
    {
        private readonly NpsDbContext _context;
        private readonly EmailService _emailService;
        private static readonly Random _random = new Random();

        public QuestionarioController(NpsDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Questionario>>> GetAll()
        {
            return await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios.OrderBy(qq => qq.Ordem))
                    .ThenInclude(qq => qq.Questao)
                        .ThenInclude(q => q.Opcoes)
                .OrderByDescending(q => q.DataCriacao)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Questionario>> GetById(int id)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios.OrderBy(qq => qq.Ordem))
                    .ThenInclude(qq => qq.Questao)
                        .ThenInclude(q => q.Opcoes)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            return questionario;
        }

        [HttpGet("{id}/para-resposta")]
        public async Task<ActionResult<object>> GetParaResposta(int id)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios)
                    .ThenInclude(qq => qq.Questao)
                        .ThenInclude(q => q.Opcoes)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            if (questionario.DataExpiracao < DateTime.UtcNow)
                return BadRequest(new { message = "Este questionário já expirou" });

            var questoes = questionario.QuestoesQuestionarios
                .Select(qq => new
                {
                    qq.QuestaoId,
                    qq.Questao.Texto,
                    qq.Questao.Tipo,
                    Opcoes = qq.Questao.Opcoes.Select(o => new
                    {
                        o.Id,
                        o.Texto,
                        o.Valor
                    }).ToList()
                });

            if (questionario.OrdemAleatoria)
            {
                questoes = questoes.OrderBy(x => _random.Next());
            }
            else
            {
                questoes = questoes.OrderBy(q => questionario.QuestoesQuestionarios
                    .First(qq => qq.QuestaoId == q.QuestaoId).Ordem);
            }

            return new
            {
                questionario.Id,
                questionario.Titulo,
                questionario.Descricao,
                questionario.DataExpiracao,
                Questoes = questoes
            };
        }

        [HttpGet("por-periodo")]
        public async Task<ActionResult<IEnumerable<Questionario>>> GetPorPeriodo([FromQuery] DateTime dataInicio, [FromQuery] DateTime dataFim)
        {
            if (dataInicio > dataFim)
                return BadRequest(new { message = "A data de início deve ser menor que a data de fim" });

            return await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios.OrderBy(qq => qq.Ordem))
                    .ThenInclude(qq => qq.Questao)
                        .ThenInclude(q => q.Opcoes)
                .Where(q => q.DataCriacao >= dataInicio && q.DataCriacao <= dataFim)
                .OrderByDescending(q => q.DataCriacao)
                .ToListAsync();
        }

        [HttpGet("{id}/respostas")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<IEnumerable<Resposta>>> GetRespostas(int id)
        {
            var questionario = await _context.Questionarios.FindAsync(id);
            if (questionario == null) 
                return NotFound(new { message = "Questionário não encontrado" });

            return await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                    .ThenInclude(rq => rq.Questao)
                .Include(r => r.Aluno)
                .Where(r => r.QuestionarioId == id)
                .OrderByDescending(r => r.DataResposta)
                .ToListAsync();
        }

        [HttpGet("{id}/estatisticas")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<object>> GetEstatisticas(int id)
        {
            var questionario = await _context.Questionarios.FindAsync(id);
            if (questionario == null) 
                return NotFound(new { message = "Questionário não encontrado" });

            var totalRespostas = await _context.Respostas
                .CountAsync(r => r.QuestionarioId == id);

            var respostasPorQuestao = await _context.RespostasQuestoes
                .Include(rq => rq.Questao)
                .Where(rq => rq.Resposta.QuestionarioId == id)
                .GroupBy(rq => rq.QuestaoId)
                .Select(g => new
                {
                    QuestaoId = g.Key,
                    QuestaoTexto = g.First().Questao.Texto,
                    TotalRespostas = g.Count(),
                    MediaValor = g.Average(rq => double.Parse(rq.Valor))
                })
                .ToListAsync();

            return new
            {
                TotalRespostas = totalRespostas,
                RespostasPorQuestao = respostasPorQuestao
            };
        }

        [HttpPost]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<Questionario>> Create(Questionario questionario)
        {
            if (questionario.DataExpiracao <= DateTime.UtcNow)
                return BadRequest(new { message = "A data de expiração deve ser maior que a data atual" });

            questionario.DataCriacao = DateTime.UtcNow;
            _context.Questionarios.Add(questionario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = questionario.Id }, questionario);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> Update(int id, Questionario questionario)
        {
            if (id != questionario.Id)
                return BadRequest(new { message = "ID do questionário não corresponde" });

            var questionarioExistente = await _context.Questionarios.FindAsync(id);
            if (questionarioExistente == null)
                return NotFound(new { message = "Questionário não encontrado" });

            if (questionario.DataExpiracao <= DateTime.UtcNow)
                return BadRequest(new { message = "A data de expiração deve ser maior que a data atual" });

            questionario.DataCriacao = questionarioExistente.DataCriacao;
            _context.Entry(questionario).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuestionarioExists(id))
                    return NotFound(new { message = "Questionário não encontrado" });
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Delete(int id)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.Respostas)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            if (questionario.Respostas?.Any() == true)
                return BadRequest(new { message = "Não é possível excluir um questionário que possui respostas" });

            _context.Questionarios.Remove(questionario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/questoes")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<Questionario>> AdicionarQuestao(int id, [FromBody] int questaoId)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            var questao = await _context.Questoes.FindAsync(questaoId);
            if (questao == null)
                return NotFound(new { message = "Questão não encontrada" });

            // Verifica se a questão já está no questionário
            if (questionario.QuestoesQuestionarios?.Any(qq => qq.QuestaoId == questaoId) == true)
                return BadRequest(new { message = "Esta questão já está no questionário" });

            var questaoQuestionario = new QuestaoQuestionario
            {
                QuestionarioId = id,
                QuestaoId = questaoId
            };

            _context.QuestoesQuestionarios.Add(questaoQuestionario);
            await _context.SaveChangesAsync();

            return await GetById(id);
        }

        [HttpDelete("{id}/questoes/{questaoId}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> RemoverQuestao(int id, int questaoId)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            var questaoQuestionario = questionario.QuestoesQuestionarios?
                .FirstOrDefault(qq => qq.QuestaoId == questaoId);

            if (questaoQuestionario == null)
                return NotFound(new { message = "Questão não encontrada no questionário" });

            _context.QuestoesQuestionarios.Remove(questaoQuestionario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("com-questoes")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<Questionario>> CreateComQuestoes(QuestionarioDto questionarioDto)
        {
            if (questionarioDto.DataExpiracao <= DateTime.UtcNow)
                return BadRequest(new { message = "A data de expiração deve ser maior que a data atual" });

            // Verifica se todas as questões existem
            var questoesExistentes = await _context.Questoes
                .Where(q => questionarioDto.Questoes.Select(qd => qd.QuestaoId).Contains(q.Id))
                .Select(q => q.Id)
                .ToListAsync();

            var questoesNaoEncontradas = questionarioDto.Questoes
                .Select(q => q.QuestaoId)
                .Except(questoesExistentes)
                .ToList();

            if (questoesNaoEncontradas.Any())
                return BadRequest(new { message = $"As seguintes questões não foram encontradas: {string.Join(", ", questoesNaoEncontradas)}" });

            // Verifica se há ordens duplicadas
            var ordensDuplicadas = questionarioDto.Questoes
                .GroupBy(q => q.Ordem)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (ordensDuplicadas.Any())
                return BadRequest(new { message = $"Existem ordens duplicadas: {string.Join(", ", ordensDuplicadas)}" });

            var questionario = new Questionario
            {
                Titulo = questionarioDto.Titulo,
                Descricao = questionarioDto.Descricao,
                DataCriacao = DateTime.UtcNow,
                DataExpiracao = questionarioDto.DataExpiracao,
                OrdemAleatoria = questionarioDto.OrdemAleatoria ?? false,
                QuestoesQuestionarios = questionarioDto.Questoes.Select(q => new QuestaoQuestionario
                {
                    QuestaoId = q.QuestaoId,
                    Ordem = q.Ordem
                }).ToList()
            };

            _context.Questionarios.Add(questionario);
            await _context.SaveChangesAsync();

            return await GetById(questionario.Id);
        }

        [HttpPut("{id}/com-questoes")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<Questionario>> UpdateComQuestoes(int id, QuestionarioDto questionarioDto)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            if (questionarioDto.DataExpiracao <= DateTime.UtcNow)
                return BadRequest(new { message = "A data de expiração deve ser maior que a data atual" });

            // Verifica se todas as questões existem
            var questoesExistentes = await _context.Questoes
                .Where(q => questionarioDto.Questoes.Select(qd => qd.QuestaoId).Contains(q.Id))
                .Select(q => q.Id)
                .ToListAsync();

            var questoesNaoEncontradas = questionarioDto.Questoes
                .Select(q => q.QuestaoId)
                .Except(questoesExistentes)
                .ToList();

            if (questoesNaoEncontradas.Any())
                return BadRequest(new { message = $"As seguintes questões não foram encontradas: {string.Join(", ", questoesNaoEncontradas)}" });

            // Verifica se há ordens duplicadas
            var ordensDuplicadas = questionarioDto.Questoes
                .GroupBy(q => q.Ordem)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (ordensDuplicadas.Any())
                return BadRequest(new { message = $"Existem ordens duplicadas: {string.Join(", ", ordensDuplicadas)}" });

            // Atualiza os dados básicos do questionário
            questionario.Titulo = questionarioDto.Titulo;
            questionario.Descricao = questionarioDto.Descricao;
            questionario.DataExpiracao = questionarioDto.DataExpiracao;
            questionario.OrdemAleatoria = questionarioDto.OrdemAleatoria ?? false;

            // Remove todas as questões existentes
            _context.QuestoesQuestionarios.RemoveRange(questionario.QuestoesQuestionarios);

            // Adiciona as novas questões com suas ordens
            questionario.QuestoesQuestionarios = questionarioDto.Questoes.Select(q => new QuestaoQuestionario
            {
                QuestionarioId = id,
                QuestaoId = q.QuestaoId,
                Ordem = q.Ordem
            }).ToList();

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuestionarioExists(id))
                    return NotFound(new { message = "Questionário não encontrado" });
                throw;
            }

            return await GetById(id);
        }

        [HttpPost("{id}/participantes")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> AdicionarParticipantes(int id, [FromBody] List<int> participantesIds)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.Respostas)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            // Verifica se os alunos existem
            var alunosExistentes = await _context.Alunos
                .Where(a => participantesIds.Contains(a.Id))
                .Select(a => a.Id)
                .ToListAsync();

            var alunosNaoEncontrados = participantesIds
                .Except(alunosExistentes)
                .ToList();

            if (alunosNaoEncontrados.Any())
                return BadRequest(new { message = $"Os seguintes alunos não foram encontrados: {string.Join(", ", alunosNaoEncontrados)}" });

            // Adiciona os participantes
            foreach (var alunoId in participantesIds)
            {
                var participante = new ParticipanteQuestionario
                {
                    QuestionarioId = id,
                    AlunoId = alunoId
                };
                _context.ParticipantesQuestionarios.Add(participante);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/gerar-convites")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> GerarConvites(int id)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.Participantes)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            if (!questionario.Participantes.Any())
                return BadRequest(new { message = "Não há participantes para este questionário" });

            foreach (var participante in questionario.Participantes)
            {
                var chave = Guid.NewGuid().ToString("N");
                var convite = new ConviteQuestionario
                {
                    QuestionarioId = id,
                    AlunoId = participante.AlunoId,
                    Chave = chave,
                    DataEnvio = DateTime.UtcNow
                };

                _context.ConvitesQuestionarios.Add(convite);

                // Enviar email com o link
                var link = $"http://localhost:3001/questionario/{chave}";
                var emailBody = $@"
                    <h2>Olá!</h2>
                    <p>Você foi convidado para responder ao questionário: {questionario.Titulo}</p>
                    <p>Clique no link abaixo para acessar o questionário:</p>
                    <p><a href='{link}'>{link}</a></p>
                    <p>Este link é único e pessoal.</p>";

                await _emailService.SendEmailAsync(participante.Aluno.Email, "Convite para Questionário", emailBody);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("por-chave/{chave}")]
        public async Task<IActionResult> GetQuestionarioPorChave(string chave)
        {
            var convite = await _context.ConvitesQuestionarios
                .Include(c => c.Questionario)
                    .ThenInclude(q => q.QuestoesQuestionarios)
                        .ThenInclude(qq => qq.Questao)
                            .ThenInclude(q => q.Opcoes)
                .Include(c => c.Aluno)
                .FirstOrDefaultAsync(c => c.Chave == chave);

            if (convite == null)
                return NotFound(new { message = "Convite não encontrado" });

            if (convite.DataResposta.HasValue)
                return BadRequest(new { message = "Este questionário já foi respondido" });

            var questionario = convite.Questionario;
            var questoes = questionario.QuestoesQuestionarios
                .OrderBy(qq => qq.Ordem)
                .Select(qq => new QuestaoResponseDto
                {
                    Id = qq.Questao.Id,
                    Texto = qq.Questao.Texto,
                    Tipo = qq.Questao.Tipo,
                    Opcoes = qq.Questao.Opcoes.Where(o => o.EhColuna == false).Select(o => new OpcaoQuestaoResponseDto
                    {
                        Id = o.Id,
                        Texto = o.Texto,
                        Valor = o.Valor,
                        Ordem = o.Ordem,
                        Peso = o.Peso,
                        EhColuna = o.EhColuna
                    }).ToList(),
                    Colunas = qq.Questao.Opcoes.Where(o => o.EhColuna == true).Select(o => new OpcaoQuestaoResponseDto
                    {
                        Id = o.Id,
                        Texto = o.Texto,
                        Valor = o.Valor,
                        Ordem = o.Ordem,
                        Peso = o.Peso,
                        EhColuna = o.EhColuna
                    }).ToList()
                }).ToList();

            return Ok(new
            {
                questionario = new
                {
                    id = questionario.Id,
                    titulo = questionario.Titulo,
                    descricao = questionario.Descricao,
                    dataInicio = questionario.DataInicio,
                    dataFim = questionario.DataFim,
                    questoes = questoes
                },
                aluno = new
                {
                    id = convite.Aluno.Id,
                    nome = convite.Aluno.Nome,
                    email = convite.Aluno.Email
                }
            });
        }

        [HttpPost("responder/{chave}")]
        public async Task<IActionResult> ResponderQuestionario(string chave, [FromBody] List<RespostaDto> respostas)
        {
            var convite = await _context.ConvitesQuestionarios
                .Include(c => c.Questionario)
                .Include(c => c.Aluno)
                .FirstOrDefaultAsync(c => c.Chave == chave);

            if (convite == null)
                return NotFound(new { message = "Convite não encontrado" });

            if (convite.DataResposta.HasValue)
                return BadRequest(new { message = "Este questionário já foi respondido" });

            if (DateTime.UtcNow < convite.Questionario.DataInicio || DateTime.UtcNow > convite.Questionario.DataFim)
                return BadRequest(new { message = "O período para responder este questionário está encerrado" });

            foreach (var resposta in respostas)
            {
                var questaoQuestionario = await _context.QuestoesQuestionarios
                    .FirstOrDefaultAsync(qq => qq.QuestionarioId == convite.QuestionarioId && qq.QuestaoId == resposta.QuestaoId);

                if (questaoQuestionario == null)
                    return BadRequest(new { message = $"Questão {resposta.QuestaoId} não pertence ao questionário" });

                var novaResposta = new RespostaQuestao
                {
                    Resposta = new Resposta
                    {
                        QuestionarioId = convite.QuestionarioId,
                        AlunoId = convite.AlunoId,
                        DataResposta = DateTime.UtcNow
                    },
                    QuestaoId = resposta.QuestaoId,
                    Valor = resposta.Valor,
                    Texto = resposta.Texto
                };

                _context.RespostasQuestoes.Add(novaResposta);
            }

            convite.DataResposta = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool QuestionarioExists(int id)
        {
            return _context.Questionarios.Any(e => e.Id == id);
        }
    }
} 