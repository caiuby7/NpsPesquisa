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
    public class CursoController : ControllerBase
    {
        private readonly NpsDbContext _context;
        public CursoController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Curso>>> GetAll()
        {
            return await _context.Cursos.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Curso>> GetById(int id)
        {
            var curso = await _context.Cursos.FindAsync(id);
            if (curso == null) return NotFound();
            return curso;
        }

        [HttpPost]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<Curso>> Create(Curso curso)
        {
            _context.Cursos.Add(curso);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = curso.Id }, curso);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> Update(int id, Curso curso)
        {
            if (id != curso.Id) return BadRequest();
            _context.Entry(curso).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Delete(int id)
        {
            var curso = await _context.Cursos.FindAsync(id);
            if (curso == null) return NotFound();

            // Verifica se existem alunos vinculados
            var alunosVinculados = await _context.Alunos.AnyAsync(a => a.CursoId == id);
            if (alunosVinculados)
                return BadRequest("Não é possível excluir um curso que possui alunos vinculados.");

            _context.Cursos.Remove(curso);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 