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

            // Buscar todos os convites respondidos para este questionário
            var convitesRespondido = await _context.ConvitesQuestionarios
                .Where(c => c.QuestionarioId == id && c.Respondido)
                .Select(c => c.AlunoId)
                .ToListAsync();

            // Contar respostas APENAS de quem respondeu via convite
            var convitesRespondidos = await _context.Respostas
                 .Where(r => r.QuestionarioId == id && convitesRespondido.Contains(r.AlunoId))
                 .Select(r => r.AlunoId)
                    .Distinct()
                    .CountAsync();

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
                    await _context.SaveChangesAsync();
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
                var erros = new List<string>();
                var totalProcessados = 0;

                using (var stream = file.OpenReadStream())
                {
                    using (var workbook = new XLWorkbook(stream))
                    {
                        var worksheet = workbook.Worksheet(1);
                        var rowCount = worksheet.LastRowUsed().RowNumber();

                        // Verificar se há pelo menos 2 linhas (cabeçalho + dados)
                        if (rowCount < 2)
                        {
                            return BadRequest(new { message = "O arquivo deve conter pelo menos o cabeçalho e uma linha de dados" });
                        }

                        // Processar em lotes para economizar memória
                        const int batchSize = 50;

                        for (int batchStart = 2; batchStart <= rowCount; batchStart += batchSize)
                        {
                            var batchEnd = Math.Min(batchStart + batchSize - 1, rowCount);

                            using (var transaction = await _context.Database.BeginTransactionAsync())
                            {
                                try
                                {
                                    for (int row = batchStart; row <= batchEnd; row++)
                                    {
                                        try
                                        {
                                            // Verificar se a linha está vazia antes de processar
                                            var isRowEmpty = true;
                                            for (int col = 1; col <= 11; col++)
                                            {
                                                var cellValue = worksheet.Cell(row, col).GetValue<string>();
                                                if (!string.IsNullOrWhiteSpace(cellValue))
                                                {
                                                    isRowEmpty = false;
                                                    break;
                                                }
                                            }

                                            if (isRowEmpty)
                                            {
                                                continue; // Pular linhas completamente vazias
                                            }

                                            var filial = worksheet.Cell(row, 1).GetValue<string>()?.Trim() ?? "";
                                            var nivelEnsino = worksheet.Cell(row, 2).GetValue<string>()?.Trim() ?? "";
                                            var periodoLetivo = worksheet.Cell(row, 3).GetValue<string>()?.Trim() ?? "";
                                            var nome = worksheet.Cell(row, 4).GetValue<string>()?.Trim();
                                            var matricula = worksheet.Cell(row, 5).GetValue<string>()?.Trim();
                                            var cursoNome = worksheet.Cell(row, 6).GetValue<string>()?.Trim() ?? "";
                                            var turno = worksheet.Cell(row, 7).GetValue<string>()?.Trim() ?? "";
                                            var emailInstitucional = worksheet.Cell(row, 8).GetValue<string>()?.Trim() ?? "";
                                            var emailPessoal = worksheet.Cell(row, 9).GetValue<string>()?.Trim() ?? "";
                                            var fone = worksheet.Cell(row, 10).GetValue<string>()?.Trim() ?? "";
                                            var statusNoPeriodoLetivo = worksheet.Cell(row, 11).GetValue<string>()?.Trim() ?? "";

                                            // Validações básicas
                                            if (string.IsNullOrWhiteSpace(nome))
                                            {
                                                erros.Add($"Linha {row}: Nome é obrigatório");
                                                continue;
                                            }

                                            if (string.IsNullOrWhiteSpace(matricula))
                                            {
                                                erros.Add($"Linha {row}: Matrícula é obrigatória");
                                                continue;
                                            }

                                            if (string.IsNullOrWhiteSpace(cursoNome))
                                            {
                                                erros.Add($"Linha {row}: Curso é obrigatório");
                                                continue;
                                            }

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
                                                    Email = emailInstitucional,
                                                    Filial = filial,
                                                    NivelEnsino = nivelEnsino,
                                                    PeriodoLetivo = periodoLetivo,
                                                    Matricula = matricula,
                                                    CursoId = curso.Id,
                                                    Turno = turno,
                                                    EmailInstitucional = emailInstitucional,
                                                    EmailPessoal = emailPessoal,
                                                    Fone = fone,
                                                    StatusNoPeriodoLetivo = statusNoPeriodoLetivo,
                                                    AceitaContato = true
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

                                            totalProcessados++;
                                        }
                                        catch (Exception ex)
                                        {
                                            var errorMessage = ex.Message;
                                            if (ex.InnerException != null)
                                            {
                                                errorMessage += ". Inner Exception: " + ex.InnerException.Message;
                                            }
                                            erros.Add($"Erro na linha {row}: {errorMessage}");
                                        }
                                    }

                                    await transaction.CommitAsync();
                                }
                                catch (Exception ex)
                                {
                                    await transaction.RollbackAsync();
                                    var errorMessage = ex.Message;
                                    if (ex.InnerException != null)
                                    {
                                        errorMessage += ". Inner Exception: " + ex.InnerException.Message;
                                    }
                                    erros.Add($"Erro no lote {batchStart}-{batchEnd}: {errorMessage}");
                                }
                            }

                            // Liberar memória entre lotes
                            GC.Collect();
                            GC.WaitForPendingFinalizers();
                        }
                    }
                }

                var resultado = new
                {
                    message = "Importação concluída",
                    participantes = participantesInseridos,
                    totalProcessados = totalProcessados,
                    erros = erros
                };

                if (erros.Any())
                {
                    return BadRequest(resultado);
                }

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                var errorMessage = ex.Message;
                if (ex.InnerException != null)
                {
                    errorMessage += ". Inner Exception: " + ex.InnerException.Message;
                }
                return BadRequest(new { message = $"Erro ao processar arquivo: {errorMessage}" });
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

                    // Adicionar uma linha de exemplo na linha 3 (não na linha 2)
                    worksheet.Cell(3, 1).Value = "Exemplo";
                    worksheet.Cell(3, 2).Value = "Graduação";
                    worksheet.Cell(3, 3).Value = "2024.1";
                    worksheet.Cell(3, 4).Value = "João Silva";
                    worksheet.Cell(3, 5).Value = "123456";
                    worksheet.Cell(3, 6).Value = "Ciência da Computação";
                    worksheet.Cell(3, 7).Value = "Noturno";
                    worksheet.Cell(3, 8).Value = "joao.silva@email.com";
                    worksheet.Cell(3, 9).Value = "joao.silva@gmail.com";
                    worksheet.Cell(3, 10).Value = "(11) 99999-9999";
                    worksheet.Cell(3, 11).Value = "Ativo";

                    // Adicionar comentário explicativo
                    worksheet.Cell(2, 1).Value = "IMPORTANTE: Comece a inserir seus dados a partir da linha 2. A linha 3 contém apenas um exemplo.";

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

        [HttpGet("{id}/dashboard")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<object>> GetDashboardData(int id)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios)
                    .ThenInclude(qq => qq.Questao)
                        .ThenInclude(q => q.Opcoes)
                .FirstOrDefaultAsync(q => q.Id == id);
            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            // Buscar todos os convites respondidos para este questionário
            var convitesRespondidos = await _context.ConvitesQuestionarios
                .Where(c => c.QuestionarioId == id && c.Respondido)
                .Select(c => new { c.AlunoId, c.QuestionarioId })
                .ToListAsync();

            // Extrair apenas os IDs dos alunos que responderam
            var alunosRespondidos = convitesRespondidos.Select(c => c.AlunoId).ToList();

            // Buscar todas as respostas do questionário APENAS de quem respondeu via convite
            var respostas = await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                    .ThenInclude(rq => rq.Questao)
                .Include(r => r.Aluno)
                    .ThenInclude(a => a.Curso)
                .Where(r => r.QuestionarioId == id && alunosRespondidos.Contains(r.AlunoId))
                .OrderBy(r => r.DataResposta)
                .ToListAsync();

            if (!respostas.Any())
            {
                return Ok(new
                {
                    totalRespostas = 0,
                    tendenciaRespostas = new object[] { },
                    npsGeral = 0,
                    npsDetalhamento = new { passivo = 0, promotor = 0, detrator = 0 },
                    satisfacao = 0,
                    satisfacaoDetalhamento = new { insatisfeito = 0, nemSatisfeito = 0, satisfeito = 0, muitoSatisfeito = 0 },
                    satisfacaoPorCurso = new object[] { },
                    comentariosQ19 = new object[] { },
                    comentariosQ23 = new object[] { },
                    matrizMedias = new object[] { }
                });
            }

            // Tendência de respostas por dia
            var tendenciaRespostas = respostas
                .GroupBy(r => r.DataResposta.Date)
                .OrderBy(g => g.Key)
                .Select(g => new
                {
                    data = g.Key.ToString("MMM dd"),
                    quantidade = g.Count()
                })
                .ToList();

            // Calcular NPS (Net Promoter Score)
            var questoesNPS = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.Questao.Tipo == TipoQuestao.EscalaLinear && rq.Valor != null)
                .ToList();

            var npsScores = questoesNPS
                .Select(rq => int.Parse(rq.Valor))
                .ToList();

            var promotores = npsScores.Count(s => s >= 9 && s <= 10);
            var detratores = npsScores.Count(s => s >= 0 && s <= 6);
            var passivos = npsScores.Count(s => s >= 7 && s <= 8);
            var totalNPS = npsScores.Count;

            var npsGeral = totalNPS > 0 ? Math.Round(((double)(promotores - detratores) / totalNPS) * 100, 0) : 0;

            // Cálculo da média de satisfação para questão múltipla escolha (exemplo QuestaoId = 22)
            var questaoSatisfacao = _context.Questoes
                .Include(q => q.Opcoes)
                .FirstOrDefault(q => q.Id == 21);

            var opcoesSatisfacao = questaoSatisfacao?.Opcoes.OrderBy(o => o.Ordem).ToList() ?? new List<OpcaoQuestao>();

            var questoesSatisfacaoMultipla = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 21 && rq.OpcaoId != null)
                .ToList();

            // Agrupa as respostas por opção para mostrar no gráfico
            var respostasPorOpcaoSatisfacao = questoesSatisfacaoMultipla
                .GroupBy(rq => rq.OpcaoId)
                .Select(g =>
                {
                    var opcao = opcoesSatisfacao.FirstOrDefault(o => o.Id == g.Key);
                    var peso = opcao != null ? opcao.Peso : 0;
                    return new
                    {
                        opcaoId = g.Key,
                        opcaoNome = opcao?.Texto ?? "",
                        peso = peso,
                        quantidade = g.Count(),
                        percentual = questoesSatisfacaoMultipla.Count > 0 ? Math.Round((double)g.Count() / questoesSatisfacaoMultipla.Count * 100, 1) : 0
                    };
                })
                .OrderBy(x => x.peso)
                .ToList();

            var valoresSatisfacao = questoesSatisfacaoMultipla
                .Select(rq =>
                {
                    var opcao = opcoesSatisfacao.FirstOrDefault(o => o.Id == rq.OpcaoId);
                    return opcao != null ? (opcao.Peso != 0 ? opcao.Peso : (opcoesSatisfacao.IndexOf(opcao) + 1)) : (int?)null;
                })
                .Where(v => v.HasValue)
                .Select(v => v.Value)
                .ToList();

            double mediaSatisfacao = valoresSatisfacao.Count > 0 ? Math.Round(valoresSatisfacao.Average(), 1) : 0;

            // Satisfação por curso (questão 22)
            var questaoSatisfacaoCurso = _context.Questoes
                .Include(q => q.Opcoes)
                .FirstOrDefault(q => q.Id == 22);

            var opcoesSatisfacaoCurso = questaoSatisfacaoCurso?.Opcoes.OrderBy(o => o.Ordem).ToList() ?? new List<OpcaoQuestao>();

            var respostasPorCurso = respostas
                .SelectMany(r => r.RespostasQuestoes, (r, rq) => new { r, rq })
                .Where(x => x.rq.QuestaoId == 22 && x.rq.OpcaoId != null && x.r.Aluno?.Curso != null)
                .GroupBy(x => x.r.Aluno.Curso.Nome)
                .ToList();

            var satisfacaoPorCurso = respostasPorCurso.Select(g =>
            {
                var total = g.Count();
                int GetPeso(int? opcaoId)
                {
                    var opcao = opcoesSatisfacaoCurso.FirstOrDefault(o => o.Id == opcaoId);
                    return opcao != null ? (opcao.Peso != 0 ? opcao.Peso : (opcoesSatisfacaoCurso.IndexOf(opcao) + 1)) : 0;
                }
                var muitoInsatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 1);
                var insatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 2);
                var nemSatisfeitoNemInsatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 3);
                var satisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 4);
                var muitoSatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 5);
                double media = total > 0 ? Math.Round((g.Select(x => GetPeso(x.rq.OpcaoId)).Where(p => p > 0).DefaultIfEmpty(0).Average()), 1) : 0;
                return new
                {
                    curso = g.Key,
                    total,
                    muitoInsatisfeito,
                    insatisfeito,
                    nemSatisfeitoNemInsatisfeito,
                    satisfeito,
                    muitoSatisfeito,
                    percentuais = new
                    {
                        muitoInsatisfeito = total > 0 ? Math.Round((double)muitoInsatisfeito / total * 100, 1) : 0,
                        insatisfeito = total > 0 ? Math.Round((double)insatisfeito / total * 100, 1) : 0,
                        nemSatisfeitoNemInsatisfeito = total > 0 ? Math.Round((double)nemSatisfeitoNemInsatisfeito / total * 100, 1) : 0,
                        satisfeito = total > 0 ? Math.Round((double)satisfeito / total * 100, 1) : 0,
                        muitoSatisfeito = total > 0 ? Math.Round((double)muitoSatisfeito / total * 100, 1) : 0
                    },
                    satisfacao = media
                };
            }).ToList();

            // Comentários das questões 19 e 23
            var comentariosQ19 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 19 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => new
                {
                    texto = rq.Valor,
                    curso = rq.Resposta.Aluno.Curso.Nome,
                    nota = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average(),
                    tipo = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() >= 9 ? "Promotor" :
                        rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() <= 6 ? "Detrator" : "Passivo"
                })
                .ToList();

            var comentariosQ23 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 23 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => new
                {
                    texto = rq.Valor,
                    curso = rq.Resposta.Aluno.Curso.Nome,
                    nota = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average(),
                    tipo = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() >= 9 ? "Promotor" :
                        rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() <= 6 ? "Detrator" : "Passivo"
                })
                .ToList();

            // Cálculo das médias das questões do tipo matriz (usando Peso)
            var matrizMedias = questionario.QuestoesQuestionarios
                .Where(qq => qq.Questao.Tipo == TipoQuestao.Matriz)
                .Select(qq =>
                {
                    var colunas = qq.Questao.Opcoes.Where(o => o.EhColuna).OrderBy(o => o.Ordem).ToList();
                    return new
                    {
                        questaoId = qq.Questao.Id,
                        questaoTexto = qq.Questao.Texto,
                        linhas = qq.Questao.Opcoes
                            .Where(o => !o.EhColuna)
                            .Select(linha => new
                            {
                                afirmacao = linha.Texto,
                                media = Math.Round(
                                    respostas
                                        .SelectMany(r => r.RespostasQuestoes)
                                        .Where(rq => rq.QuestaoId == qq.Questao.Id && rq.OpcaoId == linha.Id && rq.Valor != null)
                                        .Select(rq =>
                                        {
                                            var col = colunas.FirstOrDefault(c => c.Texto == rq.Valor);
                                            return col != null ? (double?)col.Peso : null;
                                        })
                                        .Where(v => v.HasValue)
                                        .Select(v => v.Value)
                                        .DefaultIfEmpty(0)
                                        .Average(), 1)
                            })
                            .ToList()
                    };
                })
                .ToList();

            // Instanciar o serviço de sentimento
            var sentimentService = new NpsPesquisa.Api.Services.SentimentAnalysisService();

            // Respostas de texto da questão 19
            var respostasQ19 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 19 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => rq.Valor)
                .ToList();

            var sentimentosQ19 = respostasQ19.Select(texto => sentimentService.Predict(texto)).ToList();
            var analiseSentimentoQ19 = sentimentosQ19
                .GroupBy(s => s)
                .Select(g => new { sentimento = g.Key, quantidade = g.Count() })
                .ToList();

            // Respostas de texto da questão 23
            var respostasQ23 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 23 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => rq.Valor)
                .ToList();

            var sentimentosQ23 = respostasQ23.Select(texto => sentimentService.Predict(texto)).ToList();
            var analiseSentimentoQ23 = sentimentosQ23
                .GroupBy(s => s)
                .Select(g => new { sentimento = g.Key, quantidade = g.Count() })
                .ToList();

            // Dicionário de categorias
            var categorias = new Dictionary<string, string[]>
            {
                { "Ensino", new[] { "ensino", "professor", "aula", "didática", "conteúdo", "explicação", "pedagógico" } },
                { "Melhoria", new[] { "melhorar", "melhoria", "sugestão", "precisa", "corrigir", "aperfeiçoar" } },
                { "Financeiro", new[] { "preço", "mensalidade", "financeiro", "custo", "desconto", "bolsa", "parcelamento" } },
                { "Infraestrutura", new[] { "estrutura", "sala", "laboratório", "equipamento", "biblioteca", "instalações", "cadeira", "ambiente" } },
                { "Atendimento", new[] { "atendimento", "secretaria", "suporte", "resposta", "demora", "funcionário", "cordialidade" } },
                { "Sistema", new[] { "sistema", "site", "plataforma", "portal", "erro", "login", "instabilidade", "tecnologia" } },
                { "Empregabilidade", new[] { "emprego", "estágio", "carreira", "parceria", "networking", "empresa", "mercado" } },
                { "Coordenação", new[] { "coordenação", "coordenador", "organização", "responsável", "gestão", "comunicação interna" } },
                { "Horários", new[] { "horário", "turno", "grade", "incompatível", "tarde", "noite", "sábado" } },
                { "Transporte e Acesso", new[] { "localização", "transporte", "ônibus", "metrô", "estacionamento", "acesso", "trânsito" } },
                { "Ambiente Acadêmico", new[] { "clima", "ambiente", "amizade", "acolhimento", "respeito", "interação", "comunidade" } },
                { "Reputação", new[] { "nome", "reputação", "ranking", "reconhecimento", "nota mec", "qualidade", "tradição" } },
                { "Eventos e Atividades", new[] { "evento", "palestra", "semana acadêmica", "atividade", "projeto", "workshop", "intercâmbio" } },
                { "EAD", new[] { "ead", "online", "plataforma", "vídeo aula", "remoto", "estudar em casa", "ambiente virtual", "atividade online", "fórum" } },
                { "Presencial", new[] { "presencial", "em sala", "campus", "presença física", "aula prática", "frequência", "estrutura física" } }
            };

            // Função para análise por categoria
            dynamic AnalisePorCategoria(List<string> respostas, NpsPesquisa.Api.Services.SentimentAnalysisService sentimentService)
            {
                var resultado = new List<object>();
                foreach (var categoria in categorias)
                {
                    var respostasCategoria = respostas.Where(texto =>
                        categoria.Value.Any(palavra => texto.ToLower().Contains(palavra))
                    ).ToList();
                    var sentimentos = respostasCategoria.Select(texto => sentimentService.Predict(texto)).ToList();
                    var agrupado = sentimentos
                        .GroupBy(s => s)
                        .Select(g => new { sentimento = g.Key, quantidade = g.Count() })
                        .ToList();
                    resultado.Add(new
                    {
                        categoria = categoria.Key,
                        total = respostasCategoria.Count,
                        sentimentos = agrupado
                    });
                }
                return resultado;
            }

            // Enunciados das questões 19 e 23
            var enunciadoQ19 = _context.Questoes.FirstOrDefault(q => q.Id == 19)?.Texto ?? "";
            var enunciadoQ23 = _context.Questoes.FirstOrDefault(q => q.Id == 23)?.Texto ?? "";

            var analiseSentimentoPorCategoriaQ19 = AnalisePorCategoria(respostasQ19, sentimentService);
            var analiseSentimentoPorCategoriaQ23 = AnalisePorCategoria(respostasQ23, sentimentService);

            // Detalhamento geral da satisfação com o curso (questão 22)
            var questoesSatisfacaoCursoMultipla = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 22 && rq.OpcaoId != null)
                .ToList();

            var respostasPorOpcaoSatisfacaoCurso = questoesSatisfacaoCursoMultipla
                .GroupBy(rq => rq.OpcaoId)
                .Select(g =>
                {
                    var opcao = opcoesSatisfacaoCurso.FirstOrDefault(o => o.Id == g.Key);
                    var peso = opcao != null ? opcao.Peso : 0;
                    return new
                    {
                        opcaoId = g.Key,
                        opcaoNome = opcao?.Texto ?? "",
                        peso = peso,
                        quantidade = g.Count(),
                        percentual = questoesSatisfacaoCursoMultipla.Count > 0 ? Math.Round((double)g.Count() / questoesSatisfacaoCursoMultipla.Count * 100, 1) : 0
                    };
                })
                .OrderBy(x => x.peso)
                .ToList();

            var satisfacaoCursoDetalhamento = new
            {
                insatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.peso == 2).Sum(x => x.percentual),
                nemSatisfeitoNemInsatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.peso == 3).Sum(x => x.percentual),
                satisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.peso == 4).Sum(x => x.percentual),
                muitoSatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.peso == 5).Sum(x => x.percentual)
            };

            return Ok(new
            {
                totalRespostas = respostas.Count,
                tendenciaRespostas = tendenciaRespostas,
                npsGeral = npsGeral,
                npsDetalhamento = new
                {
                    passivo = totalNPS > 0 ? Math.Round((double)passivos / totalNPS * 100, 0) : 0,
                    promotor = totalNPS > 0 ? Math.Round((double)promotores / totalNPS * 100, 0) : 0,
                    detrator = totalNPS > 0 ? Math.Round((double)detratores / totalNPS * 100, 0) : 0
                },
                satisfacao = mediaSatisfacao,
                satisfacaoDetalhamento = new
                {
                    muitoInsatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.peso == 1).Sum(x => x.percentual),
                    insatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.peso == 2).Sum(x => x.percentual),
                    nemInsatisfeitoNemSatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.peso == 3).Sum(x => x.percentual),
                    satisfeito = respostasPorOpcaoSatisfacao.Where(x => x.peso == 4).Sum(x => x.percentual),
                    muitoSatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.peso == 5).Sum(x => x.percentual)
                },
                satisfacaoPorCurso = satisfacaoPorCurso,
                comentariosQ19 = comentariosQ19,
                comentariosQ23 = comentariosQ23,
                matrizMedias = matrizMedias,
                analiseSentimentoQ19 = analiseSentimentoQ19,
                analiseSentimentoQ23 = analiseSentimentoQ23,
                analiseSentimentoPorCategoriaQ19 = analiseSentimentoPorCategoriaQ19,
                analiseSentimentoPorCategoriaQ23 = analiseSentimentoPorCategoriaQ23,
                enunciadoQ19 = enunciadoQ19,
                enunciadoQ23 = enunciadoQ23
            });
        }

        [HttpGet("{id}/exportar-pendentes")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> ExportarPendentes(int id)
        {
            var convitesPendentes = await _context.ConvitesQuestionarios
                .Include(c => c.Aluno)
                .Where(c => c.QuestionarioId == id && !c.Respondido)
                .ToListAsync();

            if (!convitesPendentes.Any())
                return NotFound(new { message = "Nenhum participante pendente para este questionário." });

            using (var workbook = new ClosedXML.Excel.XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Pendentes");
                worksheet.Cell(1, 1).Value = "Nome";
                worksheet.Cell(1, 2).Value = "Chave";
                worksheet.Cell(1, 3).Value = "Link";

                for (int i = 0; i < convitesPendentes.Count; i++)
                {
                    worksheet.Cell(i + 2, 1).Value = convitesPendentes[i].Aluno.Nome;
                    worksheet.Cell(i + 2, 2).Value = convitesPendentes[i].Chave;
                    worksheet.Cell(i + 2, 3).Value = $"https://nps.catolicasc.org.br/questionario/{convitesPendentes[i].Chave}";
                }

                worksheet.Columns().AdjustToContents();

                using (var stream = new System.IO.MemoryStream())
                {
                    workbook.SaveAs(stream);
                    stream.Position = 0;
                    return File(
                        stream.ToArray(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        $"pendentes_questionario_{id}.xlsx"
                    );
                }
            }
        }

        [HttpGet("{id}/exportar-respondentes")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> ExportarRespondentes(int id)
        {
            var convitesRespondidos = await _context.ConvitesQuestionarios
                .Include(c => c.Aluno)
                .Where(c => c.QuestionarioId == id && c.Respondido)
                .ToListAsync();

            if (!convitesRespondidos.Any())
                return NotFound(new { message = "Nenhum participante respondeu este questionário." });

            using (var workbook = new ClosedXML.Excel.XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Respondentes");
                worksheet.Cell(1, 1).Value = "Nome Completo";
                worksheet.Cell(1, 2).Value = "E-mail";
                worksheet.Cell(1, 3).Value = "Matrícula";

                for (int i = 0; i < convitesRespondidos.Count; i++)
                {
                    worksheet.Cell(i + 2, 1).Value = convitesRespondidos[i].Aluno.Nome;
                    worksheet.Cell(i + 2, 2).Value = convitesRespondidos[i].Aluno.EmailInstitucional ?? convitesRespondidos[i].Aluno.EmailPessoal ?? "";
                    worksheet.Cell(i + 2, 3).Value = convitesRespondidos[i].Aluno.Matricula ?? "";
                }

                worksheet.Columns().AdjustToContents();

                using (var stream = new System.IO.MemoryStream())
                {
                    workbook.SaveAs(stream);
                    stream.Position = 0;
                    return File(
                        stream.ToArray(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        $"respondentes_questionario_{id}.xlsx"
                    );
                }
            }
        }

        [HttpGet("{id}/relatorio-pdf")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> GerarRelatorioPdf(int id)
        {
            var questionario = await _context.Questionarios.FindAsync(id);
            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            // Buscar dados do dashboard
            var dashboardData = await GetDashboardDataInternal(id);
            if (dashboardData == null)
                return NotFound(new { message = "Nenhum dado encontrado para este questionário" });

            // Gerar relatório PDF
            var reportService = HttpContext.RequestServices.GetRequiredService<ReportService>();
            var pdfBytes = reportService.GeneratePdfReport(dashboardData, questionario.Titulo);

            return File(
                pdfBytes,
                "application/pdf",
                $"dashboard-{id}-{DateTime.Now:yyyyMMdd}.pdf"
            );
        }

        [HttpGet("{id}/relatorio-word")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> GerarRelatorioWord(int id)
        {
            var questionario = await _context.Questionarios.FindAsync(id);
            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            // Buscar dados do dashboard
            var dashboardData = await GetDashboardDataInternal(id);
            if (dashboardData == null)
                return NotFound(new { message = "Nenhum dado encontrado para este questionário" });

            // Gerar relatório Word
            var reportService = HttpContext.RequestServices.GetRequiredService<ReportService>();
            var wordBytes = reportService.GenerateWordReport(dashboardData, questionario.Titulo);

            return File(
                wordBytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                $"dashboard-{id}-{DateTime.Now:yyyyMMdd}.docx"
            );
        }

        private async Task<object> GetDashboardDataInternal(int id)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios)
                    .ThenInclude(qq => qq.Questao)
                        .ThenInclude(q => q.Opcoes)
                .FirstOrDefaultAsync(q => q.Id == id);
            if (questionario == null)
                return null;

            // Buscar todos os convites respondidos para este questionário
            var convitesRespondidos = await _context.ConvitesQuestionarios
                .Where(c => c.QuestionarioId == id && c.Respondido)
                .Select(c => new { c.AlunoId, c.QuestionarioId })
                .ToListAsync();

            // Extrair apenas os IDs dos alunos que responderam
            var alunosRespondidos = convitesRespondidos.Select(c => c.AlunoId).ToList();

            // Buscar todas as respostas do questionário APENAS de quem respondeu via convite
            var respostas = await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                    .ThenInclude(rq => rq.Questao)
                .Include(r => r.Aluno)
                    .ThenInclude(a => a.Curso)
                .Where(r => r.QuestionarioId == id && alunosRespondidos.Contains(r.AlunoId))
                .OrderBy(r => r.DataResposta)
                .ToListAsync();

            if (!respostas.Any())
                return null;

            // Tendência de respostas por dia
            var tendenciaRespostas = respostas
                .GroupBy(r => r.DataResposta.Date)
                .OrderBy(g => g.Key)
                .Select(g => new
                {
                    data = g.Key.ToString("MMM dd"),
                    quantidade = g.Count()
                })
                .ToList();

            // Calcular NPS (Net Promoter Score)
            var questoesNPS = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.Questao.Tipo == TipoQuestao.EscalaLinear && rq.Valor != null)
                .ToList();

            var npsScores = questoesNPS
                .Select(rq => int.Parse(rq.Valor))
                .ToList();

            var promotores = npsScores.Count(s => s >= 9 && s <= 10);
            var detratores = npsScores.Count(s => s >= 0 && s <= 6);
            var passivos = npsScores.Count(s => s >= 7 && s <= 8);
            var totalNPS = npsScores.Count;

            var npsGeral = totalNPS > 0 ? Math.Round(((double)(promotores - detratores) / totalNPS) * 100, 0) : 0;

            // Cálculo da média de satisfação para questão múltipla escolha (exemplo QuestaoId = 22)
            var questaoSatisfacao = _context.Questoes
                .Include(q => q.Opcoes)
                .FirstOrDefault(q => q.Id == 21);

            var opcoesSatisfacao = questaoSatisfacao?.Opcoes.OrderBy(o => o.Ordem).ToList() ?? new List<OpcaoQuestao>();

            var questoesSatisfacaoMultipla = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 21 && rq.OpcaoId != null)
                .ToList();

            // Agrupa as respostas por opção para mostrar no gráfico
            var respostasPorOpcaoSatisfacao = questoesSatisfacaoMultipla
                .GroupBy(rq => rq.OpcaoId)
                .Select(g =>
                {
                    var opcao = opcoesSatisfacao.FirstOrDefault(o => o.Id == g.Key);
                    var peso = opcao != null ? opcao.Peso : 0;
                    return new
                    {
                        opcaoId = g.Key,
                        opcaoNome = opcao?.Texto ?? "",
                        peso = peso,
                        quantidade = g.Count(),
                        percentual = questoesSatisfacaoMultipla.Count > 0 ? Math.Round((double)g.Count() / questoesSatisfacaoMultipla.Count * 100, 1) : 0
                    };
                })
                .OrderBy(x => x.peso)
                .ToList();

            var valoresSatisfacao = questoesSatisfacaoMultipla
                .Select(rq =>
                {
                    var opcao = opcoesSatisfacao.FirstOrDefault(o => o.Id == rq.OpcaoId);
                    return opcao != null ? (opcao.Peso != 0 ? opcao.Peso : (opcoesSatisfacao.IndexOf(opcao) + 1)) : (int?)null;
                })
                .Where(v => v.HasValue)
                .Select(v => v.Value)
                .ToList();

            double mediaSatisfacao = valoresSatisfacao.Count > 0 ? Math.Round(valoresSatisfacao.Average(), 1) : 0;

            // Satisfação por curso (questão 22)
            var questaoSatisfacaoCurso = _context.Questoes
                .Include(q => q.Opcoes)
                .FirstOrDefault(q => q.Id == 22);

            var opcoesSatisfacaoCurso = questaoSatisfacaoCurso?.Opcoes.OrderBy(o => o.Ordem).ToList() ?? new List<OpcaoQuestao>();

            var respostasPorCurso = respostas
                .SelectMany(r => r.RespostasQuestoes, (r, rq) => new { r, rq })
                .Where(x => x.rq.QuestaoId == 22 && x.rq.OpcaoId != null && x.r.Aluno?.Curso != null)
                .GroupBy(x => x.r.Aluno.Curso.Nome)
                .ToList();

            var satisfacaoPorCurso = respostasPorCurso.Select(g =>
            {
                var total = g.Count();
                int GetPeso(int? opcaoId)
                {
                    var opcao = opcoesSatisfacaoCurso.FirstOrDefault(o => o.Id == opcaoId);
                    return opcao != null ? (opcao.Peso != 0 ? opcao.Peso : (opcoesSatisfacaoCurso.IndexOf(opcao) + 1)) : 0;
                }
                var muitoInsatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 1);
                var insatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 2);
                var nemSatisfeitoNemInsatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 3);
                var satisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 4);
                var muitoSatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 5);
                double media = total > 0 ? Math.Round((g.Select(x => GetPeso(x.rq.OpcaoId)).Where(p => p > 0).DefaultIfEmpty(0).Average()), 1) : 0;
                return new
                {
                    curso = g.Key,
                    total,
                    muitoInsatisfeito,
                    insatisfeito,
                    nemSatisfeitoNemInsatisfeito,
                    satisfeito,
                    muitoSatisfeito,
                    percentuais = new
                    {
                        muitoInsatisfeito = total > 0 ? Math.Round((double)muitoInsatisfeito / total * 100, 1) : 0,
                        insatisfeito = total > 0 ? Math.Round((double)insatisfeito / total * 100, 1) : 0,
                        nemSatisfeitoNemInsatisfeito = total > 0 ? Math.Round((double)nemSatisfeitoNemInsatisfeito / total * 100, 1) : 0,
                        satisfeito = total > 0 ? Math.Round((double)satisfeito / total * 100, 1) : 0,
                        muitoSatisfeito = total > 0 ? Math.Round((double)muitoSatisfeito / total * 100, 1) : 0
                    },
                    satisfacao = media
                };
            }).ToList();

            // Comentários das questões 19 e 23
            var comentariosQ19 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 19 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => new
                {
                    texto = rq.Valor,
                    curso = rq.Resposta.Aluno.Curso.Nome,
                    nota = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average(),
                    tipo = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() >= 9 ? "Promotor" :
                        rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() <= 6 ? "Detrator" : "Passivo"
                })
                .ToList();

            var comentariosQ23 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 23 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => new
                {
                    texto = rq.Valor,
                    curso = rq.Resposta.Aluno.Curso.Nome,
                    nota = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average(),
                    tipo = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() >= 9 ? "Promotor" :
                        rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() <= 6 ? "Detrator" : "Passivo"
                })
                .ToList();

            return new
            {
                totalRespostas = respostas.Count,
                tendenciaRespostas = tendenciaRespostas,
                npsGeral = npsGeral,
                npsDetalhamento = new
                {
                    passivo = totalNPS > 0 ? Math.Round((double)passivos / totalNPS * 100, 0) : 0,
                    promotor = totalNPS > 0 ? Math.Round((double)promotores / totalNPS * 100, 0) : 0,
                    detrator = totalNPS > 0 ? Math.Round((double)detratores / totalNPS * 100, 0) : 0
                },
                satisfacao = mediaSatisfacao,
                satisfacaoDetalhamento = new
                {
                    muitoInsatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.peso == 1).Sum(x => x.percentual),
                    insatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.peso == 2).Sum(x => x.percentual),
                    nemInsatisfeitoNemSatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.peso == 3).Sum(x => x.percentual),
                    satisfeito = respostasPorOpcaoSatisfacao.Where(x => x.peso == 4).Sum(x => x.percentual),
                    muitoSatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.peso == 5).Sum(x => x.percentual)
                },
                satisfacaoPorCurso = satisfacaoPorCurso,
                comentariosQ19 = comentariosQ19,
                comentariosQ23 = comentariosQ23
            };
        }

        private bool QuestionarioExists(int id)
        {
            return _context.Questionarios.Any(e => e.Id == id);
        }

        [HttpPost("{id}/relatorio-pdf-html")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> GerarRelatorioPdfHtml(int id)
        {
            var questionario = await _context.Questionarios.FindAsync(id);
            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            var form = Request.Form;
            var htmlContent = form["htmlContent"].FirstOrDefault();
            var formTitle = form["formTitle"].FirstOrDefault() ?? questionario.Titulo;

            if (string.IsNullOrEmpty(htmlContent))
                return BadRequest(new { message = "Conteúdo HTML não fornecido" });

            // Gerar relatório PDF com HTML
            var reportService = HttpContext.RequestServices.GetRequiredService<ReportService>();
            var pdfBytes = reportService.GeneratePdfReportFromHtml(htmlContent, formTitle);

            return File(
                pdfBytes,
                "application/pdf",
                $"dashboard-{id}-{DateTime.Now:yyyyMMdd}.pdf"
            );
        }

        [HttpPost("{id}/relatorio-word-html")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> GerarRelatorioWordHtml(int id)
        {
            var questionario = await _context.Questionarios.FindAsync(id);
            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            var form = Request.Form;
            var htmlContent = form["htmlContent"].FirstOrDefault();
            var formTitle = form["formTitle"].FirstOrDefault() ?? questionario.Titulo;

            if (string.IsNullOrEmpty(htmlContent))
                return BadRequest(new { message = "Conteúdo HTML não fornecido" });

            // Gerar relatório Word com HTML
            var reportService = HttpContext.RequestServices.GetRequiredService<ReportService>();
            var wordBytes = reportService.GenerateWordReportFromHtml(htmlContent, formTitle);

            return File(
                wordBytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                $"dashboard-{id}-{DateTime.Now:yyyyMMdd}.docx"
            );
        }
    }
}