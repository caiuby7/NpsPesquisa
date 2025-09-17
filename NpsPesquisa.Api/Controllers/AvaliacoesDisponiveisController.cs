using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;
using System.Security.Claims;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AvaliacoesDisponiveisController : ControllerBase
    {
        private readonly NpsDbContext _context;
        private readonly ILogger<AvaliacoesDisponiveisController> _logger;

        public AvaliacoesDisponiveisController(NpsDbContext context, ILogger<AvaliacoesDisponiveisController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AvaliacaoDisponivelDto>>> GetAvaliacoesDisponiveis()
        {
            try
            {
                // Obtém o ID do usuário do token JWT
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized("Usuário não autenticado");
                }

                // Busca o usuário no banco
                var usuario = await _context.Usuarios
                    .Include(u => u.Perfil)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (usuario == null)
                {
                    return NotFound("Usuário não encontrado");
                }

                // Busca avaliações disponíveis baseadas no perfil do usuário
                var avaliacoesDisponiveis = await _context.Questionarios
                    .Where(a => a.Ativo && 
                               a.DataInicio.HasValue && a.DataInicio <= DateTime.Now && 
                               a.DataFim.HasValue && a.DataFim >= DateTime.Now &&
                               a.Tipo == TipoQuestionario.AvaliacaoInstitucional)
                    .Include(a => a.Participantes)
                    .ToListAsync();

                var resultado = new List<AvaliacaoDisponivelDto>();

                foreach (var avaliacao in avaliacoesDisponiveis)
                {
                    // Verifica se o usuário é participante desta avaliação
                    var isParticipante = await VerificarSeUsuarioEParticipante(userId, avaliacao, usuario);
                    
                    if (!isParticipante)
                        continue; // Pula avaliações que o usuário não é participante

                    // Verifica se o usuário já respondeu esta avaliação
                    var jaRespondeu = await VerificarSeUsuarioJaRespondeu(userId, avaliacao.Id, usuario);

                    var status = jaRespondeu ? "respondido" : "disponivel";

                    resultado.Add(new AvaliacaoDisponivelDto
                    {
                        Id = avaliacao.Id,
                        Titulo = avaliacao.Titulo,
                        Descricao = avaliacao.Descricao,
                        DataInicio = avaliacao.DataInicio ?? DateTime.MinValue,
                        DataFim = avaliacao.DataFim ?? DateTime.MaxValue,
                        Status = status,
                        TipoItemAvaliado = avaliacao.TipoItemAvaliado?.ToString() ?? "Não definido",
                        Progresso = jaRespondeu ? 100 : 0
                    });
                }

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar avaliações disponíveis para o usuário {UserId}");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AvaliacaoDisponivelDto>> GetAvaliacaoDisponivel(int id)
        {
            try
            {
                // Obtém o ID do usuário do token JWT
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized("Usuário não autenticado");
                }

                // Busca o usuário no banco
                var usuario = await _context.Usuarios
                    .Include(u => u.Perfil)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (usuario == null)
                {
                    return NotFound("Usuário não encontrado");
                }

                var avaliacao = await _context.Questionarios
                    .Include(a => a.Participantes)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (avaliacao == null)
                {
                    return NotFound("Avaliação não encontrada");
                }

                // Verifica se o usuário já respondeu esta avaliação
                var jaRespondeu = await VerificarSeUsuarioJaRespondeu(userId, avaliacao.Id, usuario);

                var status = jaRespondeu ? "respondido" : "disponivel";

                var resultado = new AvaliacaoDisponivelDto
                {
                    Id = avaliacao.Id,
                    Titulo = avaliacao.Titulo,
                    Descricao = avaliacao.Descricao,
                    DataInicio = avaliacao.DataInicio ?? DateTime.MinValue,
                    DataFim = avaliacao.DataFim ?? DateTime.MaxValue,
                    Status = status,
                    TipoItemAvaliado = avaliacao.TipoItemAvaliado?.ToString() ?? "Não definido",
                    Progresso = jaRespondeu ? 100 : 0
                };

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar avaliação {AvaliacaoId} para o usuário {UserId}", id);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        private async Task<bool> VerificarSeUsuarioEParticipante(int userId, Questionario avaliacao, Usuario usuario)
        {
            try
            {
                // Verifica se o usuário está na lista de participantes da avaliação
                // Busca primeiro o participante pelo email do usuário
                var participante = await _context.Participantes
                    .FirstOrDefaultAsync(p => p.Email == usuario.Email);
                
                if (participante != null)
                {
                    var participanteQuestionario = await _context.ParticipantesQuestionarios
                        .FirstOrDefaultAsync(pq => pq.QuestionarioId == avaliacao.Id && 
                                                  pq.ParticipanteId == participante.Id);
                    
                    if (participanteQuestionario != null)
                    {
                        return true; // Usuário está explicitamente na lista de participantes
                    }
                }


                // Se não está na lista explícita, verifica baseado no perfil e tipo de avaliação
                var perfilUsuario = usuario.Perfil?.Nome?.ToLower();

                // Para alunos/participantes
                if (perfilUsuario == "participante" || perfilUsuario == "aluno")
                {
                    // Verifica se a avaliação é para alunos
                    if (avaliacao.TipoItemAvaliado == TipoItemAvaliado.Professor || 
                        avaliacao.TipoItemAvaliado == TipoItemAvaliado.Disciplina ||
                        avaliacao.TipoItemAvaliado == TipoItemAvaliado.TurmaDisciplina)
                    {
                        // Verifica se o usuário é aluno e está relacionado ao item avaliado
                        var aluno = await _context.Alunos.FirstOrDefaultAsync(a => a.Email == usuario.Email);
                        if (aluno != null)
                        {
                            // Verifica se o aluno está relacionado ao item avaliado da avaliação
                            return await VerificarRelacaoAlunoItemAvaliado(aluno, avaliacao);
                        }
                    }
                }

                // Para professores/coordenação
                if (perfilUsuario == "coordenacao" || perfilUsuario == "professor")
                {
                    // Verifica se a avaliação é para professores
                    if (avaliacao.TipoItemAvaliado == TipoItemAvaliado.Alunos ||
                        avaliacao.TipoItemAvaliado == TipoItemAvaliado.Disciplina ||
                        avaliacao.TipoItemAvaliado == TipoItemAvaliado.TurmaDisciplina)
                    {
                        // Verifica se o usuário é professor e está relacionado ao item avaliado
                        var professor = await _context.Professores.FirstOrDefaultAsync(p => p.Email == usuario.Email);
                        if (professor != null)
                        {
                            // Verifica se o professor está relacionado ao item avaliado da avaliação
                            return await VerificarRelacaoProfessorItemAvaliado(professor, avaliacao);
                        }
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao verificar se usuário {UserId} é participante da avaliação {AvaliacaoId}", userId, avaliacao.Id);
                return false;
            }
        }

        private async Task<bool> VerificarRelacaoAlunoItemAvaliado(Aluno aluno, Questionario avaliacao)
        {
            // Verifica se o aluno está relacionado ao item avaliado da avaliação
            // Por exemplo: se a avaliação é de uma disciplina, verifica se o aluno está matriculado nessa disciplina
            
            // Verifica se o aluno está relacionado aos itens avaliados do questionário
            if (avaliacao.ItensAvaliados != null)
            {
                foreach (var itemAvaliado in avaliacao.ItensAvaliados)
                {
                    // Para avaliações de professor específico
                    if (itemAvaliado.ProfessorId.HasValue)
                    {
                        var temProfessor = aluno.TurmasDisciplinas
                            .Any(td => td.ProfessorId == itemAvaliado.ProfessorId && td.Ativo);
                        if (temProfessor) return true;
                    }

                    // Para avaliações de disciplina específica
                    if (itemAvaliado.DisciplinaId.HasValue)
                    {
                        var temDisciplina = aluno.TurmasDisciplinas
                            .Any(td => td.DisciplinaId == itemAvaliado.DisciplinaId && td.Ativo);
                        if (temDisciplina) return true;
                    }

                    // Para avaliações de turma específica
                    if (itemAvaliado.TurmaId.HasValue && aluno.TurmaId == itemAvaliado.TurmaId)
                        return true;

                    // Para avaliações de curso específico
                    if (itemAvaliado.CursoId.HasValue && aluno.CursoId == itemAvaliado.CursoId)
                        return true;
                }
            }

            return false;
        }

        private async Task<bool> VerificarRelacaoProfessorItemAvaliado(Professor professor, Questionario avaliacao)
        {
            // Verifica se o professor está relacionado ao item avaliado da avaliação
            // Por exemplo: se a avaliação é de alunos de uma disciplina que ele leciona
            
            // Verifica se o professor está relacionado aos itens avaliados do questionário
            if (avaliacao.ItensAvaliados != null)
            {
                foreach (var itemAvaliado in avaliacao.ItensAvaliados)
                {
                    // Para avaliações de disciplina que ele leciona
                    if (itemAvaliado.DisciplinaId.HasValue)
                    {
                        var disciplina = await _context.Disciplinas
                            .Include(d => d.Professores)
                            .FirstOrDefaultAsync(d => d.Id == itemAvaliado.DisciplinaId.Value);
                        
                        if (disciplina != null && disciplina.Professores.Any(p => p.Id == professor.Id))
                            return true;
                    }

                    // Para avaliações de turma que ele leciona
                    if (itemAvaliado.TurmaId.HasValue)
                    {
                        var turmaDisciplina = await _context.TurmaDisciplinas
                            .FirstOrDefaultAsync(td => td.TurmaId == itemAvaliado.TurmaId && 
                                                      td.ProfessorId == professor.Id);
                        if (turmaDisciplina != null)
                            return true;
                    }

                    // Para avaliações de curso que ele coordena
                    if (itemAvaliado.CursoId.HasValue)
                    {
                        var coordenadorCurso = await _context.CoordenadoresCursos
                            .FirstOrDefaultAsync(cc => cc.CursoId == itemAvaliado.CursoId && 
                                                       cc.CoordenadorId == professor.Id);
                        if (coordenadorCurso != null)
                            return true;
                    }
                }
            }

            return false;
        }

        private async Task<bool> VerificarSeUsuarioJaRespondeu(int userId, int questionarioId, Usuario usuario)
        {
            try
            {
                var perfilUsuario = usuario.Perfil?.Nome?.ToLower();

                // Para alunos/participantes
                if (perfilUsuario == "participante" || perfilUsuario == "aluno")
                {
                    // Busca o aluno pelo email
                    var aluno = await _context.Alunos.FirstOrDefaultAsync(a => a.Email == usuario.Email);
                    if (aluno != null)
                    {
                        // Busca participante relacionado ao aluno
                        var participante = await _context.Participantes
                            .FirstOrDefaultAsync(p => p.AlunoId == aluno.AlunoId);
                        
                        if (participante != null)
                        {
                            // Verifica se já respondeu através do ParticipanteId
                            var jaRespondeu = await _context.Respostas
                                .AnyAsync(r => r.QuestionarioId == questionarioId && 
                                              r.ParticipanteId == participante.Id);
                            return jaRespondeu;
                        }
                    }
                }

                // Para professores/coordenação
                if (perfilUsuario == "coordenacao" || perfilUsuario == "professor")
                {
                    // Busca o professor pelo email
                    var professor = await _context.Professores.FirstOrDefaultAsync(p => p.Email == usuario.Email);
                    if (professor != null)
                    {
                        // Busca participante relacionado ao professor
                        var participante = await _context.Participantes
                            .FirstOrDefaultAsync(p => p.ProfessorId == professor.Id);
                        
                        if (participante != null)
                        {
                            // Verifica se já respondeu através do ParticipanteId
                            var jaRespondeu = await _context.Respostas
                                .AnyAsync(r => r.QuestionarioId == questionarioId && 
                                              r.ParticipanteId == participante.Id);
                            return jaRespondeu;
                        }
                    }
                }

                // Fallback: verifica pelo email do usuário através de Participante
                var participantePorEmail = await _context.Participantes
                    .FirstOrDefaultAsync(p => p.Email == usuario.Email);
                
                if (participantePorEmail != null)
                {
                    var jaRespondeuPorEmail = await _context.Respostas
                        .AnyAsync(r => r.QuestionarioId == questionarioId && 
                                      r.ParticipanteId == participantePorEmail.Id);
                    return jaRespondeuPorEmail;
                }
                
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao verificar se usuário {UserId} já respondeu questionário {QuestionarioId}", userId, questionarioId);
                return false; // Em caso de erro, assume que não respondeu
            }
        }
    }

    public class AvaliacaoDisponivelDto
    {
        public int Id { get; set; }
        public string Titulo { get; set; }
        public string Descricao { get; set; }
        public DateTime DataInicio { get; set; }
        public DateTime DataFim { get; set; }
        public string Status { get; set; }
        public string TipoItemAvaliado { get; set; }
        public int Progresso { get; set; }
    }
}
