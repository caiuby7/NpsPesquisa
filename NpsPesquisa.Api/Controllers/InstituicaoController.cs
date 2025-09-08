using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InstituicaoController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public InstituicaoController(NpsDbContext context)
        {
            _context = context;
        }

        // GET: api/Instituicao
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Instituicao>>> GetInstituicoes()
        {
            return await _context.Instituicoes
                .Where(i => i.Ativo)
                .OrderBy(i => i.Nome)
                .ToListAsync();
        }

        // GET: api/Instituicao/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Instituicao>> GetInstituicao(int id)
        {
            var instituicao = await _context.Instituicoes.FindAsync(id);

            if (instituicao == null)
            {
                return NotFound();
            }

            return instituicao;
        }

        // GET: api/Instituicao/por-integracao/123
        [HttpGet("por-integracao/{integracaoId}")]
        public async Task<ActionResult<Instituicao>> GetInstituicaoPorIntegracao(int integracaoId)
        {
            var instituicao = await _context.Instituicoes
                .FirstOrDefaultAsync(i => i.IntegracaoId == integracaoId && i.Ativo);

            if (instituicao == null)
            {
                return NotFound();
            }

            return instituicao;
        }

        // POST: api/Instituicao
        [HttpPost]
        public async Task<ActionResult<Instituicao>> PostInstituicao(Instituicao instituicao)
        {
            try
            {
                // Validar se já existe uma instituição com o mesmo IntegracaoId
                var instituicaoExistente = await _context.Instituicoes
                    .FirstOrDefaultAsync(i => i.IntegracaoId == instituicao.IntegracaoId);

                if (instituicaoExistente != null)
                {
                    return BadRequest("Já existe uma instituição com este ID de integração");
                }

                instituicao.DataCadastro = DateTime.Now;
                instituicao.Ativo = true;

                _context.Instituicoes.Add(instituicao);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetInstituicao), new { id = instituicao.Id }, instituicao);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao criar instituição", error = ex.Message });
            }
        }

        // PUT: api/Instituicao/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutInstituicao(int id, Instituicao instituicao)
        {
            if (id != instituicao.Id)
            {
                return BadRequest();
            }

            try
            {
                // Verificar se a instituição existe
                var instituicaoExistente = await _context.Instituicoes.FindAsync(id);
                if (instituicaoExistente == null)
                {
                    return NotFound();
                }

                // Validar se já existe outra instituição com o mesmo IntegracaoId
                var instituicaoComIntegracao = await _context.Instituicoes
                    .FirstOrDefaultAsync(i => i.IntegracaoId == instituicao.IntegracaoId && i.Id != id);

                if (instituicaoComIntegracao != null)
                {
                    return BadRequest("Já existe outra instituição com este ID de integração");
                }

                instituicao.DataAtualizacao = DateTime.Now;
                instituicao.DataCadastro = instituicaoExistente.DataCadastro;

                _context.Entry(instituicaoExistente).CurrentValues.SetValues(instituicao);

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!InstituicaoExists(id))
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
                return StatusCode(500, new { message = "Erro ao atualizar instituição", error = ex.Message });
            }
        }

        // DELETE: api/Instituicao/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInstituicao(int id)
        {
            var instituicao = await _context.Instituicoes.FindAsync(id);
            if (instituicao == null)
            {
                return NotFound();
            }

            // Verificar se a instituição está sendo usada em algum lugar
            var cursosUsando = await _context.Cursos.AnyAsync(c => c.InstituicaoId == id);
            if (cursosUsando)
            {
                return BadRequest("Não é possível excluir esta instituição pois está sendo usada por cursos. Use a opção de desativar.");
            }

            _context.Instituicoes.Remove(instituicao);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Instituicao/5/ativar
        [HttpPatch("{id}/ativar")]
        public async Task<IActionResult> AtivarInstituicao(int id)
        {
            var instituicao = await _context.Instituicoes.FindAsync(id);
            if (instituicao == null)
            {
                return NotFound();
            }

            instituicao.Ativo = true;
            instituicao.DataAtualizacao = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Instituicao/5/desativar
        [HttpPatch("{id}/desativar")]
        public async Task<IActionResult> DesativarInstituicao(int id)
        {
            var instituicao = await _context.Instituicoes.FindAsync(id);
            if (instituicao == null)
            {
                return NotFound();
            }

            instituicao.Ativo = false;
            instituicao.DataAtualizacao = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InstituicaoExists(int id)
        {
            return _context.Instituicoes.Any(e => e.Id == id);
        }
    }
}
