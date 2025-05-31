using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class RespostaController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public RespostaController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Resposta>> CreateResposta(RespostaDto respostaDto)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios)
                .ThenInclude(qq => qq.Questao)
                .FirstOrDefaultAsync(q => q.Id == respostaDto.QuestionarioId);

            if (questionario == null)
            {
                return NotFound("Questionário não encontrado");
            }

            var aluno = await _context.Alunos.FindAsync(respostaDto.AlunoId);
            if (aluno == null)
            {
                return NotFound("Aluno não encontrado");
            }

            // Verifica se o aluno já respondeu o questionário
            var respostaExistente = await _context.Respostas
                .FirstOrDefaultAsync(r => r.QuestionarioId == respostaDto.QuestionarioId && r.AlunoId == respostaDto.AlunoId);

            if (respostaExistente != null)
            {
                return BadRequest("Aluno já respondeu este questionário");
            }

            // Verifica se todas as questões do questionário foram respondidas
            var questoesQuestionario = questionario.QuestoesQuestionarios.Select(qq => qq.QuestaoId).ToList();
            var questoesRespondidas = respostaDto.RespostasQuestoes.Select(rq => rq.QuestaoId).ToList();

            if (!questoesQuestionario.All(q => questoesRespondidas.Contains(q)))
            {
                return BadRequest("Todas as questões do questionário devem ser respondidas");
            }

            // Verifica se as opções selecionadas existem e pertencem às questões corretas
            foreach (var respostaQuestao in respostaDto.RespostasQuestoes)
            {
                if (respostaQuestao.OpcaoId.HasValue)
                {
                    var opcaoExiste = await _context.OpcoesQuestao
                        .AnyAsync(o => o.Id == respostaQuestao.OpcaoId && o.QuestaoId == respostaQuestao.QuestaoId);

                    if (!opcaoExiste)
                    {
                        return BadRequest($"A opção {respostaQuestao.OpcaoId} não existe para a questão {respostaQuestao.QuestaoId}");
                    }
                }
            }

            var resposta = new Resposta
            {
                QuestionarioId = respostaDto.QuestionarioId,
                AlunoId = respostaDto.AlunoId,
                DataResposta = DateTime.UtcNow,
                RespostasQuestoes = respostaDto.RespostasQuestoes.Select(rq => new RespostaQuestao
                {
                    QuestaoId = rq.QuestaoId,
                    Valor = rq.Valor,
                    OpcaoId = rq.OpcaoId
                }).ToList()
            };

            _context.Respostas.Add(resposta);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetResposta), new { id = resposta.Id }, resposta);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<Resposta>> GetResposta(int id)
        {
            var resposta = await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                .ThenInclude(rq => rq.Questao)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (resposta == null)
            {
                return NotFound();
            }

            return resposta;
        }

        [HttpGet]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<IEnumerable<Resposta>>> GetRespostas()
        {
            return await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                .ThenInclude(rq => rq.Questao)
                .ToListAsync();
        }

        [HttpGet("questionario/{questionarioId}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<IEnumerable<Resposta>>> GetRespostasPorQuestionario(int questionarioId)
        {
            return await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                .ThenInclude(rq => rq.Questao)
                .Where(r => r.QuestionarioId == questionarioId)
                .ToListAsync();
        }

        [HttpGet("aluno/{alunoId}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<IEnumerable<Resposta>>> GetRespostasPorAluno(int alunoId)
        {
            return await _context.Respostas
                .Include(r => r.RespostasQuestoes)
                .ThenInclude(rq => rq.Questao)
                .Where(r => r.AlunoId == alunoId)
                .ToListAsync();
        }
    }
} 