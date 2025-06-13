using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;
using System.Security.Cryptography;
using System.Text;
using NpsPesquisa.Api.Services;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ConviteQuestionarioController : ControllerBase
    {
        private readonly NpsDbContext _context;
        private readonly EmailService _emailService;

        public ConviteQuestionarioController(NpsDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
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

            // Verifica se já existe convite para este aluno/questionário
            var conviteExistente = await _context.ConvitesQuestionarios
                .FirstOrDefaultAsync(c => c.QuestionarioId == dto.QuestionarioId && c.AlunoId == dto.AlunoId);

            if (conviteExistente != null)
            {
                // Simula envio de e-mail
                var linkExistente = $"https://seusite.com.br/questionario/abrir?chave={conviteExistente.Chave}";
                var textoEmailExistente = $"Olá {aluno.Nome},\n\nVocê já possui um convite para o questionário '{questionario.Titulo}'.\nAcesse o link abaixo para responder:\n{linkExistente}\n\nObrigado!";
                return Ok(new { conviteExistente.Id, conviteExistente.Chave, Link = linkExistente, Email = textoEmailExistente });
            }

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
            var template = questionario.TemplateEmailConvite 
                ?? @"<h2>Olá, {{nome}}!</h2>\n<p>Você foi convidado para responder ao questionário: {{titulo}}</p>\n<p>Clique no link abaixo para acessar o questionário:</p>\n<p><a href='{{link}}'>{{link}}</a></p>\n<p>Este link é único e pessoal.</p>";

            var emailBody = template
                .Replace("{{nome}}", aluno.Nome)
                .Replace("{{titulo}}", questionario.Titulo)
                .Replace("{{link}}", link);

            return Ok(new { convite.Id, convite.Chave, Link = link, Email = emailBody });
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

        [HttpPost("lembrete/{conviteId}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> EnviarLembrete(int conviteId)
        {
            var convite = await _context.ConvitesQuestionarios
                .Include(c => c.Questionario)
                .Include(c => c.Aluno)
                .FirstOrDefaultAsync(c => c.Id == conviteId);

            if (convite == null)
                return NotFound("Convite não encontrado.");

            if (convite.Respondido)
                return BadRequest("O participante já respondeu o questionário.");

            var questionario = convite.Questionario;
            var aluno = convite.Aluno;
            var link = $"https://seusite.com.br/questionario/abrir?chave={convite.Chave}";

            var template = questionario.TemplateEmailLembrete
                ?? @"<h2>Olá, {{nome}}!</h2>\n<p>Este é um lembrete para responder ao questionário: {{titulo}}</p>\n<p>Clique no link abaixo para acessar o questionário:</p>\n<p><a href='{{link}}'>{{link}}</a></p>\n<p>Este link é único e pessoal.</p>";

            var emailBody = template
                .Replace("{{nome}}", aluno.Nome)
                .Replace("{{titulo}}", questionario.Titulo)
                .Replace("{{link}}", link);

            // Enviar e-mail (simulado)
            await _emailService.SendEmailAsync(aluno.EmailInstitucional, "Lembrete: Questionário pendente", emailBody);

            return Ok(new { convite.Id, convite.Chave, Link = link, Email = emailBody });
        }

        [HttpPost("lembrete/questionario/{questionarioId}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<IActionResult> EnviarLembreteParaTodos(int questionarioId)
        {
            var questionario = await _context.Questionarios.FindAsync(questionarioId);
            if (questionario == null)
                return NotFound("Questionário não encontrado.");

            var convites = await _context.ConvitesQuestionarios
                .Include(c => c.Aluno)
                .Where(c => c.QuestionarioId == questionarioId && !c.Respondido)
                .ToListAsync();

            if (!convites.Any())
                return Ok(new { message = "Nenhum convite pendente para este questionário." });

            var template = questionario.TemplateEmailLembrete
                ?? @"<h2>Olá, {{nome}}!</h2>\n<p>Este é um lembrete para responder ao questionário: {{titulo}}</p>\n<p>Clique no link abaixo para acessar o questionário:</p>\n<p><a href='{{link}}'>{{link}}</a></p>\n<p>Este link é único e pessoal.</p>";

            foreach (var convite in convites)
            {
                var aluno = convite.Aluno;
                var link = $"https://seusite.com.br/questionario/abrir?chave={convite.Chave}";
                var emailBody = template
                    .Replace("{{nome}}", aluno.Nome)
                    .Replace("{{titulo}}", questionario.Titulo)
                    .Replace("{{link}}", link);
                // Enviar e-mail (simulado)
                await _emailService.SendEmailAsync(aluno.EmailInstitucional, "Lembrete: Questionário pendente", emailBody);
            }

            return Ok(new { message = $"Lembretes enviados para {convites.Count} participantes." });
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