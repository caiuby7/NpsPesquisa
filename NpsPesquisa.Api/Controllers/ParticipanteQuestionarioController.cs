using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;
using NpsPesquisa.Api.IntegracaoExterna.Services;

namespace NpsPesquisa.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParticipanteQuestionarioController : ControllerBase
    {
        private readonly NpsDbContext _context;
        private readonly ITotvsService _totvsService;
        private readonly ILogger<ParticipanteQuestionarioController> _logger;

        public ParticipanteQuestionarioController(NpsDbContext context, ITotvsService totvsService, ILogger<ParticipanteQuestionarioController> logger)
        {
            _context = context;
            _totvsService = totvsService;
            _logger = logger;
        }

        // GET: api/ParticipanteQuestionario/questionario/{id}
        [HttpGet("questionario/{id}")]
        public async Task<ActionResult<IEnumerable<object>>> GetParticipantesPorQuestionario(int id)
        {
            try
            {
                var participantes = await _context.ParticipantesQuestionarios
                    .Where(pq => pq.QuestionarioId == id)
                    .Include(pq => pq.Participante)
                    .Include(pq => pq.Participante.Aluno)
                    .Include(pq => pq.Participante.Professor)
                    .Include(pq => pq.Participante.Coordenador)
                    .Include(pq => pq.Curso)
                    .Include(pq => pq.Turma)
                    .Include(pq => pq.Disciplina)
                    .Include(pq => pq.Professor)
                    .Include(pq => pq.Instituicao)
                    .Include(pq => pq.PeriodoLetivo)
                    .Select(pq => new
                    {
                        id = pq.ParticipanteId,
                        nome = pq.Participante.Nome,
                        email = pq.Participante.Email,
                        tipo = pq.Participante.Tipo,
                        ativo = pq.Participante.Ativo,
                        dataConvite = pq.DataConvite,
                        dataResposta = pq.DataResposta,
                        status = pq.DataResposta.HasValue ? "Respondido" : "Pendente",
                        
                        // Dados específicos por tipo
                        matricula = pq.Participante.Aluno != null ? pq.Participante.Aluno.Matricula : null,
                        curso = pq.Participante.Aluno != null ? pq.Participante.Aluno.Curso.Nome : null,
                        departamento = pq.Participante.Professor != null ? pq.Participante.Professor.Departamento : 
                                     pq.Participante.Coordenador != null ? pq.Participante.Coordenador.Departamento : null,
                        titulacao = pq.Participante.Professor != null ? pq.Participante.Professor.Titulacao : null,
                        telefone = pq.Participante.Telefone,
                        cpf = pq.Participante.Cpf,
                        
                        // Contexto de filtros aplicados
                        contexto = new
                        {
                            cursoId = pq.CursoId,
                            cursoNome = pq.Curso != null ? pq.Curso.Nome : null,
                            turmaId = pq.TurmaId,
                            turmaNome = pq.Turma != null ? pq.Turma.Nome : null,
                            disciplinaId = pq.DisciplinaId,
                            disciplinaNome = pq.Disciplina != null ? pq.Disciplina.Nome : null,
                            professorId = pq.ProfessorId,
                            professorNome = pq.Professor != null ? pq.Professor.Nome : null,
                            instituicaoId = pq.InstituicaoId,
                            instituicaoNome = pq.Instituicao != null ? pq.Instituicao.Nome : null,
                            periodoLetivoId = pq.PeriodoLetivoId,
                            periodoLetivoNome = pq.PeriodoLetivo != null ? pq.PeriodoLetivo.Nome : null,
                            tipoItemAvaliado = pq.TipoItemAvaliado,
                            nomeItemEspecifico = pq.NomeItemEspecifico,
                            itemAvaliadoId = pq.ItemAvaliadoId,
                            contextoDescricao = pq.ContextoDescricao
                        }
                    })
                    .ToListAsync();

                return Ok(participantes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        // GET: api/ParticipanteQuestionario/participante/{id}
        [HttpGet("participante/{id}")]
        public async Task<ActionResult<IEnumerable<object>>> GetQuestionariosPorParticipante(int id)
        {
            try
            {
                var questionarios = await _context.ParticipantesQuestionarios
                    .Where(pq => pq.ParticipanteId == id)
                    .Include(pq => pq.Questionario)
                    .Select(pq => new
                    {
                        id = pq.QuestionarioId,
                        titulo = pq.Questionario.Titulo,
                        descricao = pq.Questionario.Descricao,
                        dataInicio = pq.Questionario.DataInicio,
                        dataFim = pq.Questionario.DataFim,
                        dataConvite = pq.DataConvite,
                        dataResposta = pq.DataResposta,
                        status = pq.DataResposta.HasValue ? "Respondido" : "Pendente"
                    })
                    .ToListAsync();

                return Ok(questionarios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        // POST: api/ParticipanteQuestionario
        [HttpPost]
        public async Task<ActionResult<ParticipanteQuestionario>> AdicionarParticipante([FromBody] ParticipanteQuestionarioDto dto)
        {
            try
            {
                // Verificar se já existe
                var existente = await _context.ParticipantesQuestionarios
                    .FirstOrDefaultAsync(pq => pq.QuestionarioId == dto.QuestionarioId && pq.ParticipanteId == dto.ParticipanteId);

                if (existente != null)
                {
                    return BadRequest(new { message = "Participante já está associado a este questionário" });
                }

                var participanteQuestionario = new ParticipanteQuestionario
                {
                    QuestionarioId = dto.QuestionarioId,
                    ParticipanteId = dto.ParticipanteId,
                    DataConvite = DateTime.UtcNow,
                    DataResposta = null,
                    Status = "Pendente", // Status padrão para novos participantes
                    
                    // Campos de contexto
                    CursoId = dto.CursoId,
                    TurmaId = dto.TurmaId,
                    DisciplinaId = dto.DisciplinaId,
                    ProfessorId = dto.ProfessorId,
                    InstituicaoId = dto.InstituicaoId,
                    PeriodoLetivoId = dto.PeriodoLetivoId,
                    TipoItemAvaliado = dto.TipoItemAvaliado,
                    NomeItemEspecifico = dto.NomeItemEspecifico,
                    ItemAvaliadoId = dto.ItemAvaliadoId
                };

                _context.ParticipantesQuestionarios.Add(participanteQuestionario);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetParticipantesPorQuestionario), 
                    new { id = dto.QuestionarioId }, participanteQuestionario);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        // POST: api/ParticipanteQuestionario/adicionar-com-contexto
        [HttpPost("adicionar-com-contexto")]
        public async Task<ActionResult<object>> AdicionarParticipantesComContexto([FromBody] AdicionarParticipantesComContextoDto dto)
        {
            try
            {
                var participantesAdicionados = new List<object>();
                var participantesJaExistentes = new List<object>();
                var erros = new List<string>();

                foreach (var participanteId in dto.ParticipanteIds)
                {
                    try
                    {
                        // Verificar se já existe
                        var existente = await _context.ParticipantesQuestionarios
                            .FirstOrDefaultAsync(pq => pq.QuestionarioId == dto.QuestionarioId && pq.ParticipanteId == participanteId);

                        if (existente != null)
                        {
                            participantesJaExistentes.Add(new { 
                                participanteId, 
                                message = "Já está associado a este questionário" 
                            });
                            continue;
                        }

                        // Verificar se o participante existe
                        var participante = await _context.Participantes
                            .Include(p => p.Aluno)
                            .Include(p => p.Professor)
                            .Include(p => p.Coordenador)
                            .FirstOrDefaultAsync(p => p.Id == participanteId);

                        if (participante == null)
                        {
                            erros.Add($"Participante com ID {participanteId} não encontrado");
                            continue;
                        }

                        var participanteQuestionario = new ParticipanteQuestionario
                        {
                            QuestionarioId = dto.QuestionarioId,
                            ParticipanteId = participanteId,
                            DataConvite = DateTime.UtcNow,
                            DataResposta = null,
                            Status = "Pendente",
                            
                            // Campos de contexto
                            CursoId = dto.CursoId,
                            TurmaId = dto.TurmaId,
                            DisciplinaId = dto.DisciplinaId,
                            ProfessorId = dto.ProfessorId,
                            InstituicaoId = dto.InstituicaoId,
                            PeriodoLetivoId = dto.PeriodoLetivoId,
                            TipoItemAvaliado = dto.TipoItemAvaliado,
                            NomeItemEspecifico = dto.NomeItemEspecifico,
                            ItemAvaliadoId = dto.ItemAvaliadoId
                        };

                        _context.ParticipantesQuestionarios.Add(participanteQuestionario);
                        participantesAdicionados.Add(new { 
                            participanteId, 
                            nome = participante.Nome,
                            email = participante.Email,
                            tipo = participante.Tipo,
                            contexto = participanteQuestionario.ContextoDescricao
                        });
                    }
                    catch (Exception ex)
                    {
                        erros.Add($"Erro ao adicionar participante {participanteId}: {ex.Message}");
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    sucesso = true,
                    participantesAdicionados = participantesAdicionados.Count,
                    participantesJaExistentes = participantesJaExistentes.Count,
                    erros = erros.Count,
                    detalhes = new
                    {
                        adicionados = participantesAdicionados,
                        jaExistentes = participantesJaExistentes,
                        erros = erros
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        // GET: api/ParticipanteQuestionario/questionario/{id}/por-contexto
        [HttpGet("questionario/{id}/por-contexto")]
        public async Task<ActionResult<object>> GetParticipantesPorContexto(
            int id,
            [FromQuery] int? cursoId = null,
            [FromQuery] int? turmaId = null,
            [FromQuery] int? disciplinaId = null,
            [FromQuery] int? professorId = null,
            [FromQuery] int? instituicaoId = null,
            [FromQuery] int? periodoLetivoId = null,
            [FromQuery] TipoItemAvaliado? tipoItemAvaliado = null)
        {
            try
            {
                var query = _context.ParticipantesQuestionarios
                    .Where(pq => pq.QuestionarioId == id)
                    .Include(pq => pq.Participante)
                    .Include(pq => pq.Participante.Aluno)
                    .Include(pq => pq.Participante.Professor)
                    .Include(pq => pq.Participante.Coordenador)
                    .Include(pq => pq.Curso)
                    .Include(pq => pq.Turma)
                    .Include(pq => pq.Disciplina)
                    .Include(pq => pq.Professor)
                    .Include(pq => pq.Instituicao)
                    .Include(pq => pq.PeriodoLetivo)
                    .AsQueryable();

                // Aplicar filtros de contexto
                if (cursoId.HasValue)
                    query = query.Where(pq => pq.CursoId == cursoId.Value);

                if (turmaId.HasValue)
                    query = query.Where(pq => pq.TurmaId == turmaId.Value);

                if (disciplinaId.HasValue)
                    query = query.Where(pq => pq.DisciplinaId == disciplinaId.Value);

                if (professorId.HasValue)
                    query = query.Where(pq => pq.ProfessorId == professorId.Value);

                if (instituicaoId.HasValue)
                    query = query.Where(pq => pq.InstituicaoId == instituicaoId.Value);

                if (periodoLetivoId.HasValue)
                    query = query.Where(pq => pq.PeriodoLetivoId == periodoLetivoId.Value);

                if (tipoItemAvaliado.HasValue)
                    query = query.Where(pq => pq.TipoItemAvaliado == tipoItemAvaliado.Value);

                var participantes = await query
                    .Select(pq => new
                    {
                        id = pq.ParticipanteId,
                        nome = pq.Participante.Nome,
                        email = pq.Participante.Email,
                        tipo = pq.Participante.Tipo,
                        ativo = pq.Participante.Ativo,
                        dataConvite = pq.DataConvite,
                        dataResposta = pq.DataResposta,
                        status = pq.DataResposta.HasValue ? "Respondido" : "Pendente",
                        
                        // Dados específicos por tipo
                        matricula = pq.Participante.Aluno != null ? pq.Participante.Aluno.Matricula : null,
                        curso = pq.Participante.Aluno != null ? pq.Participante.Aluno.Curso.Nome : null,
                        departamento = pq.Participante.Professor != null ? pq.Participante.Professor.Departamento : 
                                     pq.Participante.Coordenador != null ? pq.Participante.Coordenador.Departamento : null,
                        titulacao = pq.Participante.Professor != null ? pq.Participante.Professor.Titulacao : null,
                        telefone = pq.Participante.Telefone,
                        cpf = pq.Participante.Cpf,
                        
                        // Contexto de filtros aplicados
                        contexto = new
                        {
                            cursoId = pq.CursoId,
                            cursoNome = pq.Curso != null ? pq.Curso.Nome : null,
                            turmaId = pq.TurmaId,
                            turmaNome = pq.Turma != null ? pq.Turma.Nome : null,
                            disciplinaId = pq.DisciplinaId,
                            disciplinaNome = pq.Disciplina != null ? pq.Disciplina.Nome : null,
                            professorId = pq.ProfessorId,
                            professorNome = pq.Professor != null ? pq.Professor.Nome : null,
                            instituicaoId = pq.InstituicaoId,
                            instituicaoNome = pq.Instituicao != null ? pq.Instituicao.Nome : null,
                            periodoLetivoId = pq.PeriodoLetivoId,
                            periodoLetivoNome = pq.PeriodoLetivo != null ? pq.PeriodoLetivo.Nome : null,
                            tipoItemAvaliado = pq.TipoItemAvaliado,
                            nomeItemEspecifico = pq.NomeItemEspecifico,
                            itemAvaliadoId = pq.ItemAvaliadoId,
                            contextoDescricao = pq.ContextoDescricao
                        }
                    })
                    .ToListAsync();

                // Agrupar por contexto para facilitar visualização
                var participantesPorContexto = participantes
                    .GroupBy(p => new
                    {
                        p.contexto.cursoNome,
                        p.contexto.turmaNome,
                        p.contexto.disciplinaNome,
                        p.contexto.professorNome,
                        p.contexto.instituicaoNome,
                        p.contexto.periodoLetivoNome,
                        p.contexto.tipoItemAvaliado,
                        p.contexto.nomeItemEspecifico
                    })
                    .Select(g => new
                    {
                        contexto = g.Key,
                        quantidade = g.Count(),
                        participantes = g.ToList()
                    })
                    .ToList();

                return Ok(new
                {
                    questionarioId = id,
                    filtrosAplicados = new
                    {
                        cursoId,
                        turmaId,
                        disciplinaId,
                        professorId,
                        instituicaoId,
                        periodoLetivoId,
                        tipoItemAvaliado
                    },
                    totalParticipantes = participantes.Count,
                    participantesPorContexto = participantesPorContexto,
                    todosParticipantes = participantes
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        // POST: api/ParticipanteQuestionario/buscar-e-adicionar-do-totvs
        [HttpPost("buscar-e-adicionar-do-totvs")]
        public async Task<IActionResult> BuscarEAdicionarDoTotvs([FromBody] BuscarEAdicionarTotvsRequest request)
        {
            try
            {
                // Validar se o questionário existe
                var questionario = await _context.Questionarios
                    .FirstOrDefaultAsync(q => q.Id == request.QuestionarioId);

                if (questionario == null)
                {
                    return NotFound("Questionário não encontrado.");
                }

                // Buscar dados do TOTVS baseado nos filtros
                var participantesTotvs = await _totvsService.BuscarParticipantesPorFiltrosAsync(
                    request.PeriodoLetivo,
                    request.CursoId,
                    request.TurmaId,
                    request.DisciplinaId,
                    request.TipoParticipante,
                    questionario.TipoItemAvaliado
                );

                if (!participantesTotvs.Any())
                {
                    return Ok(new
                    {
                        message = "Nenhum participante encontrado no TOTVS com os filtros selecionados.",
                        totalEncontrados = 0,
                        totalAdicionados = 0,
                        participantes = new List<object>()
                    });
                }

                var participantesAdicionados = new List<object>();
                var totalAdicionados = 0;

                // Buscar todos os participantes existentes de uma vez
                var matriculas = participantesTotvs.Where(p => p != null && p.Tipo == TipoParticipante.Aluno && !string.IsNullOrEmpty(p.RA))
                    .Select(p => p.RA).ToList();
                var logins = participantesTotvs.Where(p => p != null && p.Tipo == TipoParticipante.Professor && !string.IsNullOrEmpty(p.Login))
                    .Select(p => p.Login).ToList();

                var participantesExistentes = await _context.Participantes
                    .Include(p => p.Aluno)
                    .Include(p => p.Professor)
                    .Where(p => 
                        (p.Aluno != null && matriculas.Contains(p.Aluno.Matricula)) ||
                        (p.Professor != null && logins.Contains(p.Professor.Login))
                    )
                    .ToListAsync();

                // Buscar associações existentes de uma vez
                var participanteIds = participantesExistentes.Select(p => p.Id).ToList();
                var associacoesExistentes = await _context.ParticipantesQuestionarios
                    .Where(pq => pq.QuestionarioId == request.QuestionarioId && 
                                participanteIds.Contains(pq.ParticipanteId) &&
                                pq.DisciplinaId == request.DisciplinaId)
                    .Select(pq => pq.ParticipanteId)
                    .ToListAsync();

                var novosParticipantes = new List<Participante>();
                var novasAssociacoes = new List<ParticipanteQuestionario>();

                foreach (var participanteTotvs in participantesTotvs)
                {
                    try
                    {
                        // Verificar se o participante é válido
                        if (participanteTotvs == null || string.IsNullOrEmpty(participanteTotvs.Nome))
                        {
                            _logger.LogWarning("Participante inválido encontrado, pulando...");
                            continue;
                        }

                        // Verificar se já existe na base local
                        var participanteExistente = participantesExistentes.FirstOrDefault(p =>
                            (participanteTotvs.Tipo == TipoParticipante.Aluno && p.Aluno != null && p.Aluno.Matricula == participanteTotvs.RA) ||
                            (participanteTotvs.Tipo == TipoParticipante.Professor && p.Professor != null && p.Professor.Login == participanteTotvs.Login)
                        );

                        if (participanteExistente == null)
                        {
                            // Criar novo participante
                            var novoParticipante = new Participante
                            {
                                Nome = participanteTotvs.Nome,
                                Email = participanteTotvs.Email,
                                Tipo = participanteTotvs.Tipo
                            };

                            if (participanteTotvs.Tipo == TipoParticipante.Aluno)
                            {
                                novoParticipante.Aluno = new Aluno
                                {
                                    Matricula = participanteTotvs.RA ?? string.Empty,
                                    CursoId = participanteTotvs.CursoId ?? 0,
                                    InstituicaoId = participanteTotvs.InstituicaoId ?? 0,
                                    PeriodoLetivoId = participanteTotvs.PeriodoLetivoId ?? 0
                                };
                            }
                            else if (participanteTotvs.Tipo == TipoParticipante.Professor)
                            {
                                novoParticipante.Professor = new Professor
                                {
                                    Login = participanteTotvs.Login ?? string.Empty,
                                    InstituicaoId = participanteTotvs.InstituicaoId ?? 0
                                };
                            }

                            novosParticipantes.Add(novoParticipante);
                            participanteExistente = novoParticipante;
                        }

                        // Verificar se já está associado ao questionário
                        var jaAssociado = associacoesExistentes.Contains(participanteExistente.Id);

                        if (!jaAssociado)
                        {
                            // Usar o tipo identificado pelo TOTVS ou o do questionário
                            var tipoItemAvaliado = !string.IsNullOrEmpty(participanteTotvs.TipoItemAvaliado) 
                                ? Enum.Parse<TipoItemAvaliado>(participanteTotvs.TipoItemAvaliado)
                                : questionario.TipoItemAvaliado;

                            // Adicionar ao questionário com contexto
                            var participanteQuestionario = new ParticipanteQuestionario
                            {
                                QuestionarioId = request.QuestionarioId,
                                ParticipanteId = participanteExistente.Id,
                                CursoId = request.CursoId,
                                TurmaId = request.TurmaId,
                                DisciplinaId = request.DisciplinaId,
                                ProfessorId = request.ProfessorId,
                                InstituicaoId = participanteTotvs.InstituicaoId ?? 0,
                                PeriodoLetivoId = request.PeriodoLetivoId,
                                TipoItemAvaliado = tipoItemAvaliado,
                                NomeItemEspecifico = !string.IsNullOrEmpty(participanteTotvs.DisciplinaNome) 
                                    ? participanteTotvs.DisciplinaNome 
                                    : request.NomeItemEspecifico,
                                ItemAvaliadoId = request.ItemAvaliadoId
                            };

                            novasAssociacoes.Add(participanteQuestionario);
                            totalAdicionados++;

                            participantesAdicionados.Add(new
                            {
                                id = participanteExistente.Id,
                                nome = participanteExistente.Nome ?? string.Empty,
                                email = participanteExistente.Email ?? string.Empty,
                                tipo = participanteExistente.Tipo.ToString(),
                                ra = participanteTotvs.Tipo == TipoParticipante.Aluno ? (participanteTotvs.RA ?? string.Empty) : null,
                                login = participanteTotvs.Tipo == TipoParticipante.Professor ? (participanteTotvs.Login ?? string.Empty) : null,
                                contexto = participanteQuestionario.ContextoDescricao ?? string.Empty
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao processar participante {Nome}", participanteTotvs.Nome);
                        // Continuar com o próximo participante
                    }
                }

                // Salvar todos os novos participantes de uma vez
                if (novosParticipantes.Any())
                {
                    _context.Participantes.AddRange(novosParticipantes);
                    await _context.SaveChangesAsync();
                }

                // Salvar todas as novas associações de uma vez
                if (novasAssociacoes.Any())
                {
                    _context.ParticipantesQuestionarios.AddRange(novasAssociacoes);
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    message = $"Busca no TOTVS concluída. {totalAdicionados} participantes adicionados ao questionário.",
                    totalEncontrados = participantesTotvs.Count,
                    totalAdicionados = totalAdicionados,
                    participantes = participantesAdicionados
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar e adicionar participantes do TOTVS");
                return StatusCode(500, "Erro interno do servidor ao buscar participantes do TOTVS.");
            }
        }

        // DELETE: api/ParticipanteQuestionario/{questionarioId}/{participanteId}
        [HttpDelete("{questionarioId}/{participanteId}")]
        public async Task<IActionResult> RemoverParticipante(int questionarioId, int participanteId)
        {
            try
            {
                var participanteQuestionario = await _context.ParticipantesQuestionarios
                    .FirstOrDefaultAsync(pq => pq.QuestionarioId == questionarioId && pq.ParticipanteId == participanteId);

                if (participanteQuestionario == null)
                {
                    return NotFound(new { message = "Participante não encontrado neste questionário" });
                }

                _context.ParticipantesQuestionarios.Remove(participanteQuestionario);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Participante removido do questionário com sucesso" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }
    }
}
