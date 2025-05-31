using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuestaoController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public QuestaoController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<QuestaoResponseDto>> CreateQuestao(QuestaoPostDto questaoDto)
        {
            var questao = new Questao
            {
                Texto = questaoDto.Texto,
                Tipo = questaoDto.Tipo
            };

            _context.Questoes.Add(questao);
            await _context.SaveChangesAsync();

            if (questaoDto.Opcoes != null)
            {
                foreach (var opcaoDto in questaoDto.Opcoes)
                {
                    var opcao = new OpcaoQuestao
                    {
                        QuestaoId = questao.Id,
                        Texto = opcaoDto.Texto,
                        Valor = opcaoDto.Valor,
                        Ordem = opcaoDto.Ordem,
                        Peso = opcaoDto.Peso,
                        EhColuna = false
                    };
                    _context.OpcoesQuestao.Add(opcao);
                }
            }

            if (questaoDto.Colunas != null)
            {
                foreach (var colunaDto in questaoDto.Colunas)
                {
                    var coluna = new OpcaoQuestao
                    {
                        QuestaoId = questao.Id,
                        Texto = colunaDto.Texto,
                        Valor = colunaDto.Valor,
                        Ordem = colunaDto.Ordem,
                        Peso = colunaDto.Peso,
                        EhColuna = true
                    };
                    _context.OpcoesQuestao.Add(coluna);
                }
            }

            await _context.SaveChangesAsync();

            return await GetQuestao(questao.Id);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<QuestaoResponseDto>> GetQuestao(int id)
        {
            var questao = await _context.Questoes
                .Include(q => q.Opcoes)
                .Where(q => q.Id == id)
                .Select(q => new QuestaoResponseDto
                {
                    Id = q.Id,
                    Texto = q.Texto,
                    Tipo = q.Tipo,
                    Opcoes = q.Opcoes.Where(o => !o.EhColuna).Select(o => new OpcaoQuestaoResponseDto
                    {
                        Id = o.Id,
                        Texto = o.Texto,
                        Valor = o.Valor,
                        Ordem = o.Ordem,
                        Peso = o.Peso,
                        EhColuna = o.EhColuna
                    }).ToList(),
                    Colunas = q.Opcoes.Where(o => o.EhColuna).Select(o => new OpcaoQuestaoResponseDto
                    {
                        Id = o.Id,
                        Texto = o.Texto,
                        Valor = o.Valor,
                        Ordem = o.Ordem,
                        Peso = o.Peso,
                        EhColuna = o.EhColuna
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (questao == null)
            {
                return NotFound();
            }

            return questao;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuestaoResponseDto>>> GetQuestoes()
        {
            var questoes = await _context.Questoes
                .Include(q => q.Opcoes)
                .Select(q => new QuestaoResponseDto
                {
                    Id = q.Id,
                    Texto = q.Texto,
                    Tipo = q.Tipo,
                    Opcoes = q.Opcoes.Where(o => !o.EhColuna).Select(o => new OpcaoQuestaoResponseDto
                    {
                        Id = o.Id,
                        Texto = o.Texto,
                        Valor = o.Valor,
                        Ordem = o.Ordem,
                        Peso = o.Peso,
                        EhColuna = o.EhColuna
                    }).ToList(),
                    Colunas = q.Opcoes.Where(o => o.EhColuna).Select(o => new OpcaoQuestaoResponseDto
                    {
                        Id = o.Id,
                        Texto = o.Texto,
                        Valor = o.Valor,
                        Ordem = o.Ordem,
                        Peso = o.Peso,
                        EhColuna = o.EhColuna
                    }).ToList()
                })
                .ToListAsync();

            return questoes;
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> UpdateQuestao(int id, QuestaoPostDto questaoDto)
        {
            var questao = await _context.Questoes
                .Include(q => q.Opcoes)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questao == null)
            {
                return NotFound();
            }

            questao.Texto = questaoDto.Texto;
            questao.Tipo = questaoDto.Tipo;

            // Remove opções existentes
            _context.OpcoesQuestao.RemoveRange(questao.Opcoes);

            // Adiciona novas opções
            if (questaoDto.Opcoes != null)
            {
                foreach (var opcaoDto in questaoDto.Opcoes)
                {
                    var opcao = new OpcaoQuestao
                    {
                        QuestaoId = questao.Id,
                        Texto = opcaoDto.Texto,
                        Valor = opcaoDto.Valor,
                        Ordem = opcaoDto.Ordem,
                        Peso = opcaoDto.Peso,
                        EhColuna = false
                    };
                    _context.OpcoesQuestao.Add(opcao);
                }
            }

            // Adiciona novas colunas
            if (questaoDto.Colunas != null)
            {
                foreach (var colunaDto in questaoDto.Colunas)
                {
                    var coluna = new OpcaoQuestao
                    {
                        QuestaoId = questao.Id,
                        Texto = colunaDto.Texto,
                        Valor = colunaDto.Valor,
                        Ordem = colunaDto.Ordem,
                        Peso = colunaDto.Peso,
                        EhColuna = true
                    };
                    _context.OpcoesQuestao.Add(coluna);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuestaoExists(id))
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeleteQuestao(int id)
        {
            var questao = await _context.Questoes
                .Include(q => q.Opcoes)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questao == null)
            {
                return NotFound();
            }

            // Verifica se a questão está vinculada a algum questionário
            var questaoVinculada = await _context.QuestoesQuestionarios.AnyAsync(qq => qq.QuestaoId == id);
            if (questaoVinculada)
                return BadRequest("Não é possível excluir uma questão que está vinculada a questionários.");

            _context.OpcoesQuestao.RemoveRange(questao.Opcoes);
            _context.Questoes.Remove(questao);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool QuestaoExists(int id)
        {
            return _context.Questoes.Any(e => e.Id == id);
        }

        [HttpGet("tipos")]
        public ActionResult<IEnumerable<string>> GetTiposQuestao()
        {
            var tipos = Enum.GetNames(typeof(TipoQuestao));
            return Ok(tipos);
        }

        [HttpGet("{questaoId}/opcoes")]
        public async Task<ActionResult<IEnumerable<OpcaoQuestao>>> GetOpcoes(int questaoId)
        {
            var opcoes = await _context.OpcoesQuestao
                .Where(o => o.QuestaoId == questaoId)
                .OrderBy(o => o.Ordem)
                .ToListAsync();
            return Ok(opcoes);
        }

        [HttpPost("{questaoId}/opcoes")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<OpcaoQuestao>> AddOpcao(int questaoId, OpcaoQuestao opcao)
        {
            // Verifica se a questão existe
            var questaoExists = await _context.Questoes.AnyAsync(q => q.Id == questaoId);
            if (!questaoExists)
            {
                return BadRequest(new { message = "Questão não encontrada" });
            }

            opcao.QuestaoId = questaoId;
            _context.OpcoesQuestao.Add(opcao);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOpcoes), new { questaoId = questaoId }, opcao);
        }

        [HttpDelete("opcoes/{opcaoId}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> DeleteOpcao(int opcaoId)
        {
            var opcao = await _context.OpcoesQuestao.FindAsync(opcaoId);
            if (opcao == null) return NotFound();
            _context.OpcoesQuestao.Remove(opcao);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 