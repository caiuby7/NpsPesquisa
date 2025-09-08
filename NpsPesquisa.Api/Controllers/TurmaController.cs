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
    public class TurmaController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public TurmaController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Turma>>> GetAll()
        {
            return await _context.Turmas
                .Include(t => t.Curso)
                .Include(t => t.PeriodoLetivo)
                .Where(t => t.Ativo)
                .OrderBy(t => t.Nome)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Turma>> GetById(int id)
        {
            var turma = await _context.Turmas
                .Include(t => t.Curso)
                .Include(t => t.PeriodoLetivo)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (turma == null) return NotFound();

            return turma;
        }

        [HttpPost]
        public async Task<ActionResult<Turma>> Create(TurmaViewModel turmaViewModel)
        {
            try
            {
                // Validar se já existe uma turma com o mesmo nome no mesmo curso e período letivo
                var turmaExistente = await _context.Turmas
                    .FirstOrDefaultAsync(t => t.Nome == turmaViewModel.Nome && 
                                            t.CursoId == turmaViewModel.CursoId &&
                                            t.PeriodoLetivoId == turmaViewModel.PeriodoLetivoId);

                if (turmaExistente != null)
                {
                    return BadRequest("Já existe uma turma com este nome neste curso e período letivo");
                }

                var turma = new Turma
                {
                    Nome = turmaViewModel.Nome,
                    Descricao = turmaViewModel.Descricao,
                    CursoId = turmaViewModel.CursoId,
                    PeriodoLetivoId = turmaViewModel.PeriodoLetivoId,
                    Turno = turmaViewModel.Turno,
                    IntegracaoId = turmaViewModel.IntegracaoId,
                    Ativo = turmaViewModel.Ativo
                };

                _context.Turmas.Add(turma);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = turma.Id }, turma);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao criar turma", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, TurmaViewModel turmaViewModel)
        {
            try
            {
                var turma = await _context.Turmas.FindAsync(id);
                if (turma == null) return NotFound();

                // Validar se já existe outra turma com o mesmo nome no mesmo curso e período letivo
                var turmaComNome = await _context.Turmas
                    .FirstOrDefaultAsync(t => t.Nome == turmaViewModel.Nome && 
                                            t.CursoId == turmaViewModel.CursoId &&
                                            t.PeriodoLetivoId == turmaViewModel.PeriodoLetivoId &&
                                            t.Id != id);

                if (turmaComNome != null)
                {
                    return BadRequest("Já existe outra turma com este nome neste curso e período letivo");
                }

                turma.Nome = turmaViewModel.Nome;
                turma.Descricao = turmaViewModel.Descricao;
                turma.CursoId = turmaViewModel.CursoId;
                turma.PeriodoLetivoId = turmaViewModel.PeriodoLetivoId;
                turma.Turno = turmaViewModel.Turno;
                turma.IntegracaoId = turmaViewModel.IntegracaoId;
                turma.Ativo = turmaViewModel.Ativo;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!TurmaExists(id))
                        return NotFound();
                    throw;
                }

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar turma", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var turma = await _context.Turmas.FindAsync(id);
                if (turma == null) return NotFound();

                // Verificar se a turma está sendo usada em algum lugar
                var alunosUsando = await _context.Alunos.AnyAsync(a => a.TurmaId == id);
                var disciplinasUsando = await _context.TurmaDisciplinas.AnyAsync(td => td.TurmaId == id);

                if (alunosUsando || disciplinasUsando)
                {
                    return BadRequest("Não é possível excluir esta turma pois está sendo usada por alunos ou disciplinas. Use a opção de desativar.");
                }

                _context.Turmas.Remove(turma);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao excluir turma", error = ex.Message });
            }
        }

        [HttpPatch("{id}/ativar")]
        public async Task<IActionResult> AtivarTurma(int id)
        {
            try
            {
                var turma = await _context.Turmas.FindAsync(id);
                if (turma == null) return NotFound();

                turma.Ativo = true;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao ativar turma", error = ex.Message });
            }
        }

        [HttpPatch("{id}/desativar")]
        public async Task<IActionResult> DesativarTurma(int id)
        {
            try
            {
                var turma = await _context.Turmas.FindAsync(id);
                if (turma == null) return NotFound();

                turma.Ativo = false;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao desativar turma", error = ex.Message });
            }
        }

        private bool TurmaExists(int id)
        {
            return _context.Turmas.Any(e => e.Id == id);
        }
    }
}
