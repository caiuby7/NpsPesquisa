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
using System.IO;
using ClosedXML.Excel;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class QuestionarioController : ControllerBase
    {
        private readonly NpsDbContext _context;
        private readonly EmailService _emailService;
        private static readonly Random _random = new Random();
        public readonly string urlBase = "https://nps.catolicasc.org.br/";

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
                    qq.Questao.Obrigatorio,
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

        [HttpGet("{id}/parcial-convites")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<object>> GetParcialConvites(int id)
        {
            var questionario = await _context.Questionarios.FindAsync(id);
            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            var totalConvites = await _context.ConvitesQuestionarios
                .CountAsync(c => c.QuestionarioId == id);

            var convitesRespondidos = await _context.ConvitesQuestionarios
                .CountAsync(c => c.QuestionarioId == id && c.Respondido);

            var convitesPendentes = totalConvites - convitesRespondidos;

            var percentualResposta = totalConvites > 0
                ? Math.Round((double)convitesRespondidos / totalConvites * 100, 2)
                : 0;

            return new
            {
                TotalConvites = totalConvites,
                ConvitesRespondidos = convitesRespondidos,
                ConvitesPendentes = convitesPendentes,
                PercentualResposta = percentualResposta
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
                DataInicio = questionarioDto.DataInicio,
                DataFim = questionarioDto.DataFim,
                OrdemAleatoria = questionarioDto.OrdemAleatoria,
                TemplateEmailConvite = questionarioDto.TemplateEmailConvite,
                TemplateEmailLembrete = questionarioDto.TemplateEmailLembrete,
                EnviarLembreteAutomatico = questionarioDto.EnviarLembreteAutomatico,
                LembrarACadaXDias = questionarioDto.LembrarACadaXDias,
                EnviarLembreteParaTodos = questionarioDto.EnviarLembreteParaTodos,
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
            questionario.OrdemAleatoria = questionarioDto.OrdemAleatoria;
            questionario.TemplateEmailConvite = questionarioDto.TemplateEmailConvite;
            questionario.TemplateEmailLembrete = questionarioDto.TemplateEmailLembrete;
            questionario.EnviarLembreteAutomatico = questionarioDto.EnviarLembreteAutomatico;
            questionario.LembrarACadaXDias = questionarioDto.LembrarACadaXDias;
            questionario.EnviarLembreteParaTodos = questionarioDto.EnviarLembreteParaTodos;

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
                .ThenInclude(p => p.Aluno)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            if (!questionario.Participantes.Any())
                return BadRequest(new { message = "Não há participantes para este questionário" });

            foreach (var participante in questionario.Participantes)
            {
                // Verifica se já existe convite para este aluno/questionário
                var conviteExistente = await _context.ConvitesQuestionarios
                    .FirstOrDefaultAsync(c => c.QuestionarioId == id && c.AlunoId == participante.AlunoId);

                if (conviteExistente == null)
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
                    var link = urlBase + $"questionario/{chave}";
                    var template = @"<!DOCTYPE html>
<html lang='pt-br'>
<head>
  <meta charset='UTF-8'>
  <title>Pesquisa de Satisfação - Católica SC</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6;'>
  <div style='text-align: center;'>
    <img src='https://nps.catolicasc.org.br/imagens/logo-nps.png' width='300' alt='Logo NPS Católica SC' style='margin-bottom: 20px;'>

    " + questionario.TemplateEmailLembrete + @"
<div style=""margin: 40px auto; text-align: center;"">
  <a href=""{{link}}"" 
     style=""display: inline-block; 
            background-color: #aa2439; 
            color: white; 
            font-size: 18px; 
            font-family: Arial, sans-serif; 
            text-decoration: none; 
            padding: 16px 24px; 
            border-radius: 8px; 
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);"">
    QUAL A SUA SATISFAÇÃO COM A CATÓLICA SC?<br>RESPONDA AQUI!
  </a>
</div>
    <footer style='font-size: 12px; color: #aaa; margin-top: 20px;'>
      <p>Centro Universitário Católica de Santa Catarina<br>
      Jaraguá do Sul | Joinville | Itajaí | Florianópolis<br>
      <a href='https://catolicasc.org.br' style='color: #fff;'>catolicasc.org.br</a> | 0800 600 005</p>
      <p style='font-size: 10px; color: #999;'>Não encaminhe este e-mail, pois este link de questionário é exclusivo para a sua conta. Caso queira cancelar a adesão de e-mails futuros, 
      <a href='#' 
         style='color: #0563c1;'>clique aqui</a>.</p>
    </footer>
  </div>
</body>
</html>";
                    /* var template = questionario.TemplateEmailLembrete
                             ?? @"<h2>Olá!</h2>\n<p>Este é um lembrete para responder ao questionário: {{titulo}}</p>\n<p>Clique no link abaixo para acessar o questionário:</p>\n<p><a href='{{link}}'>{{link}}</a></p>\n<p>Este link é único e pessoal.</p>";
                    */
                    var emailBody = template
                        .Replace("{{nome}}", participante.Aluno.Nome)
                        .Replace("{{titulo}}", questionario.Titulo).Replace("{titulo}", questionario.Titulo)
                        .Replace("{{link}}", link).Replace("{link}", link);

                    await _emailService.SendEmailAsync(participante.Aluno.EmailInstitucional, "QUAL A SUA SATISFAÇÃO COM A CATÓLICA SC?", emailBody);
                }

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

            if (convite.DataResposta.HasValue && convite.Respondido)
                return BadRequest(new { message = "Este questionário já foi respondido" });

            var questionario = convite.Questionario;

            if (DateTime.UtcNow < convite.Questionario.DataInicio || DateTime.UtcNow > convite.Questionario.DataFim)
                return BadRequest(new { message = "O período para responder este questionário está encerrado" });

            var questoes = questionario.QuestoesQuestionarios
                .OrderBy(qq => qq.Ordem)
                .Select(qq => new QuestaoResponseDto
                {
                    Id = qq.Questao.Id,
                    Texto = qq.Questao.Texto,
                    Tipo = qq.Questao.Tipo,
                    Obrigatorio = qq.Questao.Obrigatorio,
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
                    email = convite.Aluno.EmailInstitucional
                }
            });
        }

        public class ResponderQuestionarioDto
        {
            public int QuestionarioId { get; set; }
            public int AlunoId { get; set; }
            public List<RespostaParaQuestionarioDto> Respostas { get; set; }
        }

        public class RespostaParaQuestionarioDto
        {
            public int QuestaoId { get; set; }
            public string? Valor { get; set; }
            public string? Texto { get; set; }
            public int? OpcaoId { get; set; }
            public int? ColunaId { get; set; }
        }

        [HttpPost("responder/{chave}")]
        public async Task<IActionResult> ResponderQuestionario(string chave, [FromBody] ResponderQuestionarioDto dto)
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

            var questoesQuestionario = await _context.QuestoesQuestionarios
                .Where(qq => qq.QuestionarioId == convite.QuestionarioId)
                .Select(qq => qq.QuestaoId)
                .ToListAsync();

            var questoesRespondidas = dto.Respostas.Select(r => r.QuestaoId).ToList();

            // Criar uma única resposta para o questionário
            var resposta = new Resposta
            {
                QuestionarioId = convite.QuestionarioId,
                AlunoId = convite.AlunoId,
                DataResposta = DateTime.UtcNow
            };
            _context.Respostas.Add(resposta);
            await _context.SaveChangesAsync(); // Salva para obter o ID da resposta

            foreach (var respostaDto in dto.Respostas)
            {
                // Ignora respostas totalmente vazias
                if (string.IsNullOrEmpty(respostaDto.Valor) && string.IsNullOrEmpty(respostaDto.Texto) && respostaDto.OpcaoId == null && respostaDto.ColunaId == null)
                    continue;

                var questaoQuestionario = await _context.QuestoesQuestionarios
                    .FirstOrDefaultAsync(qq => qq.QuestionarioId == convite.QuestionarioId && qq.QuestaoId == respostaDto.QuestaoId);

                if (questaoQuestionario == null)
                    return BadRequest(new { message = $"Questão {respostaDto.QuestaoId} não pertence ao questionário" });

                var novaRespostaQuestao = new RespostaQuestao
                {
                    RespostaId = resposta.Id,
                    QuestaoId = respostaDto.QuestaoId,
                    Valor = respostaDto.ColunaId.HasValue ? await _context.OpcoesQuestao.Where(o => o.Id == respostaDto.ColunaId && o.QuestaoId == respostaDto.QuestaoId).Select(o => o.Texto).FirstOrDefaultAsync() ?? respostaDto.Valor : respostaDto.Valor,
                    Texto = respostaDto.Texto,
                    OpcaoId = respostaDto.OpcaoId
                };

                _context.RespostasQuestoes.Add(novaRespostaQuestao);
            }

            convite.DataResposta = DateTime.UtcNow;
            convite.Respondido = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{id}/participantes")]
        public async Task<ActionResult<IEnumerable<object>>> GetParticipantes(int id)
        {
            var participantes = await _context.ParticipantesQuestionarios
                .Where(p => p.QuestionarioId == id)
                .Select(p => new
                {
                    p.Id,
                    p.AlunoId,
                    p.QuestionarioId,
                    Aluno = new
                    {
                        p.Aluno.Id,
                        p.Aluno.Nome,
                        p.Aluno.EmailInstitucional,
                        p.Aluno.EmailPessoal,
                        p.Aluno.Matricula,
                        p.Aluno.Turno,
                        p.Aluno.CursoId,
                        Curso = new
                        {
                            p.Aluno.Curso.Id,
                            p.Aluno.Curso.Nome
                        }
                    }
                })
                .ToListAsync();

            if (participantes == null || !participantes.Any())
            {
                return NotFound("Nenhum participante encontrado para este questionário.");
            }

            return participantes;
        }

        [HttpDelete("{id}/participantes/{alunoId}")]
        public async Task<IActionResult> DeleteParticipante(int id, int alunoId)
        {
            var participante = await _context.ParticipantesQuestionarios
                .FirstOrDefaultAsync(p => p.QuestionarioId == id && p.AlunoId == alunoId);

            if (participante == null)
            {
                return NotFound("Participant not found.");
            }

            _context.ParticipantesQuestionarios.Remove(participante);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/importar-participantes-xls")]
        [Authorize(Roles = "Administrador,Coordenacao")]
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

                return Ok(new
                {
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

        private bool QuestionarioExists(int id)
        {
            return _context.Questionarios.Any(e => e.Id == id);
        }
    }
}