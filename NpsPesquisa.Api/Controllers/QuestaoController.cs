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
            // Validação do tipo de questão
            if (questaoDto.Tipo != TipoQuestao.CaixaTexto && (questaoDto.Opcoes == null || !questaoDto.Opcoes.Any()))
            {
                return BadRequest(new { message = "Questões do tipo " + questaoDto.Tipo + " devem ter opções" });
            }

            // Validação específica para questões do tipo Matriz
            if (questaoDto.Tipo == TipoQuestao.Matriz)
            {
                var temOpcoes = questaoDto.Opcoes?.Any(o => o.EhColuna == false) ?? false;
                var temColunas = questaoDto.Opcoes?.Any(o => o.EhColuna == true) ?? false;

                if (!temOpcoes || !temColunas)
                {
                    return BadRequest(new { message = "Questões do tipo Matriz devem ter tanto opções quanto colunas" });
                }
            }

            var questao = new Questao
            {
                Texto = questaoDto.Texto,
                Tipo = questaoDto.Tipo,
                Obrigatorio = questaoDto.Obrigatorio,
                IsCondicional = questaoDto.IsCondicional
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
                        EhColuna = questaoDto.Tipo == TipoQuestao.Matriz ? opcaoDto.EhColuna : false,
                        AtivaCondicao = opcaoDto.AtivaCondicao,
                        QuestaoCondicionalId = opcaoDto.QuestaoCondicionalId
                    };
                    _context.OpcoesQuestao.Add(opcao);
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
                    Obrigatorio = q.Obrigatorio,
                    IsCondicional = q.IsCondicional,
                    Opcoes = q.Tipo == TipoQuestao.CaixaTexto ? new List<OpcaoQuestaoResponseDto>() : 
                        q.Opcoes.Where(o => o.EhColuna == false).Select(o => new OpcaoQuestaoResponseDto
                        {
                            Id = o.Id,
                            Texto = o.Texto,
                            Valor = o.Valor,
                            Ordem = o.Ordem,
                            Peso = o.Peso,
                            EhColuna = o.EhColuna,
                            AtivaCondicao = o.AtivaCondicao,
                            QuestaoCondicionalId = o.QuestaoCondicionalId
                        }).ToList(),
                    Colunas = q.Tipo == TipoQuestao.Matriz ? 
                        q.Opcoes.Where(o => o.EhColuna == true).Select(o => new OpcaoQuestaoResponseDto
                        {
                            Id = o.Id,
                            Texto = o.Texto,
                            Valor = o.Valor,
                            Ordem = o.Ordem,
                            Peso = o.Peso,
                            EhColuna = o.EhColuna,
                            AtivaCondicao = o.AtivaCondicao,
                            QuestaoCondicionalId = o.QuestaoCondicionalId
                        }).ToList() : new List<OpcaoQuestaoResponseDto>()
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
                    Obrigatorio = q.Obrigatorio,
                    IsCondicional = q.IsCondicional,
                    Opcoes = q.Tipo == TipoQuestao.CaixaTexto ? new List<OpcaoQuestaoResponseDto>() : 
                        q.Opcoes.Where(o => o.EhColuna == false).Select(o => new OpcaoQuestaoResponseDto
                        {
                            Id = o.Id,
                            Texto = o.Texto,
                            Valor = o.Valor,
                            Ordem = o.Ordem,
                            Peso = o.Peso,
                            EhColuna = o.EhColuna,
                            AtivaCondicao = o.AtivaCondicao,
                            QuestaoCondicionalId = o.QuestaoCondicionalId
                        }).ToList(),
                    Colunas = q.Tipo == TipoQuestao.Matriz ? 
                        q.Opcoes.Where(o => o.EhColuna == true).Select(o => new OpcaoQuestaoResponseDto
                        {
                            Id = o.Id,
                            Texto = o.Texto,
                            Valor = o.Valor,
                            Ordem = o.Ordem,
                            Peso = o.Peso,
                            EhColuna = o.EhColuna,
                            AtivaCondicao = o.AtivaCondicao,
                            QuestaoCondicionalId = o.QuestaoCondicionalId
                        }).ToList() : new List<OpcaoQuestaoResponseDto>()
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

            // Verifica se há respostas que usam as opções desta questão
            var opcoesEmUso = await _context.RespostasQuestoes
                .Where(rq => rq.QuestaoId == id && rq.OpcaoId.HasValue)
                .Select(rq => rq.OpcaoId.Value)
                .ToListAsync();

            if (opcoesEmUso.Any())
            {
                return BadRequest(new { message = "Não é possível editar uma questão que possui respostas. As opções estão sendo utilizadas em respostas existentes." });
            }

            questao.Texto = questaoDto.Texto;
            questao.Tipo = questaoDto.Tipo;
            questao.Obrigatorio = questaoDto.Obrigatorio;
            questao.IsCondicional = questaoDto.IsCondicional;

            // Remove opções existentes (agora seguro pois verificamos que não estão em uso)
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
                        EhColuna = questaoDto.Tipo == TipoQuestao.Matriz ? opcaoDto.EhColuna : false,
                        AtivaCondicao = opcaoDto.AtivaCondicao,
                        QuestaoCondicionalId = opcaoDto.QuestaoCondicionalId
                    };
                    _context.OpcoesQuestao.Add(opcao);
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
            var questao = await _context.Questoes.FindAsync(questaoId);
            if (questao == null)
            {
                return BadRequest(new { message = "Questão não encontrada" });
            }

            // Se for questão do tipo Matriz, valida se EhColuna está definido
            if (questao.Tipo == TipoQuestao.Matriz && !opcao.EhColuna)
            {
                return BadRequest(new { message = "Para questões do tipo Matriz, o campo EhColuna é obrigatório" });
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

            // Verifica se a opção está sendo usada em respostas
            var opcaoEmUso = await _context.RespostasQuestoes
                .AnyAsync(rq => rq.OpcaoId == opcaoId);

            if (opcaoEmUso)
            {
                return BadRequest(new { message = "Não é possível excluir uma opção que está sendo utilizada em respostas existentes." });
            }

            _context.OpcoesQuestao.Remove(opcao);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 