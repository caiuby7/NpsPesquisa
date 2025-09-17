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

            if (questionario.DataFim < DateTime.UtcNow)
                return BadRequest(new { message = "Este questionário já expirou" });

            var questoes = questionario.QuestoesQuestionarios
                .OrderBy(qq => qq.Ordem)
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

            // Sempre usar a ordem definida nas questões
            questoes = questoes.OrderBy(q => questionario.QuestoesQuestionarios
                .First(qq => qq.QuestaoId == q.QuestaoId).Ordem);

            return new
            {
                questionario.Id,
                questionario.Titulo,
                questionario.Descricao,
                questionario.DataInicio,
                questionario.DataFim,
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
                .Include(r => r.Participante)
                    .ThenInclude(p => p.Aluno)
                .Where(r => r.QuestionarioId == id)
                .OrderByDescending(r => r.DataResposta)
                .ToListAsync();
        }

        [HttpGet("regras-avaliacao")]
        [AllowAnonymous]
        public ActionResult<object> GetRegrasAvaliacao()
        {
            var regras = RegrasAvaliacao.ObterTodasCombinacoesValidas();
            var tiposParticipantes = Enum.GetValues<TipoParticipante>();
            var tiposItens = Enum.GetValues<TipoItemAvaliado>();

            return new
            {
                Regras = regras,
                TiposParticipantes = tiposParticipantes.Select(tp => new
                {
                    Valor = tp,
                    Nome = tp.ToString(),
                    ItensValidos = RegrasAvaliacao.ObterItensValidosParaParticipante(tp)
                }),
                TiposItens = tiposItens.Select(ti => new
                {
                    Valor = ti,
                    Nome = ti.ToString(),
                    ParticipantesValidos = RegrasAvaliacao.ObterParticipantesValidosParaItem(ti)
                })
            };
        }

        [HttpGet("debug-itens-avaliados/{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> DebugItensAvaliados(int id)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.ItensAvaliados)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            return Ok(new
            {
                questionarioId = questionario.Id,
                titulo = questionario.Titulo,
                tipoItemAvaliado = questionario.TipoItemAvaliado,
                itensAvaliadosCount = questionario.ItensAvaliados?.Count ?? 0,
                itensAvaliados = questionario.ItensAvaliados?.Select(ia => new
                {
                    id = ia.Id,
                    tipoItemAvaliado = ia.TipoItemAvaliado,
                    nomeItemEspecifico = ia.NomeItemEspecifico,
                    ativo = ia.Ativo,
                    ordemApresentacao = ia.OrdemApresentacao
                }).ToList()
            });
        }

        [HttpGet("debug-disciplinas-aluno/{alunoId}")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> DebugDisciplinasAluno(int alunoId)
        {
            var aluno = await _context.Alunos
                .Include(a => a.TurmasDisciplinas)
                    .ThenInclude(td => td.Disciplina)
                .Include(a => a.TurmasDisciplinas)
                    .ThenInclude(td => td.Professor)
                .FirstOrDefaultAsync(a => a.AlunoId == alunoId);

            if (aluno == null)
                return NotFound(new { message = "Aluno não encontrado" });

            var disciplinas = aluno.TurmasDisciplinas
                .Where(td => td.Ativo)
                .Select(td => new
                {
                    id = td.DisciplinaId,
                    nome = td.Disciplina.Nome,
                    professor = td.Professor.Nome,
                    turmaId = td.TurmaId,
                    ativo = td.Ativo
                })
                .Distinct()
                .ToList();

            return Ok(new
            {
                alunoId = aluno.AlunoId,
                alunoNome = aluno.Nome,
                disciplinasCount = disciplinas.Count,
                disciplinas = disciplinas
            });
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
                .Select(c => c.ParticipanteId)
                .ToListAsync();

            // Contar respostas APENAS de quem respondeu via convite
            var convitesRespondidos = await _context.Respostas
                 .Where(r => r.QuestionarioId == id && convitesRespondido.Contains(r.ParticipanteId))
                 .Select(r => r.ParticipanteId)
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
            if (questionario.DataFim < DateTime.UtcNow)
                return BadRequest(new { message = "A data de expiração deve ser maior que a data atual" });

            // Validação das regras de avaliação institucional
            if (questionario.Tipo == TipoQuestionario.AvaliacaoInstitucional)
            {
                if (questionario.TipoItemAvaliado == null)
                    return BadRequest(new { message = "Para avaliação institucional, é obrigatório selecionar um tipo de item a ser avaliado" });

                if (string.IsNullOrWhiteSpace(questionario.NomeItemEspecifico))
                    return BadRequest(new { message = "Para avaliação institucional, é obrigatório informar o nome do item específico" });
            }

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

            if (questionario.DataFim < DateTime.UtcNow)
                return BadRequest(new { message = "A data de expiração deve ser maior que a data atual" });

            // Validação das regras de avaliação institucional
            if (questionario.Tipo == TipoQuestionario.AvaliacaoInstitucional)
            {
                if (questionario.TipoItemAvaliado == null)
                    return BadRequest(new { message = "Para avaliação institucional, é obrigatório selecionar um tipo de item a ser avaliado" });

                if (string.IsNullOrWhiteSpace(questionario.NomeItemEspecifico))
                    return BadRequest(new { message = "Para avaliação institucional, é obrigatório informar o nome do item específico" });
            }

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
            if (questionarioDto.DataFim < DateTime.UtcNow)
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
                DataInicio = questionarioDto.DataInicio,
                DataFim = questionarioDto.DataFim,
                Tipo = questionarioDto.Tipo,
                PermitirComentarios = questionarioDto.PermitirComentarios,
                PermitirSalvarAndamento = questionarioDto.PermitirSalvarAndamento,
                TipoItemAvaliado = questionarioDto.TipoItemAvaliado,
                NomeItemEspecifico = questionarioDto.NomeItemEspecifico,
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

            if (questionarioDto.DataFim < DateTime.UtcNow)
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
            questionario.DataInicio = questionarioDto.DataInicio;
            questionario.DataFim = questionarioDto.DataFim;
            questionario.Tipo = questionarioDto.Tipo;
            questionario.PermitirComentarios = questionarioDto.PermitirComentarios;
            questionario.PermitirSalvarAndamento = questionarioDto.PermitirSalvarAndamento;
            questionario.TipoItemAvaliado = questionarioDto.TipoItemAvaliado;
            questionario.NomeItemEspecifico = questionarioDto.NomeItemEspecifico;
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

            // Verifica se os participantes existem
            var participantesExistentes = await _context.Participantes
                .Where(p => participantesIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            var participantesNaoEncontrados = participantesIds
                .Except(participantesExistentes)
                .ToList();

            if (participantesNaoEncontrados.Any())
                return BadRequest(new { message = $"Os seguintes participantes não foram encontrados: {string.Join(", ", participantesNaoEncontrados)}" });

            // Adiciona os participantes
            foreach (var participanteId in participantesIds)
            {
                var participante = new ParticipanteQuestionario
                {
                    QuestionarioId = id,
                    ParticipanteId = participanteId,
                    Status = "Pendente" // Status padrão para novos participantes
                };
                _context.ParticipantesQuestionarios.Add(participante);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/participantes-completos")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> AdicionarParticipantesCompletos(int id, [FromBody] List<ParticipanteAvaliacaoDto> participantesData)
        {
            try
            {
                var questionario = await _context.Questionarios
                    .Include(q => q.Respostas)
                    .FirstOrDefaultAsync(q => q.Id == id);

                if (questionario == null)
                    return NotFound(new { message = "Questionário não encontrado" });

                var participantesAdicionados = new List<object>();
                var participantesCriados = new List<object>();

                foreach (var participanteData in participantesData)
                {
                    if (participanteData == null)
                    {
                        return BadRequest(new { message = "Dados do participante não podem ser nulos" });
                    }

                    if (participanteData.Id <= 0 || string.IsNullOrEmpty(participanteData.Nome))
                    {
                        return BadRequest(new { message = "ID e nome do participante são obrigatórios" });
                    }

                    // Verifica se já existe um participante com esse ID original baseado no tipo
                    Participante? participanteExistente = null;
                    var tipoParticipanteString = participanteData.Tipo?.ToLower();
                    
                    if (tipoParticipanteString == "professor")
                    {
                        participanteExistente = await _context.Participantes
                            .FirstOrDefaultAsync(p => p.ProfessorId == participanteData.Id);
                    }
                    else if (tipoParticipanteString == "aluno")
                    {
                        participanteExistente = await _context.Participantes
                            .FirstOrDefaultAsync(p => p.AlunoId == participanteData.Id);
                    }
                    else if (tipoParticipanteString == "coordenador")
                    {
                        participanteExistente = await _context.Participantes
                            .FirstOrDefaultAsync(p => p.CoordenadorId == participanteData.Id);
                    }

                    int participanteIdFinal;

                    // Se não existe, cria um novo participante
                    if (participanteExistente == null)
                    {
                        // Determina o tipo de participante
                        TipoParticipante tipoParticipante;
                        switch (tipoParticipanteString)
                        {
                            case "professor":
                                tipoParticipante = TipoParticipante.Professor;
                                break;
                            case "aluno":
                                tipoParticipante = TipoParticipante.Aluno;
                                break;
                            case "coordenador":
                                tipoParticipante = TipoParticipante.Coordenador;
                                break;
                            default:
                                return BadRequest(new { message = $"Tipo de participante inválido: {participanteData.Tipo}" });
                        }

                        // Cria o novo participante com referência ao ID original
                        var novoParticipante = new Participante
                        {
                            Nome = participanteData.Nome,
                            Email = participanteData.Email ?? "",
                            Tipo = tipoParticipante,
                            Ativo = true,
                            DataCadastro = DateTime.UtcNow,
                            // Armazena o ID original baseado no tipo
                            ProfessorId = participanteData.Tipo?.ToLower() == "professor" ? participanteData.Id : null,
                            AlunoId = participanteData.Tipo?.ToLower() == "aluno" ? participanteData.Id : null,
                            CoordenadorId = participanteData.Tipo?.ToLower() == "coordenador" ? participanteData.Id : null
                        };

                        _context.Participantes.Add(novoParticipante);
                        await _context.SaveChangesAsync();
                        
                        participanteIdFinal = novoParticipante.Id;
                        participantesCriados.Add(new { 
                            id = novoParticipante.Id,
                            idOriginal = participanteData.Id, // ID original para referência
                            nome = novoParticipante.Nome,
                            email = novoParticipante.Email,
                            tipo = participanteData.Tipo
                        });
                    }
                    else
                    {
                        // Usar o participante existente
                        participanteIdFinal = participanteExistente.Id;
                    }

                    // Verifica se já existe associação com o questionário
                    var associacaoExistente = await _context.ParticipantesQuestionarios
                        .FirstOrDefaultAsync(pq => pq.QuestionarioId == id && pq.ParticipanteId == participanteIdFinal);

                    if (associacaoExistente != null)
                    {
                        return BadRequest(new { message = $"O participante {participanteData.Nome} já está associado ao questionário" });
                    }

                    // Cria a associação
                    var participanteQuestionario = new ParticipanteQuestionario
                    {
                        QuestionarioId = id,
                        ParticipanteId = participanteIdFinal,
                        Status = "Pendente"
                    };
                    _context.ParticipantesQuestionarios.Add(participanteQuestionario);
                    
                    participantesAdicionados.Add(new { 
                        questionarioId = id, 
                        participanteId = participanteIdFinal,
                        nome = participanteData.Nome,
                        status = "Pendente"
                    });
                }

                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Participantes adicionados com sucesso",
                    participantesAdicionados = participantesAdicionados,
                    participantesCriados = participantesCriados
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpGet("participante-por-id-original/{tipo}/{idOriginal}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> BuscarParticipantePorIdOriginal(string tipo, int idOriginal)
        {
            try
            {
                Participante? participante = null;

                switch (tipo.ToLower())
                {
                    case "professor":
                        participante = await _context.Participantes
                            .FirstOrDefaultAsync(p => p.ProfessorId == idOriginal);
                        break;
                    case "aluno":
                        participante = await _context.Participantes
                            .FirstOrDefaultAsync(p => p.AlunoId == idOriginal);
                        break;
                    case "coordenador":
                        participante = await _context.Participantes
                            .FirstOrDefaultAsync(p => p.CoordenadorId == idOriginal);
                        break;
                    default:
                        return BadRequest(new { message = "Tipo de participante inválido" });
                }

                if (participante == null)
                {
                    return NotFound(new { message = "Participante não encontrado" });
                }

                return Ok(new
                {
                    id = participante.Id,
                    idOriginal = idOriginal,
                    nome = participante.Nome,
                    email = participante.Email,
                    tipo = participante.Tipo,
                    ativo = participante.Ativo,
                    dataCadastro = participante.DataCadastro
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        // Endpoint temporário para teste sem autenticação
        [HttpPost("{id}/participantes-teste")]
        [AllowAnonymous]
        public async Task<IActionResult> AdicionarParticipantesTeste(int id, [FromBody] List<object> participantesData)
        {
            try
            {
                var questionario = await _context.Questionarios
                    .Include(q => q.Respostas)
                    .FirstOrDefaultAsync(q => q.Id == id);

                if (questionario == null)
                    return NotFound(new { message = "Questionário não encontrado" });

                var participantesAdicionados = new List<object>();
                var participantesCriados = new List<object>();

                foreach (var participanteData in participantesData)
                {
                    // Converte o objeto dinâmico para um dicionário para facilitar o acesso
                    var dataDict = participanteData as Newtonsoft.Json.Linq.JObject;
                    if (dataDict == null)
                    {
                        return BadRequest(new { message = "Formato de dados inválido" });
                    }

                    var participanteId = dataDict["id"]?.ToObject<int>();
                    var nome = dataDict["nome"]?.ToObject<string>();
                    var email = dataDict["email"]?.ToObject<string>();
                    var tipo = dataDict["tipo"]?.ToObject<string>();
                    var ativo = dataDict["ativo"]?.ToObject<bool>() ?? true;
                    var cursoId = dataDict["cursoId"]?.ToObject<int?>();
                    var matricula = dataDict["matricula"]?.ToObject<string>();

                    if (!participanteId.HasValue)
                    {
                        return BadRequest(new { message = "ID do participante é obrigatório" });
                    }

                    // Verifica se já existe um participante com esse ID
                    var participanteExistente = await _context.Participantes
                        .FirstOrDefaultAsync(p => p.Id == participanteId.Value);

                    int participanteIdFinal = participanteId.Value;

                    // Se não existe, tenta criar baseado no tipo (Aluno, Professor, etc.)
                    if (participanteExistente == null)
                    {
                        // Tenta encontrar um aluno com esse ID
                        var aluno = await _context.Alunos
                            .Include(a => a.Curso)
                            .FirstOrDefaultAsync(a => a.Id == participanteId.Value);

                        if (aluno != null)
                        {
                            // Cria o participante baseado no aluno
                            var novoParticipante = new Participante
                            {
                                Nome = nome ?? aluno.Nome,
                                Email = email ?? aluno.Email,
                                Tipo = TipoParticipante.Aluno,
                                Ativo = ativo,
                                CursoId = cursoId ?? aluno.CursoId,
                                AlunoId = aluno.Id,
                                DataCadastro = DateTime.UtcNow
                            };

                            _context.Participantes.Add(novoParticipante);
                            await _context.SaveChangesAsync();
                            
                            participanteIdFinal = novoParticipante.Id;
                            participantesCriados.Add(new { 
                                id = novoParticipante.Id,
                                nome = novoParticipante.Nome,
                                email = novoParticipante.Email,
                                tipo = "Aluno",
                                alunoId = aluno.Id
                            });
                        }
                        else
                        {
                            return BadRequest(new { message = $"Não foi possível encontrar aluno com ID {participanteId.Value}" });
                        }
                    }

                    // Verifica se já existe associação com o questionário
                    var associacaoExistente = await _context.ParticipantesQuestionarios
                        .FirstOrDefaultAsync(pq => pq.QuestionarioId == id && pq.ParticipanteId == participanteIdFinal);

                    if (associacaoExistente != null)
                    {
                        return BadRequest(new { message = $"O participante {participanteIdFinal} já está associado ao questionário" });
                    }

                    // Cria a associação
                    var participanteQuestionario = new ParticipanteQuestionario
                    {
                        QuestionarioId = id,
                        ParticipanteId = participanteIdFinal,
                        Status = "Pendente"
                    };
                    _context.ParticipantesQuestionarios.Add(participanteQuestionario);
                    
                    participantesAdicionados.Add(new { 
                        questionarioId = id, 
                        participanteId = participanteIdFinal,
                        status = "Pendente"
                    });
                }

                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Participantes adicionados com sucesso",
                    participantesAdicionados = participantesAdicionados,
                    participantesCriados = participantesCriados
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpPost("{id}/gerar-convites")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> GerarConvites(int id)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.Participantes)
                .ThenInclude(p => p.Participante)
                .ThenInclude(p => p.Aluno)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            if (!questionario.Participantes.Any())
                return BadRequest(new { message = "Não há participantes para este questionário" });

            foreach (var participante in questionario.Participantes)
            {
                // Verifica se já existe convite para este participante/questionário
                var conviteExistente = await _context.ConvitesQuestionarios
                    .FirstOrDefaultAsync(c => c.QuestionarioId == id && c.ParticipanteId == participante.ParticipanteId);

                if (conviteExistente == null)
                {
                    var chave = Guid.NewGuid().ToString("N");
                    var convite = new ConviteQuestionario
                    {
                        QuestionarioId = id,
                        ParticipanteId = participante.ParticipanteId,
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
                    // Obter nome e email baseado no tipo do participante
                    string nome = participante.Participante.Nome;
                    string email = participante.Participante.Email;
                    
                    // Se for aluno, usar dados específicos do aluno se disponíveis
                    if (participante.Participante.Tipo == TipoParticipante.Aluno && participante.Participante.Aluno != null)
                    {
                        nome = participante.Participante.Aluno.Nome;
                        email = participante.Participante.Aluno.Email;
                    }
                    
                    var emailBody = template
                        .Replace("{{nome}}", nome)
                        .Replace("{{titulo}}", questionario.Titulo).Replace("{titulo}", questionario.Titulo)
                        .Replace("{{link}}", link).Replace("{link}", link);

                    await _emailService.SendEmailAsync(email, "QUAL A SUA SATISFAÇÃO COM A CATÓLICA SC?", emailBody);
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
                .Include(c => c.Questionario)
                    .ThenInclude(q => q.ItensAvaliados)
                .Include(c => c.Participante)
                    .ThenInclude(p => p.Aluno)
                        .ThenInclude(a => a.Curso)
                .Include(c => c.Participante)
                    .ThenInclude(p => p.Professor)
                        .ThenInclude(prof => prof.Instituicao)
                .Include(c => c.Participante)
                    .ThenInclude(p => p.Coordenador)
                .FirstOrDefaultAsync(c => c.Chave == chave);

            if (convite == null)
                return NotFound(new { message = "Convite não encontrado" });

            if (convite.DataResposta.HasValue)
                return BadRequest(new { message = "Este questionário já foi respondido" });

            if (DateTime.UtcNow < convite.Questionario.DataInicio || DateTime.UtcNow > convite.Questionario.DataFim)
                return BadRequest(new { message = "O período para responder este questionário está encerrado" });

            // Usar o questionário já carregado com Include
            var questionario = convite.Questionario;
            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            // Obter todas as questões principais do questionário
            var questoesPrincipais = questionario.QuestoesQuestionarios
                .OrderBy(qq => qq.Ordem)
                .Select(qq => qq.Questao)
                .ToList();

            // Obter IDs das questões condicionais referenciadas pelas opções
            var questoesCondicionaisIds = questoesPrincipais
                .SelectMany(q => q.Opcoes)
                .Where(o => o.AtivaCondicao && o.QuestaoCondicionalId.HasValue)
                .Select(o => o.QuestaoCondicionalId.Value)
                .Distinct()
                .ToList();

            // Buscar as questões condicionais
            var questoesCondicionais = await _context.Questoes
                .Include(x => x.Opcoes)
                .Where(q => questoesCondicionaisIds.Contains(q.Id))
                .ToListAsync();

            // Criar dicionário para acesso rápido às questões condicionais
            var questoesCondicionaisDict = questoesCondicionais.ToDictionary(q => q.Id);

            // NOVA LÓGICA: Buscar contextos específicos salvos na tabela ParticipanteQuestionario
            var contextosAvaliacao = await _context.ParticipantesQuestionarios
                .Where(pq => pq.QuestionarioId == questionario.Id && pq.ParticipanteId == convite.ParticipanteId)
                .Include(pq => pq.Curso)
                .Include(pq => pq.Turma)
                .Include(pq => pq.Disciplina)
                .Include(pq => pq.Professor)
                .Include(pq => pq.Instituicao)
                .Include(pq => pq.PeriodoLetivo)
                .ToListAsync();

            // Se não há contextos específicos, usar lógica de fallback para compatibilidade
            var itensAvaliados = new List<object>();

            if (contextosAvaliacao.Any())
            {
                // Usar contextos específicos salvos
                itensAvaliados = contextosAvaliacao
                    .Where(pq => pq.TipoItemAvaliado == questionario.TipoItemAvaliado)
                    .Select(pq => new
                    {
                        id = pq.ItemAvaliadoId ?? pq.Id,
                        tipoItemAvaliado = pq.TipoItemAvaliado?.ToString(),
                        nomeItemEspecifico = pq.NomeItemEspecifico ??
                            (pq.Disciplina?.Nome ?? pq.Turma?.Nome ?? pq.Curso?.Nome ?? "Item"),
                        descricaoItem = pq.ContextoDescricao,
                        itemAvaliadoId = pq.ItemAvaliadoId,
                        ativo = true,
                        ordemApresentacao = 0,
                        // IDs específicos baseados no contexto
                        professorId = pq.ProfessorId,
                        disciplinaId = pq.DisciplinaId,
                        turmaDisciplinaId = pq.TurmaId,
                        cursoId = pq.CursoId,
                        turmaId = pq.TurmaId,
                        coordenadorId = (int?)null,
                        instituicaoId = pq.InstituicaoId,
                        periodoLetivoId = pq.PeriodoLetivoId
                    })
                    .Cast<object>()
                    .ToList();
            }

            // FALLBACK: Usar lógica antiga para compatibilidade com questionários antigos
            if (!contextosAvaliacao.Any())
            {
                switch (questionario.TipoItemAvaliado)
                {
                    case TipoItemAvaliado.Disciplina:
                        if (convite.Participante.Tipo == TipoParticipante.Aluno)
                        {
                            // Carregar o Aluno se ainda não foi carregado
                            if (convite.Participante.Aluno == null)
                            {
                                await _context.Entry(convite.Participante)
                                    .Reference(p => p.Aluno)
                                    .LoadAsync();
                            }

                            // Para disciplinas do aluno, buscar as disciplinas do aluno
                            if (convite.Participante.Aluno != null)
                            {
                                await _context.Entry(convite.Participante.Aluno)
                                    .Collection(a => a.TurmasDisciplinas)
                                    .LoadAsync();

                                await _context.Entry(convite.Participante.Aluno)
                                    .Collection(a => a.TurmasDisciplinas)
                                    .Query()
                                    .Include(td => td.Disciplina)
                                    .Include(td => td.Professor)
                                    .LoadAsync();
                            }

                            if (convite.Participante.Aluno != null)
                            {
                                itensAvaliados = convite.Participante.Aluno.TurmasDisciplinas
                                    .Where(td => td.Ativo)
                                    .Select(td => new
                                    {
                                        id = td.Id,
                                        tipoItemAvaliado = "Disciplina",
                                        nomeItemEspecifico = td.Disciplina.Nome,
                                        descricaoItem = $"Disciplina: {td.Disciplina.Nome} - Professor: {td.Professor.Nome}",
                                        itemAvaliadoId = td.Id,
                                        ativo = td.Ativo,
                                        ordemApresentacao = 0,
                                        // IDs específicos baseados no tipo
                                        professorId = td.ProfessorId,
                                        disciplinaId = td.DisciplinaId,
                                        turmaDisciplinaId = td.Id,
                                        cursoId = (int?)null,
                                        turmaId = td.TurmaId,
                                        coordenadorId = (int?)null
                                    })
                                    .Distinct()
                                    .OrderBy(ia => ia.nomeItemEspecifico)
                                    .Cast<object>()
                                    .ToList();
                            }
                        }
                        else if (convite.Participante.Tipo == TipoParticipante.Professor)
                        {
                            // Carregar o Professor se ainda não foi carregado
                            if (convite.Participante.Professor == null)
                            {
                                await _context.Entry(convite.Participante)
                                    .Reference(p => p.Professor)
                                    .LoadAsync();
                            }

                            // Para disciplinas do professor, buscar as disciplinas do professor
                            if (convite.Participante.Professor != null)
                            {
                                await _context.Entry(convite.Participante.Professor)
                                    .Collection(p => p.TurmasDisciplinas)
                                    .LoadAsync();

                                await _context.Entry(convite.Participante.Professor)
                                    .Collection(p => p.TurmasDisciplinas)
                                    .Query()
                                    .Include(td => td.Disciplina)
                                    .Include(td => td.Turma)
                                    .LoadAsync();
                            }

                            if (convite.Participante.Professor != null)
                            {
                                itensAvaliados = convite.Participante.Professor.TurmasDisciplinas
                                    .Where(td => td.Ativo)
                                    .Select(td => new
                                    {
                                        id = td.Id,
                                        tipoItemAvaliado = "Disciplina",
                                        nomeItemEspecifico = td.Disciplina.Nome,
                                        descricaoItem = $"Disciplina: {td.Disciplina.Nome} - Turma: {td.Turma.Nome}",
                                        itemAvaliadoId = td.Id,
                                        ativo = td.Ativo,
                                        ordemApresentacao = 0,
                                        // IDs específicos baseados no tipo
                                        professorId = td.ProfessorId,
                                        disciplinaId = td.DisciplinaId,
                                        turmaDisciplinaId = td.Id,
                                        cursoId = (int?)null,
                                        turmaId = td.TurmaId,
                                        coordenadorId = (int?)null
                                    })
                                    .Distinct()
                                    .OrderBy(ia => ia.nomeItemEspecifico)
                                    .Cast<object>()
                                    .ToList();
                            }
                        }
                        break;

                    case TipoItemAvaliado.Curso:
                        // Para cursos, buscar informações do curso do participante
                        if (convite.Participante.Tipo == TipoParticipante.Aluno && convite.Participante.Aluno != null)
                        {
                            await _context.Entry(convite.Participante.Aluno)
                                .Reference(a => a.Curso)
                                .LoadAsync();

                            if (convite.Participante.Aluno.Curso != null)
                            {
                                itensAvaliados = new List<object>
                            {
                                new
                                {
                                    id = convite.Participante.Aluno.Curso.Id,
                                    tipoItemAvaliado = "Curso",
                                    nomeItemEspecifico = convite.Participante.Aluno.Curso.Nome,
                                    descricaoItem = $"Curso: {convite.Participante.Aluno.Curso.Nome}",
                                    itemAvaliadoId = convite.Participante.Aluno.Curso.Id,
                                    ativo = true,
                                    ordemApresentacao = 0,
                                    professorId = (int?)null,
                                    disciplinaId = (int?)null,
                                    turmaDisciplinaId = (int?)null,
                                    cursoId = convite.Participante.Aluno.Curso.Id,
                                    turmaId = (int?)null,
                                    coordenadorId = (int?)null
                                }
                            };
                            }
                        }
                        break;

                    case TipoItemAvaliado.Infraestrutura:
                        // Para Infraestrutura, buscar o nome da instituição do participante
                        string nomeInstituicao = "Instituição";
                        int? instituicaoId = null;

                        if (convite.Participante.Tipo == TipoParticipante.Aluno && convite.Participante.Aluno != null)
                        {
                            await _context.Entry(convite.Participante.Aluno)
                                .Reference(a => a.Instituicao)
                                .LoadAsync();

                            if (convite.Participante.Aluno.Instituicao != null)
                            {
                                nomeInstituicao = convite.Participante.Aluno.Instituicao.Nome;
                                instituicaoId = convite.Participante.Aluno.Instituicao.Id;
                            }
                        }
                        else if (convite.Participante.Tipo == TipoParticipante.Professor && convite.Participante.Professor != null)
                        {
                            await _context.Entry(convite.Participante.Professor)
                                .Reference(p => p.Instituicao)
                                .LoadAsync();

                            if (convite.Participante.Professor.Instituicao != null)
                            {
                                nomeInstituicao = convite.Participante.Professor.Instituicao.Nome;
                                instituicaoId = convite.Participante.Professor.Instituicao.Id;
                            }
                        }
                        else if (convite.Participante.Tipo == TipoParticipante.Coordenador && convite.Participante.Coordenador != null)
                        {
                            await _context.Entry(convite.Participante.Coordenador)
                                .Collection(c => c.Coordenacoes)
                                .LoadAsync();

                            // Buscar a primeira coordenação ativa
                            var coordenacaoAtiva = convite.Participante.Coordenador.Coordenacoes
                                .FirstOrDefault(cc => cc.Ativo);

                            if (coordenacaoAtiva != null)
                            {
                                await _context.Entry(coordenacaoAtiva)
                                    .Reference(cc => cc.Curso)
                                    .LoadAsync();

                                if (coordenacaoAtiva.Curso != null)
                                {
                                    await _context.Entry(coordenacaoAtiva.Curso)
                                        .Reference(c => c.Instituicao)
                                        .LoadAsync();

                                    if (coordenacaoAtiva.Curso.Instituicao != null)
                                    {
                                        nomeInstituicao = coordenacaoAtiva.Curso.Instituicao.Nome;
                                        instituicaoId = coordenacaoAtiva.Curso.Instituicao.Id;
                                    }
                                }
                            }
                        }

                        itensAvaliados = new List<object>
                    {
                        new
                        {
                            id = 1, // ID fictício para Infraestrutura
                            tipoItemAvaliado = "Infraestrutura",
                            nomeItemEspecifico = nomeInstituicao,
                            descricaoItem = $"Infraestrutura: {nomeInstituicao}",
                            itemAvaliadoId = 1, // ID fictício
                            ativo = true,
                            ordemApresentacao = 0,
                            professorId = (int?)null,
                            disciplinaId = (int?)null,
                            turmaDisciplinaId = (int?)null,
                            cursoId = (int?)null,
                            turmaId = (int?)null,
                            coordenadorId = (int?)null,
                            instituicaoId = instituicaoId
                        }
                    };
                        break;

                    case TipoItemAvaliado.Professor:
                    case TipoItemAvaliado.Turma:
                        // Para Turma, buscar as turmas do participante (similar a Disciplina)
                        if (convite.Participante.Tipo == TipoParticipante.Aluno && convite.Participante.Aluno != null)
                        {
                            await _context.Entry(convite.Participante.Aluno)
                                .Collection(a => a.TurmasDisciplinas)
                                .Query()
                                .Include(td => td.Turma)
                                .Include(td => td.Disciplina)
                                .LoadAsync();

                            itensAvaliados = convite.Participante.Aluno.TurmasDisciplinas
                                .Where(td => td.Ativo)
                                .Select(td => new
                                {
                                    id = td.TurmaId,
                                    tipoItemAvaliado = "Turma",
                                    nomeItemEspecifico = td.Turma.Nome,
                                    descricaoItem = $"Turma: {td.Turma.Nome}",
                                    itemAvaliadoId = td.TurmaId,
                                    ativo = td.Ativo,
                                    ordemApresentacao = 0,
                                    professorId = (int?)null,
                                    disciplinaId = (int?)null,
                                    turmaDisciplinaId = (int?)null,
                                    cursoId = td.Turma.CursoId,
                                    turmaId = td.TurmaId,
                                    coordenadorId = (int?)null
                                })
                                .Cast<object>()
                                .ToList();
                        }
                        else if (convite.Participante.Tipo == TipoParticipante.Professor && convite.Participante.Professor != null)
                        {
                            await _context.Entry(convite.Participante.Professor)
                                .Collection(p => p.TurmasDisciplinas)
                                .Query()
                                .Include(td => td.Turma)
                                .Include(td => td.Disciplina)
                                .LoadAsync();

                            itensAvaliados = convite.Participante.Professor.TurmasDisciplinas
                                .Where(td => td.Ativo)
                                .Select(td => new
                                {
                                    id = td.TurmaId,
                                    tipoItemAvaliado = "Turma",
                                    nomeItemEspecifico = td.Turma.Nome,
                                    descricaoItem = $"Turma: {td.Turma.Nome}",
                                    itemAvaliadoId = td.TurmaId,
                                    ativo = td.Ativo,
                                    ordemApresentacao = 0,
                                    professorId = td.ProfessorId,
                                    disciplinaId = (int?)null,
                                    turmaDisciplinaId = (int?)null,
                                    cursoId = td.Turma.CursoId,
                                    turmaId = td.TurmaId,
                                    coordenadorId = (int?)null
                                })
                                .Cast<object>()
                                .ToList();
                        }
                        break;

                    case TipoItemAvaliado.TCC:
                        // Para TCC, usar a mesma lógica da Disciplina
                        if (convite.Participante.Tipo == TipoParticipante.Aluno && convite.Participante.Aluno != null)
                        {
                            await _context.Entry(convite.Participante.Aluno)
                                .Collection(a => a.TurmasDisciplinas)
                                .Query()
                                .Include(td => td.Turma)
                                .Include(td => td.Disciplina)
                                .LoadAsync();

                            itensAvaliados = convite.Participante.Aluno.TurmasDisciplinas
                                .Where(td => td.Ativo)
                                .Select(td => new
                                {
                                    id = td.Id,
                                    tipoItemAvaliado = "TCC",
                                    nomeItemEspecifico = td.Disciplina.Nome,
                                    descricaoItem = $"TCC: {td.Disciplina.Nome}",
                                    itemAvaliadoId = td.Id,
                                    ativo = td.Ativo,
                                    ordemApresentacao = 0,
                                    professorId = td.ProfessorId,
                                    disciplinaId = td.DisciplinaId,
                                    turmaDisciplinaId = td.Id,
                                    cursoId = td.Turma.CursoId,
                                    turmaId = td.TurmaId,
                                    coordenadorId = (int?)null
                                })
                                .Cast<object>()
                                .ToList();
                        }
                        else if (convite.Participante.Tipo == TipoParticipante.Professor && convite.Participante.Professor != null)
                        {
                            await _context.Entry(convite.Participante.Professor)
                                .Collection(p => p.TurmasDisciplinas)
                                .Query()
                                .Include(td => td.Turma)
                                .Include(td => td.Disciplina)
                                .LoadAsync();

                            itensAvaliados = convite.Participante.Professor.TurmasDisciplinas
                                .Where(td => td.Ativo)
                                .Select(td => new
                                {
                                    id = td.Id,
                                    tipoItemAvaliado = "TCC",
                                    nomeItemEspecifico = td.Disciplina.Nome,
                                    descricaoItem = $"TCC: {td.Disciplina.Nome}",
                                    itemAvaliadoId = td.Id,
                                    ativo = td.Ativo,
                                    ordemApresentacao = 0,
                                    professorId = td.ProfessorId,
                                    disciplinaId = td.DisciplinaId,
                                    turmaDisciplinaId = td.Id,
                                    cursoId = td.Turma.CursoId,
                                    turmaId = td.TurmaId,
                                    coordenadorId = (int?)null
                                })
                                .Cast<object>()
                                .ToList();
                        }
                        break;

                    case TipoItemAvaliado.Estagio:
                        // Para Estágio, usar a mesma lógica da Disciplina
                        if (convite.Participante.Tipo == TipoParticipante.Aluno && convite.Participante.Aluno != null)
                        {
                            await _context.Entry(convite.Participante.Aluno)
                                .Collection(a => a.TurmasDisciplinas)
                                .Query()
                                .Include(td => td.Turma)
                                .Include(td => td.Disciplina)
                                .LoadAsync();

                            itensAvaliados = convite.Participante.Aluno.TurmasDisciplinas
                                .Where(td => td.Ativo)
                                .Select(td => new
                                {
                                    id = td.Id,
                                    tipoItemAvaliado = "Estagio",
                                    nomeItemEspecifico = td.Disciplina.Nome,
                                    descricaoItem = $"Estágio: {td.Disciplina.Nome}",
                                    itemAvaliadoId = td.Id,
                                    ativo = td.Ativo,
                                    ordemApresentacao = 0,
                                    professorId = td.ProfessorId,
                                    disciplinaId = td.DisciplinaId,
                                    turmaDisciplinaId = td.Id,
                                    cursoId = td.Turma.CursoId,
                                    turmaId = td.TurmaId,
                                    coordenadorId = (int?)null
                                })
                                .Cast<object>()
                                .ToList();
                        }
                        else if (convite.Participante.Tipo == TipoParticipante.Professor && convite.Participante.Professor != null)
                        {
                            await _context.Entry(convite.Participante.Professor)
                                .Collection(p => p.TurmasDisciplinas)
                                .Query()
                                .Include(td => td.Turma)
                                .Include(td => td.Disciplina)
                                .LoadAsync();

                            itensAvaliados = convite.Participante.Professor.TurmasDisciplinas
                                .Where(td => td.Ativo)
                                .Select(td => new
                                {
                                    id = td.Id,
                                    tipoItemAvaliado = "Estagio",
                                    nomeItemEspecifico = td.Disciplina.Nome,
                                    descricaoItem = $"Estágio: {td.Disciplina.Nome}",
                                    itemAvaliadoId = td.Id,
                                    ativo = td.Ativo,
                                    ordemApresentacao = 0,
                                    professorId = td.ProfessorId,
                                    disciplinaId = td.DisciplinaId,
                                    turmaDisciplinaId = td.Id,
                                    cursoId = td.Turma.CursoId,
                                    turmaId = td.TurmaId,
                                    coordenadorId = (int?)null
                                })
                                .Cast<object>()
                                .ToList();
                        }
                        break;

                    case TipoItemAvaliado.ProjetoExtensionista:
                        // Para Projeto Extensionista, usar a mesma lógica da Disciplina
                        if (convite.Participante.Tipo == TipoParticipante.Aluno && convite.Participante.Aluno != null)
                        {
                            await _context.Entry(convite.Participante.Aluno)
                                .Collection(a => a.TurmasDisciplinas)
                                .Query()
                                .Include(td => td.Turma)
                                .Include(td => td.Disciplina)
                                .LoadAsync();

                            itensAvaliados = convite.Participante.Aluno.TurmasDisciplinas
                                .Where(td => td.Ativo)
                                .Select(td => new
                                {
                                    id = td.Id,
                                    tipoItemAvaliado = "ProjetoExtensionista",
                                    nomeItemEspecifico = td.Disciplina.Nome,
                                    descricaoItem = $"Projeto Extensionista: {td.Disciplina.Nome}",
                                    itemAvaliadoId = td.Id,
                                    ativo = td.Ativo,
                                    ordemApresentacao = 0,
                                    professorId = td.ProfessorId,
                                    disciplinaId = td.DisciplinaId,
                                    turmaDisciplinaId = td.Id,
                                    cursoId = td.Turma.CursoId,
                                    turmaId = td.TurmaId,
                                    coordenadorId = (int?)null
                                })
                                .Cast<object>()
                                .ToList();
                        }
                        else if (convite.Participante.Tipo == TipoParticipante.Professor && convite.Participante.Professor != null)
                        {
                            await _context.Entry(convite.Participante.Professor)
                                .Collection(p => p.TurmasDisciplinas)
                                .Query()
                                .Include(td => td.Turma)
                                .Include(td => td.Disciplina)
                                .LoadAsync();

                            itensAvaliados = convite.Participante.Professor.TurmasDisciplinas
                                .Where(td => td.Ativo)
                                .Select(td => new
                                {
                                    id = td.Id,
                                    tipoItemAvaliado = "ProjetoExtensionista",
                                    nomeItemEspecifico = td.Disciplina.Nome,
                                    descricaoItem = $"Projeto Extensionista: {td.Disciplina.Nome}",
                                    itemAvaliadoId = td.Id,
                                    ativo = td.Ativo,
                                    ordemApresentacao = 0,
                                    professorId = td.ProfessorId,
                                    disciplinaId = td.DisciplinaId,
                                    turmaDisciplinaId = td.Id,
                                    cursoId = td.Turma.CursoId,
                                    turmaId = td.TurmaId,
                                    coordenadorId = (int?)null
                                })
                                .Cast<object>()
                                .ToList();
                        }
                        break;

                    case TipoItemAvaliado.TurmaDisciplina:
                    case TipoItemAvaliado.Coordenador:
                    case TipoItemAvaliado.Estrutura:
                    case TipoItemAvaliado.Alunos:
                    default:
                        // Para outros tipos, usar os itens avaliados do questionário
                        itensAvaliados = questionario.ItensAvaliados?
                            .Where(ia => ia.Ativo)
                            .OrderBy(ia => ia.OrdemApresentacao)
                            .ThenBy(ia => ia.NomeItemEspecifico)
                            .Select(ia => new
                            {
                                id = ia.Id,
                                tipoItemAvaliado = ia.TipoItemAvaliado,
                                nomeItemEspecifico = ia.NomeItemEspecifico,
                                descricaoItem = ia.DescricaoItem,
                                itemAvaliadoId = ia.ItemAvaliadoId,
                                // IDs específicos baseados no tipo
                                professorId = ia.ProfessorId,
                                disciplinaId = ia.DisciplinaId,
                                turmaDisciplinaId = ia.TurmaDisciplinaId,
                                cursoId = ia.CursoId,
                                turmaId = ia.TurmaId,
                                coordenadorId = ia.CoordenadorId
                            })
                            .Cast<object>()
                            .ToList() ?? new List<object>();
                        break;
                }
            }

            var questoes = questoesPrincipais
                .Select(q => new QuestaoResponseDto
                {
                    Id = q.Id,
                    Texto = q.Texto,
                    Tipo = q.Tipo,
                    Obrigatorio = q.Obrigatorio,
                    IsCondicional = q.IsCondicional,
                    Opcoes = (q.Opcoes ?? new List<OpcaoQuestao>()).Where(o => o.EhColuna == false).Select(o =>
                    {
                        var opcaoDto = new OpcaoQuestaoResponseDto
                        {
                            Id = o.Id,
                            Texto = o.Texto,
                            Valor = o.Valor,
                            Ordem = o.Ordem,
                            Peso = o.Peso,
                            EhColuna = o.EhColuna,
                            AtivaCondicao = o.AtivaCondicao,
                            QuestaoCondicionalId = o.QuestaoCondicionalId
                        };

                        // Se a opção ativa condição, buscar e incluir a questão condicional
                        if (o.AtivaCondicao && o.QuestaoCondicionalId.HasValue &&
                            questoesCondicionaisDict.TryGetValue(o.QuestaoCondicionalId.Value, out var questaoCondicional))
                        {
                            opcaoDto.QuestaoCondicional = new QuestaoResponseDto
                            {
                                Id = questaoCondicional.Id,
                                Texto = questaoCondicional.Texto,
                                Tipo = questaoCondicional.Tipo,
                                Obrigatorio = questaoCondicional.Obrigatorio,
                                IsCondicional = questaoCondicional.IsCondicional,
                                Opcoes = (questaoCondicional.Opcoes ?? new List<OpcaoQuestao>()).Where(oc => oc.EhColuna == false).Select(oc => new OpcaoQuestaoResponseDto
                                {
                                    Id = oc.Id,
                                    Texto = oc.Texto,
                                    Valor = oc.Valor,
                                    Ordem = oc.Ordem,
                                    Peso = oc.Peso,
                                    EhColuna = oc.EhColuna,
                                    AtivaCondicao = oc.AtivaCondicao,
                                    QuestaoCondicionalId = oc.QuestaoCondicionalId
                                }).ToList(),
                                Colunas = (questaoCondicional.Opcoes ?? new List<OpcaoQuestao>()).Where(oc => oc.EhColuna == true).Select(oc => new OpcaoQuestaoResponseDto
                                {
                                    Id = oc.Id,
                                    Texto = oc.Texto,
                                    Valor = oc.Valor,
                                    Ordem = oc.Ordem,
                                    Peso = oc.Peso,
                                    EhColuna = oc.EhColuna,
                                    AtivaCondicao = oc.AtivaCondicao,
                                    QuestaoCondicionalId = oc.QuestaoCondicionalId
                                }).ToList()
                            };
                        }

                        return opcaoDto;
                    }).ToList(),
                    Colunas = (q.Opcoes ?? new List<OpcaoQuestao>()).Where(o => o.EhColuna == true).Select(o => new OpcaoQuestaoResponseDto
                    {
                        Id = o.Id,
                        Texto = o.Texto,
                        Valor = o.Valor,
                        Ordem = o.Ordem,
                        Peso = o.Peso,
                        EhColuna = o.EhColuna,
                        AtivaCondicao = o.AtivaCondicao,
                        QuestaoCondicionalId = o.QuestaoCondicionalId
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
                tipoItemAvaliado = questionario.TipoItemAvaliado,
                itensAvaliados = itensAvaliados,
                participante = new
                {
                    id = convite.Participante.Id,
                    nome = convite.Participante.Nome,
                    email = convite.Participante.Email,
                    tipo = convite.Participante.TipoDescricao,
                    // Dados específicos baseados no tipo
                    aluno = convite.Participante.Tipo == TipoParticipante.Aluno && convite.Participante.Aluno != null ? new
                    {
                        id = convite.Participante.Aluno.Id,
                        nome = convite.Participante.Aluno.Nome,
                        email = convite.Participante.Aluno.Email,
                        matricula = convite.Participante.Aluno.Matricula,
                        curso = convite.Participante.Aluno.Curso?.Nome
                    } : null,
                    professor = convite.Participante.Tipo == TipoParticipante.Professor && convite.Participante.Professor != null ? new
                    {
                        id = convite.Participante.Professor.Id,
                        nome = convite.Participante.Professor.Nome,
                        email = convite.Participante.Professor.Email,
                        departamento = convite.Participante.Professor.Departamento,
                        titulacao = convite.Participante.Professor.Titulacao,
                        instituicao = convite.Participante.Professor.Instituicao?.Nome
                    } : null,
                    coordenador = convite.Participante.Tipo == TipoParticipante.Coordenador && convite.Participante.Coordenador != null ? new
                    {
                        id = convite.Participante.Coordenador.Id,
                        nome = convite.Participante.Coordenador.Nome,
                        email = convite.Participante.Coordenador.Email,
                        departamento = convite.Participante.Coordenador.Departamento,
                        titulacao = convite.Participante.Coordenador.Titulacao
                    } : null
                }
            });
        }

        public class ResponderQuestionarioDto
        {
            public int QuestionarioId { get; set; }
            public int ParticipanteId { get; set; } // Mudou de AlunoId para ParticipanteId
            public List<RespostaParaQuestionarioDto> Respostas { get; set; }
        }

        public class RespostaParaQuestionarioDto
        {
            public int QuestaoId { get; set; }
            public string? Valor { get; set; }
            public string? Texto { get; set; }
            public int? OpcaoId { get; set; }
            public int? ColunaId { get; set; }
            public int? ItemAvaliadoId { get; set; }  // ID do item específico sendo avaliado
        }

        [HttpPost("responder/{chave}")]
        public async Task<IActionResult> ResponderQuestionario(string chave, [FromBody] ResponderQuestionarioDto dto)
        {
            var convite = await _context.ConvitesQuestionarios
                .Include(c => c.Questionario)
                .Include(c => c.Participante)
                .FirstOrDefaultAsync(c => c.Chave == chave);

            if (convite == null)
                return NotFound(new { message = "Convite não encontrado" });

            // Carregar dados específicos baseado no tipo do participante
            if (convite.Participante.Tipo == TipoParticipante.Aluno)
            {
                await _context.Entry(convite.Participante)
                    .Reference(p => p.Aluno)
                    .LoadAsync();
                
                if (convite.Participante.Aluno != null)
                {
                    await _context.Entry(convite.Participante.Aluno)
                        .Reference(a => a.Curso)
                        .LoadAsync();
                }
            }
            
            if (convite.Participante.Tipo == TipoParticipante.Professor)
            {
                await _context.Entry(convite.Participante)
                    .Reference(p => p.Professor)
                    .LoadAsync();
                
                if (convite.Participante.Professor != null)
                {
                    await _context.Entry(convite.Participante.Professor)
                        .Reference(prof => prof.Instituicao)
                        .LoadAsync();
                }
            }
            
            if (convite.Participante.Tipo == TipoParticipante.Coordenador)
            {
                await _context.Entry(convite.Participante)
                    .Reference(p => p.Coordenador)
                    .LoadAsync();
            }

            // Carregar informações de disciplinas e turmas se necessário
            // (Estas informações podem ser úteis para contexto da avaliação)
            // As disciplinas e turmas são carregadas através dos relacionamentos específicos

            // Carregar TurmaDisciplinas do participante (se for professor)
            var turmaDisciplinas = new List<object>();
            if (convite.Participante.Tipo == TipoParticipante.Professor)
            {
                var turmaDisciplinasData = await _context.TurmaDisciplinas
                    .Include(td => td.Turma)
                    .Include(td => td.Disciplina)
                    .Include(td => td.Professor)
                    .Where(td => td.ProfessorId == convite.Participante.Professor.Id && td.Ativo)
                    .Select(td => new
                    {
                        id = td.Id,
                        turmaId = td.TurmaId,
                        turmaNome = td.Turma.Nome,
                        turmaCodigo = td.Turma.IntegracaoId,
                        disciplinaId = td.DisciplinaId,
                        disciplinaNome = td.Disciplina.Nome,
                        disciplinaCodigo = td.Disciplina.Codigo,
                        professorId = td.ProfessorId,
                        professorNome = td.Professor.Nome,
                        periodoLetivoId = td.PeriodoLetivoId,
                        gerenciada = td.Gerenciada
                    })
                    .ToListAsync();
                
                turmaDisciplinas = turmaDisciplinasData.Cast<object>().ToList();
            }

            if (convite.DataResposta.HasValue)
                return BadRequest(new { message = "Este questionário já foi respondido" });

            if (DateTime.UtcNow < convite.Questionario.DataInicio || DateTime.UtcNow > convite.Questionario.DataFim)
                return BadRequest(new { message = "O período para responder este questionário está encerrado" });

            // Obter questões principais do questionário
            var questoesPrincipais = await _context.QuestoesQuestionarios
                .Where(qq => qq.QuestionarioId == convite.QuestionarioId)
                .Select(qq => qq.QuestaoId)
                .ToListAsync();

            // Obter questões condicionais referenciadas pelas opções das questões principais
            var questoesCondicionais = await _context.QuestoesQuestionarios
                .Where(qq => qq.QuestionarioId == convite.QuestionarioId)
                .Include(qq => qq.Questao)
                    .ThenInclude(q => q.Opcoes)
                .SelectMany(qq => qq.Questao.Opcoes)
                .Where(o => o.AtivaCondicao && o.QuestaoCondicionalId.HasValue)
                .Select(o => o.QuestaoCondicionalId.Value)
                .Distinct()
                .ToListAsync();

            // Combinar questões principais e condicionais
            var questoesValidas = questoesPrincipais.Union(questoesCondicionais).ToList();

            var questoesRespondidas = dto.Respostas.Select(r => r.QuestaoId).ToList();

            // Criar uma única resposta para o questionário
            var resposta = new Resposta
            {
                QuestionarioId = convite.QuestionarioId,
                ParticipanteId = convite.ParticipanteId,
                DataResposta = DateTime.UtcNow,
                // Preencher campos de item avaliado se existirem nas respostas
                TipoItemAvaliado = dto.Respostas.FirstOrDefault()?.ItemAvaliadoId.HasValue == true ? 
                    await GetTipoItemAvaliadoFromRespostas(dto.Respostas) : null,
                NomeItemEspecifico = dto.Respostas.FirstOrDefault()?.ItemAvaliadoId.HasValue == true ? 
                    await GetNomeItemEspecificoFromRespostas(dto.Respostas) : null,
                ItemAvaliadoId = dto.Respostas.FirstOrDefault()?.ItemAvaliadoId,
                
            };
            _context.Respostas.Add(resposta);
            await _context.SaveChangesAsync(); // Salva para obter o ID da resposta

            foreach (var respostaDto in dto.Respostas)
            {
                // Ignora respostas totalmente vazias
                if (string.IsNullOrEmpty(respostaDto.Valor) && string.IsNullOrEmpty(respostaDto.Texto) && respostaDto.OpcaoId == null && respostaDto.ColunaId == null)
                    continue;

                // Verificar se a questão é válida (principal ou condicional)
                if (!questoesValidas.Contains(respostaDto.QuestaoId))
                    return BadRequest(new { message = $"Questão {respostaDto.QuestaoId} não pertence ao questionário ou não é uma questão condicional válida" });

                // Preencher campos desnormalizados baseado no item avaliado E no participante
                var cursoId = await GetCursoIdFromItemAvaliado(respostaDto.ItemAvaliadoId, convite.Questionario.TipoItemAvaliado) ?? 
                              await GetCursoIdFromParticipante(convite.Participante);
                
                var turmaId = await GetTurmaIdFromItemAvaliado(respostaDto.ItemAvaliadoId, convite.Questionario.TipoItemAvaliado) ?? 
                              await GetTurmaIdFromParticipante(convite.Participante);
                
                var disciplinaId = await GetDisciplinaIdFromItemAvaliado(respostaDto.ItemAvaliadoId, convite.Questionario.TipoItemAvaliado) ?? 
                                   await GetDisciplinaIdFromParticipante(convite.Participante);
                
                var professorId = await GetProfessorIdFromItemAvaliado(respostaDto.ItemAvaliadoId, convite.Questionario.TipoItemAvaliado) ?? 
                                  await GetProfessorIdFromParticipante(convite.Participante);
                
                // InstituicaoId pode ser calculado baseado no CursoId já obtido
                var instituicaoId = await GetInstituicaoIdFromItemAvaliado(respostaDto.ItemAvaliadoId, convite.Questionario.TipoItemAvaliado) ?? 
                                    await GetInstituicaoIdFromParticipante(convite.Participante) ??
                                    await GetInstituicaoIdFromCursoId(cursoId);

                // Debug: Log dos valores obtidos
                Console.WriteLine($"DEBUG - RespostaQuestao {respostaDto.QuestaoId}:");
                Console.WriteLine($"  CursoId: {cursoId}");
                Console.WriteLine($"  TurmaId: {turmaId}");
                Console.WriteLine($"  DisciplinaId: {disciplinaId}");
                Console.WriteLine($"  ProfessorId: {professorId}");
                Console.WriteLine($"  InstituicaoId: {instituicaoId}");
                Console.WriteLine($"  Participante Tipo: {convite.Participante.Tipo}");
                Console.WriteLine($"  Participante CursoId: {convite.Participante.CursoId}");

                var novaRespostaQuestao = new RespostaQuestao
                {
                    RespostaId = resposta.Id,
                    QuestaoId = respostaDto.QuestaoId,
                    Valor = respostaDto.ColunaId.HasValue ? await _context.OpcoesQuestao.Where(o => o.Id == respostaDto.ColunaId && o.QuestaoId == respostaDto.QuestaoId).Select(o => o.Texto).FirstOrDefaultAsync() ?? respostaDto.Valor : respostaDto.Valor,
                    Texto = respostaDto.Texto,
                    OpcaoId = respostaDto.OpcaoId,
                    ItemAvaliadoId = respostaDto.ItemAvaliadoId,
                    
                    // Campos desnormalizados
                    CursoId = cursoId,
                    TurmaId = turmaId,
                    DisciplinaId = disciplinaId,
                    ProfessorId = professorId,
                    InstituicaoId = instituicaoId
                };

                _context.RespostasQuestoes.Add(novaRespostaQuestao);
            }

            convite.DataResposta = DateTime.UtcNow;
            convite.Respondido = true;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Respostas enviadas com sucesso",
                participante = new
                {
                    id = convite.Participante.Id,
                    nome = convite.Participante.Nome,
                    email = convite.Participante.Email,
                    tipo = convite.Participante.TipoDescricao,
                    // Dados específicos baseados no tipo
                    aluno = convite.Participante.Tipo == TipoParticipante.Aluno && convite.Participante.Aluno != null ? new
                    {
                        id = convite.Participante.Aluno.Id,
                        nome = convite.Participante.Aluno.Nome,
                        email = convite.Participante.Aluno.Email,
                        matricula = convite.Participante.Aluno.Matricula,
                        curso = convite.Participante.Aluno.Curso?.Nome
                    } : null,
                    professor = convite.Participante.Tipo == TipoParticipante.Professor && convite.Participante.Professor != null ? new
                    {
                        id = convite.Participante.Professor.Id,
                        nome = convite.Participante.Professor.Nome,
                        email = convite.Participante.Professor.Email,
                        departamento = convite.Participante.Professor.Departamento,
                        titulacao = convite.Participante.Professor.Titulacao,
                        instituicao = convite.Participante.Professor.Instituicao?.Nome
                    } : null,
                    coordenador = convite.Participante.Tipo == TipoParticipante.Coordenador && convite.Participante.Coordenador != null ? new
                    {
                        id = convite.Participante.Coordenador.Id,
                        nome = convite.Participante.Coordenador.Nome,
                        email = convite.Participante.Coordenador.Email,
                        departamento = convite.Participante.Coordenador.Departamento,
                        titulacao = convite.Participante.Coordenador.Titulacao
                    } : null,
                    // Informações de disciplinas e turmas
                    disciplinas = new List<object>(), // Carregadas através dos relacionamentos específicos
                    turmas = new List<object>(), // Carregadas através dos relacionamentos específicos
                    turmaDisciplinas = turmaDisciplinas
                }
            });
        }

        [HttpGet("{id}/participantes")]
        public async Task<ActionResult<IEnumerable<object>>> GetParticipantes(int id)
        {
            var participantes = await _context.ParticipantesQuestionarios
                .Where(p => p.QuestionarioId == id)
                .Include(p => p.Participante)
                .Include(p => p.Participante.Curso)
                .Select(p => new
                {
                    p.Id,
                    p.ParticipanteId,
                    p.QuestionarioId,
                    Participante = new
                    {
                        p.Participante.Id,
                        p.Participante.Nome,
                        p.Participante.Email,
                        p.Participante.Tipo,
                        p.Participante.CursoId,
                        Curso = p.Participante.Curso != null ? new
                        {
                            p.Participante.Curso.Id,
                            p.Participante.Curso.Nome
                        } : null
                    }
                })
                .ToListAsync();

            if (participantes == null || !participantes.Any())
            {
                return NotFound("Nenhum participante encontrado para este questionário.");
            }

            return participantes;
        }

        [HttpDelete("{id}/participantes/{participanteId}")]
        public async Task<IActionResult> DeleteParticipante(int id, int participanteId)
        {
            var participante = await _context.ParticipantesQuestionarios
                .FirstOrDefaultAsync(p => p.QuestionarioId == id && p.ParticipanteId == participanteId);

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
                    .ThenInclude(p => p.Participante)
                    .ThenInclude(p => p.Aluno)
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

                                            // TODO: Implementar mapeamento correto para filial, nível de ensino e período letivo
                                            // var filial = worksheet.Cell(row, 1).GetValue<string>()?.Trim() ?? "";
                                            // var nivelEnsino = worksheet.Cell(row, 2).GetValue<string>()?.Trim() ?? "";
                                            // var periodoLetivo = worksheet.Cell(row, 3).GetValue<string>()?.Trim() ?? "";
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
                                            var turnoEnum = ConverterStringParaTurno(turno);
                                            
                                            var aluno = await _context.Alunos.FirstOrDefaultAsync(a =>
                                                a.Nome == nome &&
                                                a.Matricula == matricula &&
                                                a.CursoId == curso.Id &&
                                                a.Turno == turnoEnum
                                            );

                                            bool novoAluno = false;
                                            if (aluno == null)
                                            {
                                                aluno = new Aluno
                                                {
                                                    Nome = nome,
                                                    Email = emailInstitucional,
                                                    Matricula = matricula,
                                                    CursoId = curso.Id,
                                                    Turno = ConverterStringParaTurno(turno),
                                                    EmailPessoal = emailPessoal,
                                                    Telefone = fone,
                                                    StatusNoPeriodoLetivo = statusNoPeriodoLetivo,
                                                    AceitaContato = true,
                                                    PeriodoLetivoId = 1, // TODO: Mapear corretamente
                                                    InstituicaoId = 1, // TODO: Mapear corretamente
                                                    Ativo = true,
                                                    DataCadastro = DateTime.Now
                                                };
                                                _context.Alunos.Add(aluno);
                                                await _context.SaveChangesAsync();
                                                novoAluno = true;
                                            }

                                            // Adicionar como participante se ainda não for
                                            var jaParticipante = await _context.ParticipantesQuestionarios
                                                .AnyAsync(p => p.QuestionarioId == id && p.ParticipanteId == aluno.Id);

                                            if (!jaParticipante)
                                            {
                                                var participante = new ParticipanteQuestionario
                                                {
                                                    QuestionarioId = id,
                                                    ParticipanteId = aluno.Id,
                                                    Status = "Pendente" // Status padrão para novos participantes
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
                .Select(c => new { c.ParticipanteId, c.QuestionarioId })
                .ToListAsync();

            // Extrair apenas os IDs dos participantes que responderam
            var participantesRespondidos = convitesRespondidos.Select(c => c.ParticipanteId).ToList();

            // Buscar todas as respostas do questionário APENAS de quem respondeu via convite
            var respostas = await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                    .ThenInclude(rq => rq.Questao)
                .Include(r => r.Participante)
                    .ThenInclude(p => p.Curso)
                .Where(r => r.QuestionarioId == id && participantesRespondidos.Contains(r.ParticipanteId))
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
                satisfacaoCursoDetalhamento = satisfacaoCursoDetalhamento,
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
                .Include(c => c.Participante)
                    .ThenInclude(p => p.Aluno)
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

                for (int i = 0; i < convitesPendentes.Count(); i++)
                {
                    var participante = convitesPendentes[i].Participante;
                    worksheet.Cell(i + 2, 1).Value = participante.Nome;
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
       // [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> ExportarRespondentes(int id)
        {
            var convitesRespondidos = await _context.ConvitesQuestionarios
                .Include(c => c.Participante)
                    .ThenInclude(p => p.Aluno)
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

                for (int i = 0; i < convitesRespondidos.Count(); i++)
                {
                    var participante = convitesRespondidos[i].Participante;
                    worksheet.Cell(i + 2, 1).Value = participante.Nome;
                    worksheet.Cell(i + 2, 2).Value = participante.Email;
                    
                    // Se for aluno, mostrar matrícula, senão mostrar tipo
                    if (participante.Tipo == TipoParticipante.Aluno && participante.Aluno != null)
                    {
                        worksheet.Cell(i + 2, 3).Value = participante.Aluno.Matricula ?? "";
                    }
                    else
                    {
                        worksheet.Cell(i + 2, 3).Value = participante.TipoDescricao;
                    }
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
                .Include(q => q.Participantes)
                    .ThenInclude(p => p.Participante)
                    .ThenInclude(p => p.Aluno)
                .FirstOrDefaultAsync(q => q.Id == id);
            if (questionario == null)
                return null;

            // Buscar todos os convites respondidos para este questionário
            var convitesRespondidos = await _context.ConvitesQuestionarios
                .Where(c => c.QuestionarioId == id && c.Respondido)
                .Select(c => new { c.ParticipanteId, c.QuestionarioId })
                .ToListAsync();

            // Extrair apenas os IDs dos participantes que responderam
            var participantesRespondidos = convitesRespondidos.Select(c => c.ParticipanteId).ToList();

            // Buscar todas as respostas do questionário APENAS de quem respondeu via convite
            var respostas = await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                    .ThenInclude(rq => rq.Questao)
                .Include(r => r.Participante)
                    .ThenInclude(p => p.Curso)
                .Where(r => r.QuestionarioId == id && participantesRespondidos.Contains(r.ParticipanteId))
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

        /// <summary>
        /// Converte uma string para o enum Turno correspondente
        /// </summary>
        /// <param name="turno">String representando o turno</param>
        /// <returns>Enum Turno correspondente ou null se não reconhecido</returns>
        private static Turno? ConverterStringParaTurno(string? turno)
        {
            if (string.IsNullOrEmpty(turno))
                return null;

            return turno.Trim().ToLower() switch
            {
                "matutino" => Turno.Matutino,
                "vespertino" => Turno.Vespertino,
                "noturno" => Turno.Noturno,
                _ => null
            };
        }

        // Métodos auxiliares para buscar informações de itens avaliados
        private async Task<TipoItemAvaliado?> GetTipoItemAvaliadoFromRespostas(List<RespostaParaQuestionarioDto> respostas)
        {
            var itemAvaliadoId = respostas.FirstOrDefault(r => r.ItemAvaliadoId.HasValue)?.ItemAvaliadoId;
            if (!itemAvaliadoId.HasValue) return null;

            var item = await _context.ItensAvaliadosQuestionarios
                .FirstOrDefaultAsync(ia => ia.Id == itemAvaliadoId.Value);
            
            return item?.TipoItemAvaliado;
        }

        private async Task<string?> GetNomeItemEspecificoFromRespostas(List<RespostaParaQuestionarioDto> respostas)
        {
            var itemAvaliadoId = respostas.FirstOrDefault(r => r.ItemAvaliadoId.HasValue)?.ItemAvaliadoId;
            if (!itemAvaliadoId.HasValue) return null;

            var item = await _context.ItensAvaliadosQuestionarios
                .FirstOrDefaultAsync(ia => ia.Id == itemAvaliadoId.Value);
            
            return item?.NomeItemEspecifico;
        }

        // Métodos auxiliares para buscar IDs baseado no ItemAvaliadoId individual
        private async Task<int?> GetCursoIdFromItemAvaliado(int? itemAvaliadoId, TipoItemAvaliado? tipoItemAvaliado)
        {
            if (!itemAvaliadoId.HasValue) return null;
            
            switch (tipoItemAvaliado)
            {
                case TipoItemAvaliado.Curso:
                    return itemAvaliadoId.Value;
                    
                case TipoItemAvaliado.Turma:
                    // Buscar curso da turma
                    var turma = await _context.Turmas
                        .FirstOrDefaultAsync(t => t.Id == itemAvaliadoId.Value);
                    return turma?.CursoId;
                    
                case TipoItemAvaliado.TurmaDisciplina:
                    // Buscar curso através da turma
                    var turmaDisciplina = await _context.TurmasDisciplinas
                        .Include(td => td.Turma)
                        .FirstOrDefaultAsync(td => td.Id == itemAvaliadoId.Value);
                    return turmaDisciplina?.Turma?.CursoId;
                    
                default:
                    return null;
            }
        }

        private async Task<int?> GetTurmaIdFromItemAvaliado(int? itemAvaliadoId, TipoItemAvaliado? tipoItemAvaliado)
        {
            if (!itemAvaliadoId.HasValue) return null;
            
            switch (tipoItemAvaliado)
            {
                case TipoItemAvaliado.Turma:
                case TipoItemAvaliado.Alunos:
                    return itemAvaliadoId.Value;
                    
                case TipoItemAvaliado.TurmaDisciplina:
                    var turmaDisciplina = await _context.TurmasDisciplinas
                        .FirstOrDefaultAsync(td => td.Id == itemAvaliadoId.Value);
                    return turmaDisciplina?.TurmaId;

                case TipoItemAvaliado.Disciplina:
                    // Para Disciplina, o itemAvaliadoId agora é o ID da TurmaDisciplina
                    var turmaDisciplinaDisciplina = await _context.TurmasDisciplinas
                        .FirstOrDefaultAsync(td => td.Id == itemAvaliadoId.Value);
                    return turmaDisciplinaDisciplina?.TurmaId;
                default:
                    return null;
            }
        }

        private async Task<int?> GetDisciplinaIdFromItemAvaliado(int? itemAvaliadoId, TipoItemAvaliado? tipoItemAvaliado)
        {
            if (!itemAvaliadoId.HasValue) return null;
            
            switch (tipoItemAvaliado)
            {
                case TipoItemAvaliado.Disciplina:
                    // Para Disciplina, o itemAvaliadoId agora é o ID da TurmaDisciplina
                    var turmaDisciplinaDisciplina = await _context.TurmasDisciplinas
                        .FirstOrDefaultAsync(td => td.Id == itemAvaliadoId.Value);
                    return turmaDisciplinaDisciplina?.DisciplinaId;
                    
                case TipoItemAvaliado.Estagio:
                case TipoItemAvaliado.ProjetoExtensionista:
                    return itemAvaliadoId.Value;
                    
                case TipoItemAvaliado.TurmaDisciplina:
                    var turmaDisciplina = await _context.TurmasDisciplinas
                        .FirstOrDefaultAsync(td => td.Id == itemAvaliadoId.Value);
                    return turmaDisciplina?.DisciplinaId;
                    
                default:
                    return null;
            }
        }

        private async Task<int?> GetProfessorIdFromItemAvaliado(int? itemAvaliadoId, TipoItemAvaliado? tipoItemAvaliado)
        {
            Console.WriteLine($"DEBUG GetProfessorIdFromItemAvaliado - ItemAvaliadoId: {itemAvaliadoId}, Tipo: {tipoItemAvaliado}");
            
            if (!itemAvaliadoId.HasValue) return null;
            
            switch (tipoItemAvaliado)
            {
                case TipoItemAvaliado.Professor:
                case TipoItemAvaliado.Coordenador:
                    Console.WriteLine($"DEBUG Professor - ItemAvaliadoId direto: {itemAvaliadoId.Value}");
                    return itemAvaliadoId.Value;
                    
                case TipoItemAvaliado.TurmaDisciplina:
                    var turmaDisciplina = await _context.TurmasDisciplinas
                        .FirstOrDefaultAsync(td => td.Id == itemAvaliadoId.Value);
                    Console.WriteLine($"DEBUG TurmaDisciplina - ProfessorId: {turmaDisciplina?.ProfessorId}");
                    return turmaDisciplina?.ProfessorId;
                    
                case TipoItemAvaliado.Disciplina:
                    // Para Disciplina, o itemAvaliadoId agora é o ID da TurmaDisciplina
                    var turmaDisciplinaDisciplina = await _context.TurmasDisciplinas
                        .FirstOrDefaultAsync(td => td.Id == itemAvaliadoId.Value);
                    Console.WriteLine($"DEBUG Disciplina - ProfessorId: {turmaDisciplinaDisciplina?.ProfessorId}");
                    return turmaDisciplinaDisciplina?.ProfessorId;
                    
                default:
                    Console.WriteLine($"DEBUG Professor - Tipo não suportado: {tipoItemAvaliado}");
                    return null;
            }
        }

        private async Task<int?> GetInstituicaoIdFromItemAvaliado(int? itemAvaliadoId, TipoItemAvaliado? tipoItemAvaliado)
        {
            if (!itemAvaliadoId.HasValue) return null;
            
            switch (tipoItemAvaliado)
            {
                case TipoItemAvaliado.Estrutura:
                case TipoItemAvaliado.Infraestrutura:
                    return itemAvaliadoId.Value;
                    
                case TipoItemAvaliado.Curso:
                    // Buscar instituição do curso
                    var curso = await _context.Cursos
                        .FirstOrDefaultAsync(c => c.Id == itemAvaliadoId.Value);
                    return curso?.InstituicaoId;
                    
                case TipoItemAvaliado.Turma:
                    // Buscar instituição através da turma -> curso
                    var turma = await _context.Turmas
                        .Include(t => t.Curso)
                        .FirstOrDefaultAsync(t => t.Id == itemAvaliadoId.Value);
                    return turma?.Curso?.InstituicaoId;
                    
                case TipoItemAvaliado.TurmaDisciplina:
                    // Buscar instituição através da turma -> curso
                    var turmaDisciplina = await _context.TurmasDisciplinas
                        .Include(td => td.Turma)
                        .ThenInclude(t => t.Curso)
                        .FirstOrDefaultAsync(td => td.Id == itemAvaliadoId.Value);
                    return turmaDisciplina?.Turma?.Curso?.InstituicaoId;
                    
                case TipoItemAvaliado.Disciplina:
                    // Para Disciplina, o itemAvaliadoId agora é o ID da TurmaDisciplina
                    var turmaDisciplinaDisciplina = await _context.TurmasDisciplinas
                        .Include(td => td.Turma)
                        .ThenInclude(t => t.Curso)
                        .FirstOrDefaultAsync(td => td.Id == itemAvaliadoId.Value);
                    return turmaDisciplinaDisciplina?.Turma?.Curso?.InstituicaoId;
                    
                default:
                    return null;
            }
        }

        // Métodos para buscar informações baseadas no PARTICIPANTE
        private async Task<int?> GetCursoIdFromParticipante(Participante participante)
        {
            Console.WriteLine($"DEBUG GetCursoIdFromParticipante - Tipo: {participante.Tipo}, AlunoId: {participante.AlunoId}");
            
            switch (participante.Tipo)
            {
                case TipoParticipante.Aluno:
                    // Buscar CursoId diretamente da tabela alunos
                    if (participante.AlunoId.HasValue)
                    {
                        var aluno = await _context.Alunos
                            .FirstOrDefaultAsync(a => a.AlunoId == participante.AlunoId.Value);
                        Console.WriteLine($"DEBUG Aluno - CursoId da tabela alunos: {aluno?.CursoId}");
                        return aluno?.CursoId;
                    }
                    Console.WriteLine("DEBUG Aluno - Sem AlunoId");
                    return null;
                    
                case TipoParticipante.Professor:
                    // Professor pode ter turmas/disciplinas com cursos
                    if (participante.ProfessorId.HasValue)
                    {
                        var turmaDisciplina = await _context.TurmasDisciplinas
                            .Include(td => td.Turma)
                            .FirstOrDefaultAsync(td => td.ProfessorId == participante.ProfessorId.Value);
                        return turmaDisciplina?.Turma?.CursoId;
                    }
                    return null;
                    
                case TipoParticipante.Coordenador:
                    // Coordenador pode ter curso específico
                    if (participante.CoordenadorId.HasValue)
                    {
                        var coordenadorCurso = await _context.CoordenadoresCursos
                            .FirstOrDefaultAsync(cc => cc.CoordenadorId == participante.CoordenadorId.Value);
                        return coordenadorCurso?.CursoId;
                    }
                    return null;
                    
                default:
                    return null;
            }
        }

        private async Task<int?> GetTurmaIdFromParticipante(Participante participante)
        {
            Console.WriteLine($"DEBUG GetTurmaIdFromParticipante - Tipo: {participante.Tipo}, AlunoId: {participante.AlunoId}");
            
            switch (participante.Tipo)
            {
                case TipoParticipante.Aluno:
                    // Aluno pode ter turma específica OU múltiplas turmas através de TurmaDisciplina
                    if (participante.AlunoId.HasValue)
                    {
                        // Primeiro tenta buscar via TurmaDisciplina
                        var turmaDisciplina = await _context.TurmasDisciplinas
                            .Include(td => td.Alunos)
                            .FirstOrDefaultAsync(td => td.Alunos.Any(a => a.AlunoId == participante.AlunoId.Value));
                        if (turmaDisciplina?.TurmaId > 0)
                        {
                            Console.WriteLine($"DEBUG Aluno - TurmaId via TurmaDisciplina: {turmaDisciplina.TurmaId}");
                            return turmaDisciplina.TurmaId;
                        }
                            
                        // Se não encontrou via TurmaDisciplina, busca a turma direta do aluno
                        var aluno = await _context.Alunos
                            .FirstOrDefaultAsync(a => a.AlunoId == participante.AlunoId.Value);
                        if (aluno?.TurmaId.HasValue == true)
                        {
                            Console.WriteLine($"DEBUG Aluno - TurmaId direto: {aluno.TurmaId}");
                            return aluno.TurmaId;
                        }
                        
                        Console.WriteLine("DEBUG Aluno - Nenhuma turma encontrada");
                    }
                    Console.WriteLine("DEBUG Aluno - Sem AlunoId");
                    return null;
                    
                case TipoParticipante.Professor:
                    // Professor pode ter turmas através de TurmaDisciplina
                    if (participante.ProfessorId.HasValue)
                    {
                        var turmaDisciplina = await _context.TurmasDisciplinas
                            .FirstOrDefaultAsync(td => td.ProfessorId == participante.ProfessorId.Value);
                        return turmaDisciplina?.TurmaId;
                    }
                    return null;
                    
                default:
                    return null;
            }
        }

        private async Task<int?> GetDisciplinaIdFromParticipante(Participante participante)
        {
            Console.WriteLine($"DEBUG GetDisciplinaIdFromParticipante - Tipo: {participante.Tipo}, AlunoId: {participante.AlunoId}");
            
            switch (participante.Tipo)
            {
                case TipoParticipante.Aluno:
                    // Aluno pode ter disciplinas através de TurmaDisciplina
                    if (participante.AlunoId.HasValue)
                    {
                        var turmaDisciplina = await _context.TurmasDisciplinas
                            .Include(td => td.Alunos)
                            .FirstOrDefaultAsync(td => td.Alunos.Any(a => a.AlunoId == participante.AlunoId.Value));
                        Console.WriteLine($"DEBUG Aluno - DisciplinaId via TurmaDisciplina: {turmaDisciplina?.DisciplinaId}");
                        return turmaDisciplina?.DisciplinaId;
                    }
                    Console.WriteLine("DEBUG Aluno - Sem AlunoId");
                    return null;
                    
                case TipoParticipante.Professor:
                    // Professor pode ter disciplinas através de TurmaDisciplina
                    if (participante.ProfessorId.HasValue)
                    {
                        var turmaDisciplina = await _context.TurmasDisciplinas
                            .FirstOrDefaultAsync(td => td.ProfessorId == participante.ProfessorId.Value);
                        return turmaDisciplina?.DisciplinaId;
                    }
                    return null;
                    
                default:
                    return null;
            }
        }

        private async Task<int?> GetProfessorIdFromParticipante(Participante participante)
        {
            switch (participante.Tipo)
            {
                case TipoParticipante.Professor:
                    // Professor tem ProfessorId direto
                    return participante.ProfessorId;
                    
                case TipoParticipante.Coordenador:
                    // Coordenador pode ser professor também
                    return participante.ProfessorId;
                    
                default:
                    return null;
            }
        }

        private async Task<int?> GetInstituicaoIdFromParticipante(Participante participante)
        {
            Console.WriteLine($"DEBUG GetInstituicaoIdFromParticipante - Tipo: {participante.Tipo}, AlunoId: {participante.AlunoId}");
            
            switch (participante.Tipo)
            {
                case TipoParticipante.Aluno:
                    // Buscar InstituicaoId diretamente da tabela alunos
                    if (participante.AlunoId.HasValue)
                    {
                        var aluno = await _context.Alunos
                            .Include(a => a.Curso)
                            .FirstOrDefaultAsync(a => a.AlunoId == participante.AlunoId.Value);
                        Console.WriteLine($"DEBUG Aluno - InstituicaoId da tabela alunos: {aluno?.InstituicaoId}");
                        return aluno?.InstituicaoId;
                    }
                    Console.WriteLine("DEBUG Aluno - Sem AlunoId");
                    return null;
                    
                case TipoParticipante.Professor:
                    // Professor pode ter instituição através de turmas/disciplinas
                    if (participante.ProfessorId.HasValue)
                    {
                        var turmaDisciplina = await _context.TurmasDisciplinas
                            .Include(td => td.Turma)
                            .ThenInclude(t => t.Curso)
                            .FirstOrDefaultAsync(td => td.ProfessorId == participante.ProfessorId.Value);
                        return turmaDisciplina?.Turma?.Curso?.InstituicaoId;
                    }
                    return null;
                    
                case TipoParticipante.Coordenador:
                    // Coordenador pode ter instituição através do curso
                    if (participante.CoordenadorId.HasValue)
                    {
                        var coordenadorCurso = await _context.CoordenadoresCursos
                            .Include(cc => cc.Curso)
                            .FirstOrDefaultAsync(cc => cc.CoordenadorId == participante.CoordenadorId.Value);
                        return coordenadorCurso?.Curso?.InstituicaoId;
                    }
                    return null;
                    
                default:
                    return null;
            }
        }

        // Método auxiliar para buscar InstituicaoId baseado no CursoId
        private async Task<int?> GetInstituicaoIdFromCursoId(int? cursoId)
        {
            if (!cursoId.HasValue) return null;
            
            var curso = await _context.Cursos
                .FirstOrDefaultAsync(c => c.Id == cursoId.Value);
            return curso?.InstituicaoId;
        }
    }

    // DTO para receber dados de participantes da avaliação
    public class ParticipanteAvaliacaoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Tipo { get; set; }
        public string? Curso { get; set; }
        public string? Turma { get; set; }
        public string? Disciplina { get; set; }
        public string? Instituicao { get; set; }
        public string? PeriodoLetivo { get; set; }
    }
}