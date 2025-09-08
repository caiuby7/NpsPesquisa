using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParticipanteQuestionarioController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public ParticipanteQuestionarioController(NpsDbContext context)
        {
            _context = context;
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
                        cpf = pq.Participante.Cpf
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
                    Status = "Pendente" // Status padrão para novos participantes
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

    public class ParticipanteQuestionarioDto
    {
        public int QuestionarioId { get; set; }
        public int ParticipanteId { get; set; }
    }
}
