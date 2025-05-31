using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuestaoQuestionarioController : ControllerBase
    {
        private readonly NpsDbContext _context;
        public QuestaoQuestionarioController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<QuestaoQuestionario>> AdicionarQuestaoAoQuestionario(QuestaoQuestionario questaoQuestionario)
        {
            // Verifica se a questão existe
            var questaoExists = await _context.Questoes.AnyAsync(q => q.Id == questaoQuestionario.QuestaoId);
            if (!questaoExists)
            {
                return BadRequest(new { message = "Questão não encontrada" });
            }

            // Verifica se o questionário existe
            var questionarioExists = await _context.Questionarios.AnyAsync(q => q.Id == questaoQuestionario.QuestionarioId);
            if (!questionarioExists)
            {
                return BadRequest(new { message = "Questionário não encontrado" });
            }

            // Verifica se a questão já está no questionário
            var questaoJaExiste = await _context.QuestoesQuestionarios
                .AnyAsync(qq => qq.QuestaoId == questaoQuestionario.QuestaoId && 
                               qq.QuestionarioId == questaoQuestionario.QuestionarioId);
            if (questaoJaExiste)
            {
                return BadRequest(new { message = "Esta questão já está neste questionário" });
            }

            _context.QuestoesQuestionarios.Add(questaoQuestionario);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = questaoQuestionario.Id }, questaoQuestionario);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<QuestaoQuestionario>> GetById(int id)
        {
            var questaoQuestionario = await _context.QuestoesQuestionarios
                .Include(qq => qq.Questao)
                .Include(qq => qq.Questionario)
                .FirstOrDefaultAsync(qq => qq.Id == id);
            
            if (questaoQuestionario == null) return NotFound();
            return questaoQuestionario;
        }

        [HttpGet("questionario/{questionarioId}")]
        public async Task<ActionResult<IEnumerable<QuestaoQuestionario>>> GetQuestoesDoQuestionario(int questionarioId)
        {
            var questoes = await _context.QuestoesQuestionarios
                .Include(qq => qq.Questao)
                .ThenInclude(q => q.Opcoes)
                .Where(qq => qq.QuestionarioId == questionarioId)
                .OrderBy(qq => qq.Ordem)
                .ToListAsync();
            
            return questoes;
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> RemoverQuestaoDoQuestionario(int id)
        {
            var questaoQuestionario = await _context.QuestoesQuestionarios.FindAsync(id);
            if (questaoQuestionario == null) return NotFound();

            _context.QuestoesQuestionarios.Remove(questaoQuestionario);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 