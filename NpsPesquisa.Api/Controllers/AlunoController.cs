using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Models;
using NpsPesquisa.Api.Data;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlunoController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public AlunoController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<IEnumerable<Aluno>>> GetAll()
        {
            return await _context.Alunos
                .Include(a => a.Curso)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<Aluno>> GetById(int id)
        {
            var aluno = await _context.Alunos
                .Include(a => a.Curso)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aluno == null) return NotFound();
            return aluno;
        }

        [HttpPost]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<Aluno>> Create(Aluno aluno)
        {
            // Verifica se o curso existe
            var cursoExists = await _context.Cursos.AnyAsync(c => c.Id == aluno.CursoId);
            if (!cursoExists)
                return BadRequest("Curso não encontrado");

            _context.Alunos.Add(aluno);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = aluno.Id }, aluno);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> Update(int id, Aluno aluno)
        {
            if (id != aluno.Id) return BadRequest();

            // Verifica se o curso existe
            var cursoExists = await _context.Cursos.AnyAsync(c => c.Id == aluno.CursoId);
            if (!cursoExists)
                return BadRequest("Curso não encontrado");

            _context.Entry(aluno).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Delete(int id)
        {
            var aluno = await _context.Alunos.FindAsync(id);
            if (aluno == null) return NotFound();

            // Verifica se existem respostas vinculadas
            var respostasVinculadas = await _context.Respostas.AnyAsync(r => r.AlunoId == id);
            if (respostasVinculadas)
                return BadRequest("Não é possível excluir um aluno que possui respostas vinculadas.");

            _context.Alunos.Remove(aluno);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
} 