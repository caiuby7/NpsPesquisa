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
    public class TurmaDisciplinaController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public TurmaDisciplinaController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TurmaDisciplina>>> GetAll()
        {
            return await _context.TurmaDisciplinas
                .Include(td => td.Turma)
                .Include(td => td.Disciplina)
                .Include(td => td.Professor)
                .Include(td => td.PeriodoLetivo)
                .Include(td => td.TurmaDisciplinaGerenciada)
                .Where(td => td.Ativo)
                .OrderBy(td => td.Turma.Nome)
                .ThenBy(td => td.Disciplina.Nome)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TurmaDisciplina>> GetById(int id)
        {
            var turmaDisciplina = await _context.TurmaDisciplinas
                .Include(td => td.Turma)
                .Include(td => td.Disciplina)
                .Include(td => td.Professor)
                .Include(td => td.PeriodoLetivo)
                .Include(td => td.TurmaDisciplinaGerenciada)
                .FirstOrDefaultAsync(td => td.Id == id);

            if (turmaDisciplina == null) return NotFound();

            return turmaDisciplina;
        }

        [HttpGet("por-turma/{turmaId}")]
        public async Task<ActionResult<IEnumerable<TurmaDisciplina>>> GetByTurma(int turmaId)
        {
            return await _context.TurmaDisciplinas
                .Include(td => td.Turma)
                .Include(td => td.Disciplina)
                .Include(td => td.Professor)
                .Include(td => td.PeriodoLetivo)
                .Include(td => td.TurmaDisciplinaGerenciada)
                .Where(td => td.TurmaId == turmaId && td.Ativo)
                .OrderBy(td => td.Disciplina.Nome)
                .ToListAsync();
        }

        [HttpGet("por-disciplina/{disciplinaId}")]
        public async Task<ActionResult<IEnumerable<TurmaDisciplina>>> GetByDisciplina(int disciplinaId)
        {
            return await _context.TurmaDisciplinas
                .Include(td => td.Turma)
                .Include(td => td.Disciplina)
                .Include(td => td.Professor)
                .Include(td => td.PeriodoLetivo)
                .Include(td => td.TurmaDisciplinaGerenciada)
                .Where(td => td.DisciplinaId == disciplinaId && td.Ativo)
                .OrderBy(td => td.Turma.Nome)
                .ToListAsync();
        }

        [HttpGet("gerenciadas")]
        public async Task<ActionResult<IEnumerable<TurmaDisciplina>>> GetGerenciadas()
        {
            return await _context.TurmaDisciplinas
                .Include(td => td.Turma)
                .Include(td => td.Disciplina)
                .Include(td => td.Professor)
                .Include(td => td.PeriodoLetivo)
                .Where(td => td.Gerenciada && td.Ativo)
                .OrderBy(td => td.Turma.Nome)
                .ThenBy(td => td.Disciplina.Nome)
                .ToListAsync();
        }

        [HttpGet("nao-gerenciadas")]
        public async Task<ActionResult<IEnumerable<TurmaDisciplina>>> GetNaoGerenciadas()
        {
            return await _context.TurmaDisciplinas
                .Include(td => td.Turma)
                .Include(td => td.Disciplina)
                .Include(td => td.Professor)
                .Include(td => td.PeriodoLetivo)
                .Include(td => td.TurmaDisciplinaGerenciada)
                .Where(td => !td.Gerenciada && td.Ativo)
                .OrderBy(td => td.Turma.Nome)
                .ThenBy(td => td.Disciplina.Nome)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<TurmaDisciplina>> Create(TurmaDisciplinaViewModel turmaDisciplinaViewModel)
        {
            try
            {
                // Validar se já existe uma relação entre turma, disciplina e período letivo
                var relacaoExistente = await _context.TurmaDisciplinas
                    .FirstOrDefaultAsync(td => td.TurmaId == turmaDisciplinaViewModel.TurmaId &&
                                             td.DisciplinaId == turmaDisciplinaViewModel.DisciplinaId &&
                                             td.PeriodoLetivoId == turmaDisciplinaViewModel.PeriodoLetivoId);

                if (relacaoExistente != null)
                {
                    return BadRequest("Já existe uma relação entre esta turma, disciplina e período letivo");
                }

                // Se não for gerenciada, validar se a turma-disciplina gerenciada existe
                if (!turmaDisciplinaViewModel.Gerenciada && turmaDisciplinaViewModel.IdTurmaDisciplinaGerenciada > 0)
                {
                    var turmaDisciplinaGerenciada = await _context.TurmaDisciplinas
                        .FirstOrDefaultAsync(td => td.Id == turmaDisciplinaViewModel.IdTurmaDisciplinaGerenciada);

                    if (turmaDisciplinaGerenciada == null)
                    {
                        return BadRequest("A turma-disciplina gerenciada referenciada não foi encontrada");
                    }
                }

                var turmaDisciplina = new TurmaDisciplina
                {
                    TurmaId = turmaDisciplinaViewModel.TurmaId,
                    DisciplinaId = turmaDisciplinaViewModel.DisciplinaId,
                    ProfessorId = turmaDisciplinaViewModel.ProfessorId,
                    PeriodoLetivoId = turmaDisciplinaViewModel.PeriodoLetivoId,
                    IntegracaoId = turmaDisciplinaViewModel.IntegracaoId,
                    Ativo = turmaDisciplinaViewModel.Ativo,
                    Gerenciada = turmaDisciplinaViewModel.Gerenciada,
                    IdTurmaDisciplinaGerenciada = turmaDisciplinaViewModel.IdTurmaDisciplinaGerenciada,
                    DataCriacao = DateTime.Now
                };

                _context.TurmaDisciplinas.Add(turmaDisciplina);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = turmaDisciplina.Id }, turmaDisciplina);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao criar relação turma-disciplina", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, TurmaDisciplinaViewModel turmaDisciplinaViewModel)
        {
            try
            {
                var turmaDisciplina = await _context.TurmaDisciplinas.FindAsync(id);
                if (turmaDisciplina == null) return NotFound();

                // Validar se já existe outra relação entre turma, disciplina e período letivo
                var relacaoComMesmaCombinacao = await _context.TurmaDisciplinas
                    .FirstOrDefaultAsync(td => td.TurmaId == turmaDisciplinaViewModel.TurmaId &&
                                             td.DisciplinaId == turmaDisciplinaViewModel.DisciplinaId &&
                                             td.PeriodoLetivoId == turmaDisciplinaViewModel.PeriodoLetivoId &&
                                             td.Id != id);

                if (relacaoComMesmaCombinacao != null)
                {
                    return BadRequest("Já existe outra relação entre esta turma, disciplina e período letivo");
                }

                // Se não for gerenciada, validar se a turma-disciplina gerenciada existe
                if (!turmaDisciplinaViewModel.Gerenciada && turmaDisciplinaViewModel.IdTurmaDisciplinaGerenciada > 0)
                {
                    var turmaDisciplinaGerenciada = await _context.TurmaDisciplinas
                        .FirstOrDefaultAsync(td => td.Id == turmaDisciplinaViewModel.IdTurmaDisciplinaGerenciada);

                    if (turmaDisciplinaGerenciada == null)
                    {
                        return BadRequest("A turma-disciplina gerenciada referenciada não foi encontrada");
                    }
                }

                turmaDisciplina.TurmaId = turmaDisciplinaViewModel.TurmaId;
                turmaDisciplina.DisciplinaId = turmaDisciplinaViewModel.DisciplinaId;
                turmaDisciplina.ProfessorId = turmaDisciplinaViewModel.ProfessorId;
                turmaDisciplina.PeriodoLetivoId = turmaDisciplinaViewModel.PeriodoLetivoId;
                turmaDisciplina.IntegracaoId = turmaDisciplinaViewModel.IntegracaoId;
                turmaDisciplina.Ativo = turmaDisciplinaViewModel.Ativo;
                turmaDisciplina.Gerenciada = turmaDisciplinaViewModel.Gerenciada;
                turmaDisciplina.IdTurmaDisciplinaGerenciada = turmaDisciplinaViewModel.IdTurmaDisciplinaGerenciada;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!TurmaDisciplinaExists(id))
                        return NotFound();
                    throw;
                }

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar relação turma-disciplina", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var turmaDisciplina = await _context.TurmaDisciplinas.FindAsync(id);
                if (turmaDisciplina == null) return NotFound();

                // Verificar se a relação está sendo usada em algum lugar
                // Por enquanto, permitimos exclusão direta, mas pode ser necessário verificar outras tabelas

                _context.TurmaDisciplinas.Remove(turmaDisciplina);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao excluir relação turma-disciplina", error = ex.Message });
            }
        }

        [HttpPatch("{id}/ativar")]
        public async Task<IActionResult> AtivarTurmaDisciplina(int id)
        {
            try
            {
                var turmaDisciplina = await _context.TurmaDisciplinas.FindAsync(id);
                if (turmaDisciplina == null) return NotFound();

                turmaDisciplina.Ativo = true;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao ativar relação turma-disciplina", error = ex.Message });
            }
        }

        [HttpPatch("{id}/desativar")]
        public async Task<IActionResult> DesativarTurmaDisciplina(int id)
        {
            try
            {
                var turmaDisciplina = await _context.TurmaDisciplinas.FindAsync(id);
                if (turmaDisciplina == null) return NotFound();

                turmaDisciplina.Ativo = false;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao desativar relação turma-disciplina", error = ex.Message });
            }
        }

        private bool TurmaDisciplinaExists(int id)
        {
            return _context.TurmaDisciplinas.Any(e => e.Id == id);
        }
    }
}
