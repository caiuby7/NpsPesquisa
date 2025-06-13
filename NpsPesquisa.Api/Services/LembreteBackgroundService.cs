using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NpsPesquisa.Api.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NpsPesquisa.Api.Services;

namespace NpsPesquisa.Api.Services
{
    public class LembreteBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<LembreteBackgroundService> _logger;

        public LembreteBackgroundService(IServiceProvider serviceProvider, ILogger<LembreteBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<NpsDbContext>();
                    var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();
                    var agora = DateTime.UtcNow;

                    var questionarios = await context.Questionarios
                        .Where(q => q.EnviarLembreteAutomatico && q.LembrarACadaXDias.HasValue)
                        .ToListAsync();

                    foreach (var questionario in questionarios)
                    {
                        var convitesQuery = context.ConvitesQuestionarios
                            .Include(c => c.Aluno)
                            .Where(c => c.QuestionarioId == questionario.Id);

                        if (!questionario.EnviarLembreteParaTodos)
                            convitesQuery = convitesQuery.Where(c => !c.Respondido);

                        var convites = await convitesQuery.ToListAsync();

                        var template = questionario.TemplateEmailLembrete
                            ?? @"<h2>Olá, {{nome}}!</h2>\n<p>Este é um lembrete para responder ao questionário: {{titulo}}</p>\n<p>Clique no link abaixo para acessar o questionário:</p>\n<p><a href='{{link}}'>{{link}}</a></p>\n<p>Este link é único e pessoal.</p>";

                        foreach (var convite in convites)
                        {
                            // Controle de frequência de lembrete por convite
                            if (convite.DataUltimoLembrete.HasValue &&
                                (agora - convite.DataUltimoLembrete.Value).TotalDays < questionario.LembrarACadaXDias)
                            {
                                continue; // ainda não chegou o tempo de enviar novo lembrete
                            }

                            var aluno = convite.Aluno;
                            var link = $"https://seusite.com.br/questionario/abrir?chave={convite.Chave}";
                            var emailBody = template
                                .Replace("{{nome}}", aluno.Nome)
                                .Replace("{{titulo}}", questionario.Titulo)
                                .Replace("{{link}}", link);

                            await emailService.SendEmailAsync(aluno.EmailInstitucional, "Lembrete: Questionário pendente", emailBody);

                            convite.DataUltimoLembrete = agora;
                        }
                        await context.SaveChangesAsync();
                    }
                }
                // Aguarda 1 hora antes de rodar novamente (ajuste conforme necessário)
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }
    }
} 