using System;
using System.Net.Mail;
using System.Threading.Tasks;

namespace NpsPesquisa.Api.Services
{
    public class EmailService
    {
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;

        public EmailService(string smtpServer, int smtpPort, string smtpUsername, string smtpPassword)
        {
            _smtpServer = smtpServer;
            _smtpPort = smtpPort;
            _smtpUsername = smtpUsername;
            _smtpPassword = smtpPassword;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            using (var client = new SmtpClient(_smtpServer, _smtpPort))
            {
                client.UseDefaultCredentials = false;
                client.Credentials = new System.Net.NetworkCredential(_smtpUsername, _smtpPassword);
                client.EnableSsl = true;

                var mailMessage = new MailMessage
                {
                    // From = new MailAddress("reitoria@catolicasc.org.br"),
                    From = new MailAddress(_smtpUsername),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                    Priority = MailPriority.High
                };
                mailMessage.To.Add(to);
               // mailMessage.To.Add("caiuby7@hotmail.com");
                try
                {
                    await client.SendMailAsync(mailMessage);
                }
                catch (Exception ex) 
                {
                    var e = ex;
                }
                finally
                {
                    mailMessage.Dispose();
                }


            }
        }
    }
}