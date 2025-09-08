using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PeriodoLetivoController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public PeriodoLetivoController(NpsDbContext context)
        {
            _context = context;
        }

        // GET: api/PeriodoLetivo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PeriodoLetivo>>> GetPeriodosLetivos()
        {
            return await _context.PeriodosLetivos
                .Where(p => p.Ativo)
                .OrderBy(p => p.Codigo)
                .ToListAsync();
        }

        // GET: api/PeriodoLetivo/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PeriodoLetivo>> GetPeriodoLetivo(int id)
        {
            var periodoLetivo = await _context.PeriodosLetivos.FindAsync(id);

            if (periodoLetivo == null)
            {
                return NotFound();
            }

            return periodoLetivo;
        }

        // GET: api/PeriodoLetivo/por-codigo/2024.1
        [HttpGet("por-codigo/{codigo}")]
        public async Task<ActionResult<PeriodoLetivo>> GetPeriodoLetivoPorCodigo(string codigo)
        {
            var periodoLetivo = await _context.PeriodosLetivos
                .FirstOrDefaultAsync(p => p.Codigo == codigo && p.Ativo);

            if (periodoLetivo == null)
            {
                return NotFound();
            }

            return periodoLetivo;
        }

        // POST: api/PeriodoLetivo
        [HttpPost]
        public async Task<ActionResult<PeriodoLetivo>> PostPeriodoLetivo(PeriodoLetivoViewModel viewModel)
        {
            try
            {
                // Validar se já existe um período letivo com o mesmo código
                var periodoExistente = await _context.PeriodosLetivos
                    .FirstOrDefaultAsync(p => p.Codigo == viewModel.Codigo);

                if (periodoExistente != null)
                {
                    return BadRequest("Já existe um período letivo com este código");
                }

                // Converter ViewModel para Model
                var periodoLetivo = new PeriodoLetivo
                {
                    Nome = viewModel.Nome,
                    Codigo = viewModel.Codigo,
                    TipoCurso = ConverterStringParaTipoCurso(viewModel.TipoCurso),
                    Ativo = viewModel.Ativo,
                    DataCadastro = DateTime.Now
                };

                _context.PeriodosLetivos.Add(periodoLetivo);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetPeriodoLetivo), new { id = periodoLetivo.Id }, periodoLetivo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao criar período letivo", error = ex.Message });
            }
        }

        // PUT: api/PeriodoLetivo/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPeriodoLetivo(int id, PeriodoLetivoViewModel viewModel)
        {
            if (id != viewModel.Id)
            {
                return BadRequest();
            }

            try
            {
                // Verificar se o período letivo existe
                var periodoExistente = await _context.PeriodosLetivos.FindAsync(id);
                if (periodoExistente == null)
                {
                    return NotFound();
                }

                // Validar se já existe outro período letivo com o mesmo código
                var periodoComCodigo = await _context.PeriodosLetivos
                    .FirstOrDefaultAsync(p => p.Codigo == viewModel.Codigo && p.Id != id);

                if (periodoComCodigo != null)
                {
                    return BadRequest("Já existe outro período letivo com este código");
                }

                // Atualizar apenas os campos permitidos
                periodoExistente.Nome = viewModel.Nome;
                periodoExistente.Codigo = viewModel.Codigo;
                periodoExistente.TipoCurso = ConverterStringParaTipoCurso(viewModel.TipoCurso);
                periodoExistente.Ativo = viewModel.Ativo;
                periodoExistente.DataAtualizacao = DateTime.Now;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!PeriodoLetivoExists(id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar período letivo", error = ex.Message });
            }
        }

        // DELETE: api/PeriodoLetivo/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePeriodoLetivo(int id)
        {
            var periodoLetivo = await _context.PeriodosLetivos.FindAsync(id);
            if (periodoLetivo == null)
            {
                return NotFound();
            }

            // Verificar se o período letivo está sendo usado em algum lugar
            var turmasUsando = await _context.Turmas.AnyAsync(t => t.PeriodoLetivoId == id);

            if (turmasUsando)
            {
                return BadRequest("Não é possível excluir este período letivo pois está sendo usado por turmas. Use a opção de desativar.");
            }

            _context.PeriodosLetivos.Remove(periodoLetivo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/PeriodoLetivo/5/ativar
        [HttpPatch("{id}/ativar")]
        public async Task<IActionResult> AtivarPeriodoLetivo(int id)
        {
            var periodoLetivo = await _context.PeriodosLetivos.FindAsync(id);
            if (periodoLetivo == null)
            {
                return NotFound();
            }

            periodoLetivo.Ativo = true;
            periodoLetivo.DataAtualizacao = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/PeriodoLetivo/5/desativar
        [HttpPatch("{id}/desativar")]
        public async Task<IActionResult> DesativarPeriodoLetivo(int id)
        {
            var periodoLetivo = await _context.PeriodosLetivos.FindAsync(id);
            if (periodoLetivo == null)
            {
                return NotFound();
            }

            periodoLetivo.Ativo = false;
            periodoLetivo.DataAtualizacao = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PeriodoLetivoExists(int id)
        {
            return _context.PeriodosLetivos.Any(e => e.Id == id);
        }

        private static TipoCurso ConverterStringParaTipoCurso(string tipoCurso)
        {
            return tipoCurso.ToUpper() switch
            {
                "GRADUAÇÃO" or "GRADUACAO" => TipoCurso.GRADUACAO,
                "PÓS-GRADUAÇÃO" or "POS-GRADUACAO" or "PÓSGRADUAÇÃO" or "POSGRADUACAO" => TipoCurso.POSGRADUACAO,
                _ => TipoCurso.GRADUACAO // Valor padrão
            };
        }
    }
}
