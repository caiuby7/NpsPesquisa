using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemAvaliadoQuestionarioController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public ItemAvaliadoQuestionarioController(NpsDbContext context)
        {
            _context = context;
        }

        // GET: api/ItemAvaliadoQuestionario
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemAvaliadoQuestionario>>> GetItensAvaliadosQuestionarios()
        {
            return await _context.ItensAvaliadosQuestionarios
                .Include(iaq => iaq.Questionario)
                .Where(iaq => iaq.Ativo)
                .OrderBy(iaq => iaq.OrdemApresentacao)
                .ThenBy(iaq => iaq.NomeItemEspecifico)
                .ToListAsync();
        }

        // GET: api/ItemAvaliadoQuestionario/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ItemAvaliadoQuestionario>> GetItemAvaliadoQuestionario(int id)
        {
            var itemAvaliado = await _context.ItensAvaliadosQuestionarios
                .Include(iaq => iaq.Questionario)
                .FirstOrDefaultAsync(iaq => iaq.Id == id);

            if (itemAvaliado == null)
            {
                return NotFound();
            }

            return itemAvaliado;
        }

        // GET: api/ItemAvaliadoQuestionario/questionario/5
        [HttpGet("questionario/{questionarioId}")]
        public async Task<ActionResult<IEnumerable<ItemAvaliadoQuestionario>>> GetItensPorQuestionario(int questionarioId)
        {
            return await _context.ItensAvaliadosQuestionarios
                .Where(iaq => iaq.QuestionarioId == questionarioId && iaq.Ativo)
                .OrderBy(iaq => iaq.OrdemApresentacao)
                .ThenBy(iaq => iaq.NomeItemEspecifico)
                .ToListAsync();
        }

        // POST: api/ItemAvaliadoQuestionario
        [HttpPost]
        public async Task<ActionResult<ItemAvaliadoQuestionario>> PostItemAvaliadoQuestionario(ItemAvaliadoQuestionario itemAvaliado)
        {
            if (string.IsNullOrWhiteSpace(itemAvaliado.NomeItemEspecifico))
            {
                return BadRequest("O nome do item é obrigatório");
            }

            // Verificar se o questionário existe
            var questionario = await _context.Questionarios.FindAsync(itemAvaliado.QuestionarioId);
            if (questionario == null)
            {
                return BadRequest("Questionário não encontrado");
            }

            // Verificar se já existe um item com o mesmo nome no mesmo questionário
            var itemExistente = await _context.ItensAvaliadosQuestionarios
                .FirstOrDefaultAsync(iaq => iaq.QuestionarioId == itemAvaliado.QuestionarioId && 
                                           iaq.NomeItemEspecifico.ToLower() == itemAvaliado.NomeItemEspecifico.ToLower());

            if (itemExistente != null)
            {
                return BadRequest("Já existe um item com este nome neste questionário");
            }

            // Definir ordem de apresentação se não foi definida
            if (itemAvaliado.OrdemApresentacao == 0)
            {
                var maxOrdem = await _context.ItensAvaliadosQuestionarios
                    .Where(iaq => iaq.QuestionarioId == itemAvaliado.QuestionarioId)
                    .MaxAsync(iaq => (int?)iaq.OrdemApresentacao) ?? 0;
                itemAvaliado.OrdemApresentacao = maxOrdem + 1;
            }

            itemAvaliado.DataCriacao = DateTime.UtcNow;
            itemAvaliado.Ativo = true;

            _context.ItensAvaliadosQuestionarios.Add(itemAvaliado);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItemAvaliadoQuestionario), new { id = itemAvaliado.Id }, itemAvaliado);
        }

        // PUT: api/ItemAvaliadoQuestionario/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutItemAvaliadoQuestionario(int id, ItemAvaliadoQuestionario itemAvaliado)
        {
            if (id != itemAvaliado.Id)
            {
                return BadRequest();
            }

            if (string.IsNullOrWhiteSpace(itemAvaliado.NomeItemEspecifico))
            {
                return BadRequest("O nome do item é obrigatório");
            }

            var itemExistente = await _context.ItensAvaliadosQuestionarios.FindAsync(id);
            if (itemExistente == null)
            {
                return NotFound();
            }

            // Verificar se já existe outro item com o mesmo nome no mesmo questionário
            var itemDuplicado = await _context.ItensAvaliadosQuestionarios
                .FirstOrDefaultAsync(iaq => iaq.QuestionarioId == itemAvaliado.QuestionarioId && 
                                           iaq.Id != id &&
                                           iaq.NomeItemEspecifico.ToLower() == itemAvaliado.NomeItemEspecifico.ToLower());

            if (itemDuplicado != null)
            {
                return BadRequest("Já existe um item com este nome neste questionário");
            }

            itemExistente.NomeItemEspecifico = itemAvaliado.NomeItemEspecifico;
            itemExistente.DescricaoItem = itemAvaliado.DescricaoItem;
            itemExistente.TipoItemAvaliado = itemAvaliado.TipoItemAvaliado;
            itemExistente.ItemAvaliadoId = itemAvaliado.ItemAvaliadoId;
            itemExistente.OrdemApresentacao = itemAvaliado.OrdemApresentacao;
            itemExistente.Observacoes = itemAvaliado.Observacoes;
            itemExistente.DataAtualizacao = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ItemAvaliadoQuestionarioExists(id))
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

        // DELETE: api/ItemAvaliadoQuestionario/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItemAvaliadoQuestionario(int id)
        {
            var itemAvaliado = await _context.ItensAvaliadosQuestionarios.FindAsync(id);
            if (itemAvaliado == null)
            {
                return NotFound();
            }

            // Verificar se há respostas para este item
            var temRespostas = await _context.Respostas
                .AnyAsync(r => r.TipoItemAvaliado == itemAvaliado.TipoItemAvaliado && 
                               r.NomeItemEspecifico == itemAvaliado.NomeItemEspecifico);

            if (temRespostas)
            {
                return BadRequest("Não é possível excluir este item pois já existem respostas associadas a ele");
            }

            _context.ItensAvaliadosQuestionarios.Remove(itemAvaliado);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/ItemAvaliadoQuestionario/5/ativar
        [HttpPatch("{id}/ativar")]
        public async Task<IActionResult> AtivarItemAvaliadoQuestionario(int id)
        {
            var itemAvaliado = await _context.ItensAvaliadosQuestionarios.FindAsync(id);
            if (itemAvaliado == null)
            {
                return NotFound();
            }

            itemAvaliado.Ativo = true;
            itemAvaliado.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/ItemAvaliadoQuestionario/5/desativar
        [HttpPatch("{id}/desativar")]
        public async Task<IActionResult> DesativarItemAvaliadoQuestionario(int id)
        {
            var itemAvaliado = await _context.ItensAvaliadosQuestionarios.FindAsync(id);
            if (itemAvaliado == null)
            {
                return NotFound();
            }

            itemAvaliado.Ativo = false;
            itemAvaliado.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/ItemAvaliadoQuestionario/5/reordenar
        [HttpPatch("{id}/reordenar")]
        public async Task<IActionResult> ReordenarItemAvaliadoQuestionario(int id, [FromBody] int novaOrdem)
        {
            var itemAvaliado = await _context.ItensAvaliadosQuestionarios.FindAsync(id);
            if (itemAvaliado == null)
            {
                return NotFound();
            }

            itemAvaliado.OrdemApresentacao = novaOrdem;
            itemAvaliado.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool ItemAvaliadoQuestionarioExists(int id)
        {
            return _context.ItensAvaliadosQuestionarios.Any(e => e.Id == id);
        }
    }
}
