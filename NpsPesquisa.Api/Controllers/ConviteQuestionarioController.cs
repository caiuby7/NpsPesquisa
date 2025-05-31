using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;
using System.Security.Cryptography;
using System.Text;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ConviteQuestionarioController : ControllerBase
    {
        private readonly NpsDbContext _context;
        public ConviteQuestionarioController(NpsDbContext context)
        {
            _context = context;
        }

        // POST: api/ConviteQuestionario/gerar
        [HttpPost("gerar")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> GerarConvite([FromBody] GerarConviteDto dto)
        {
            var questionario = await _context.Questionarios.FindAsync(dto.QuestionarioId);
            var aluno = await _context.Alunos.FindAsync(dto.AlunoId);
            if (questionario == null || aluno == null)
                return BadRequest("Questionário ou aluno não encontrado.");

            // Gera chave única
            var chave = GerarChaveUnica();

            var convite = new ConviteQuestionario
            {
                QuestionarioId = dto.QuestionarioId,
                AlunoId = dto.AlunoId,
                Chave = chave,
                DataEnvio = DateTime.UtcNow,
                Respondido = false
            };
            _context.ConvitesQuestionarios.Add(convite);
            await _context.SaveChangesAsync();

            // Simula envio de e-mail
            var link = $"https://seusite.com.br/questionario/abrir?chave={chave}";
            var textoEmail = $"Olá {aluno.Nome},\n\nVocê foi convidado a responder o questionário '{questionario.Titulo}'.\nAcesse o link abaixo para responder:\n{link}\n\nObrigado!";

            return Ok(new { convite.Id, convite.Chave, Link = link, Email = textoEmail });
        }

        // GET: api/ConviteQuestionario/validar/{chave}
        [HttpGet("validar/{chave}")]
        public async Task<IActionResult> ValidarChave(string chave)
        {
            var convite = await _context.ConvitesQuestionarios
                .Include(c => c.Aluno)
                .Include(c => c.Questionario)
                .FirstOrDefaultAsync(c => c.Chave == chave);
            if (convite == null)
                return NotFound("Chave inválida.");

            return Ok(new
            {
                convite.Id,
                convite.AlunoId,
                Aluno = convite.Aluno.Nome,
                convite.QuestionarioId,
                Questionario = convite.Questionario.Titulo,
                convite.Respondido
            });
        }

        private string GerarChaveUnica()
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                var bytes = new byte[16];
                rng.GetBytes(bytes);
                return BitConverter.ToString(bytes).Replace("-", "").ToLower();
            }
        }
    }

    public class GerarConviteDto
    {
        public int QuestionarioId { get; set; }
        public int AlunoId { get; set; }
    }
} 