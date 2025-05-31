using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Models;
using NpsPesquisa.Api.Data;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrador")]
    public class PerfilController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public PerfilController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Perfil>>> GetAll()
        {
            return await _context.Perfis.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Perfil>> GetById(int id)
        {
            var perfil = await _context.Perfis.FindAsync(id);
            if (perfil == null) return NotFound();
            return perfil;
        }

        [HttpPost]
        public async Task<ActionResult<Perfil>> Create(Perfil perfil)
        {
            _context.Perfis.Add(perfil);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = perfil.Id }, perfil);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Perfil perfil)
        {
            if (id != perfil.Id) return BadRequest();
            _context.Entry(perfil).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var perfil = await _context.Perfis.FindAsync(id);
            if (perfil == null) return NotFound();

            // Verifica se existem usuários vinculados
            var usuariosVinculados = await _context.Usuarios.AnyAsync(u => u.PerfilId == id);
            if (usuariosVinculados)
                return BadRequest("Não é possível excluir um perfil que possui usuários vinculados.");

            _context.Perfis.Remove(perfil);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 