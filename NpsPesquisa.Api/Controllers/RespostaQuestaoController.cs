using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class RespostaQuestaoController : ControllerBase
    {
        private readonly NpsDbContext _context;
        public RespostaQuestaoController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<IEnumerable<RespostaQuestao>>> GetAll()
        {
            return await _context.RespostasQuestoes.ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<RespostaQuestao>> GetById(int id)
        {
            var respostaQuestao = await _context.RespostasQuestoes.FindAsync(id);
            if (respostaQuestao == null) return NotFound();
            return respostaQuestao;
        }

        [HttpPost]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<RespostaQuestao>> Create(RespostaQuestao respostaQuestao)
        {
            _context.RespostasQuestoes.Add(respostaQuestao);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = respostaQuestao.Id }, respostaQuestao);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> Update(int id, RespostaQuestao respostaQuestao)
        {
            if (id != respostaQuestao.Id) return BadRequest();
            _context.Entry(respostaQuestao).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        
        public async Task<IActionResult> Delete(int id)
        {
            var respostaQuestao = await _context.RespostasQuestoes.FindAsync(id);
            if (respostaQuestao == null) return NotFound();
            _context.RespostasQuestoes.Remove(respostaQuestao);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 