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
using System.Runtime.Intrinsics.Arm;

namespace NpsPesquisa.Api.Services
{
    public class LembreteBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<LembreteBackgroundService> _logger;
        public readonly string urlBase = "https://nps.catolicasc.org.br/";

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

                        var template = @"<!DOCTYPE html>
<html lang='pt-br'>
<head>
  <meta charset='UTF-8'>
  <title>Pesquisa de Satisfação - Católica SC</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6;'>
  <div style='text-align: center;'>
    <img src='https://nps.catolicasc.org.br/imagens/logo-nps.png' width='300' alt='Logo NPS Católica SC' style='margin-bottom: 20px;'>

    " + questionario.TemplateEmailLembrete + @"<div style=""margin: 40px auto; text-align: center;"">
  <a href=""{{link}}"" 
     style=""display: inline-block; 
            background-color: #aa2439; 
            color: white; 
            font-size: 18px; 
            font-family: Arial, sans-serif; 
            text-decoration: none; 
            padding: 16px 24px; 
            border-radius: 8px; 
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);"">
    QUAL A SUA SATISFAÇÃO COM A CATÓLICA SC?<br>RESPONDA AQUI!
  </a>
</div>
    <footer style='font-size: 12px; color: #aaa; margin-top: 20px;'>
      <p>Centro Universitário Católica de Santa Catarina<br>
      Jaraguá do Sul | Joinville | Itajaí | Florianópolis<br>
      <a href='https://catolicasc.org.br' style='color: #fff;'>catolicasc.org.br</a> | 0800 600 005</p>
      <p style='font-size: 10px; color: #999;'>Não encaminhe este e-mail, pois este link de questionário é exclusivo para a sua conta. Caso queira cancelar a adesão de e-mails futuros, 
      <a href='#' 
         style='color: #0563c1;'>clique aqui</a>.</p>
    </footer>
  </div>
</body>
</html>";
                        foreach (var convite in convites)
                        {
                            // Controle de frequência de lembrete por convite
                            if (convite.DataUltimoLembrete.HasValue &&
                                (agora - convite.DataUltimoLembrete.Value).TotalDays < questionario.LembrarACadaXDias)
                            {
                                continue; // ainda não chegou o tempo de enviar novo lembrete
                            }

                            var aluno = convite.Aluno;
                            var link = urlBase + $"questionario/{convite.Chave}";
       
                            var emailBody = template
    .Replace("{{nome}}", aluno.Nome)
    .Replace("{{titulo}}", questionario.Titulo).Replace("{titulo}", questionario.Titulo)
    .Replace("{{link}}", link).Replace("{link}", link);

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