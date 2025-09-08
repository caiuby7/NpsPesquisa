using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Models;
using NpsPesquisa.Api.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DisciplinaController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public DisciplinaController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Disciplina>>> GetAll()
        {
            return await _context.Disciplinas
                .Include(d => d.Instituicao)
                .Where(d => d.Ativo)
                .OrderBy(d => d.Nome)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Disciplina>> GetById(int id)
        {
            var disciplina = await _context.Disciplinas
                .Include(d => d.Instituicao)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (disciplina == null) return NotFound();

            return disciplina;
        }

        [HttpPost]
        public async Task<ActionResult<Disciplina>> Create(DisciplinaViewModel disciplinaViewModel)
        {
            try
            {
                // Validar se já existe uma disciplina com o mesmo nome na mesma instituição
                var disciplinaExistente = await _context.Disciplinas
                    .FirstOrDefaultAsync(d => d.Nome == disciplinaViewModel.Nome && 
                                            d.InstituicaoId == disciplinaViewModel.InstituicaoId);

                if (disciplinaExistente != null)
                {
                    return BadRequest("Já existe uma disciplina com este nome nesta instituição");
                }

                var disciplina = new Disciplina
                {
                    Nome = disciplinaViewModel.Nome,
                    Descricao = disciplinaViewModel.Descricao,
                    Codigo = disciplinaViewModel.Codigo,
                    Ativo = disciplinaViewModel.Ativo,
                    InstituicaoId = disciplinaViewModel.InstituicaoId
                };

                _context.Disciplinas.Add(disciplina);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = disciplina.Id }, disciplina);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao criar disciplina", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DisciplinaViewModel disciplinaViewModel)
        {
            try
            {
                var disciplina = await _context.Disciplinas.FindAsync(id);
                if (disciplina == null) return NotFound();

                // Validar se já existe outra disciplina com o mesmo nome na mesma instituição
                var disciplinaComNome = await _context.Disciplinas
                    .FirstOrDefaultAsync(d => d.Nome == disciplinaViewModel.Nome && 
                                            d.InstituicaoId == disciplinaViewModel.InstituicaoId &&
                                            d.Id != id);

                if (disciplinaComNome != null)
                {
                    return BadRequest("Já existe outra disciplina com este nome nesta instituição");
                }

                disciplina.Nome = disciplinaViewModel.Nome;
                disciplina.Descricao = disciplinaViewModel.Descricao;
                disciplina.Codigo = disciplinaViewModel.Codigo;
                disciplina.Ativo = disciplinaViewModel.Ativo;
                disciplina.InstituicaoId = disciplinaViewModel.InstituicaoId;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!DisciplinaExists(id))
                        return NotFound();
                    throw;
                }

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar disciplina", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var disciplina = await _context.Disciplinas.FindAsync(id);
                if (disciplina == null) return NotFound();

                // Verificar se a disciplina está sendo usada em algum lugar
                var turmasUsando = await _context.TurmaDisciplinas.AnyAsync(td => td.DisciplinaId == id);
                var professoresUsando = await _context.Professores.AnyAsync(p => p.TurmasDisciplinas.Any(x=>x.Disciplina.Id == id));

                if (turmasUsando || professoresUsando)
                {
                    return BadRequest("Não é possível excluir esta disciplina pois está sendo usada por turmas ou professores. Use a opção de desativar.");
                }

                _context.Disciplinas.Remove(disciplina);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao excluir disciplina", error = ex.Message });
            }
        }

        [HttpPatch("{id}/ativar")]
        public async Task<IActionResult> AtivarDisciplina(int id)
        {
            try
            {
                var disciplina = await _context.Disciplinas.FindAsync(id);
                if (disciplina == null) return NotFound();

                disciplina.Ativo = true;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao ativar disciplina", error = ex.Message });
            }
        }

        [HttpPatch("{id}/desativar")]
        public async Task<IActionResult> DesativarDisciplina(int id)
        {
            try
            {
                var disciplina = await _context.Disciplinas.FindAsync(id);
                if (disciplina == null) return NotFound();

                disciplina.Ativo = false;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao desativar disciplina", error = ex.Message });
            }
        }

        private bool DisciplinaExists(int id)
        {
            return _context.Disciplinas.Any(e => e.Id == id);
        }
    }
}
