using iTextSharp.text;
using iTextSharp.text.pdf;
using System.Text;

namespace NpsPesquisa.Api.Services
{
    public class ReportService
    {
        public byte[] GeneratePdfReportFromHtml(string htmlContent, string formTitle)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                var document = new Document(PageSize.A4, 25, 25, 30, 30);
                var writer = PdfWriter.GetInstance(document, ms);

                document.Open();

                // Cores
                var primaryColor = new BaseColor(25, 118, 210); // #1976d2
                var successColor = new BaseColor(67, 160, 71); // #43a047
                var warningColor = new BaseColor(255, 152, 0); // #ff9800
                var dangerColor = new BaseColor(229, 57, 53); // #e53935

                // Título
                var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, primaryColor);
                var title = new Paragraph($"Dashboard - {formTitle}", titleFont);
                title.Alignment = Element.ALIGN_CENTER;
                document.Add(title);
                document.Add(new Paragraph(" ")); // Espaço

                // Conteúdo HTML simplificado
                var contentFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, BaseColor.Black);
                
                // Extrair texto do HTML (remover tags)
                var plainText = System.Text.RegularExpressions.Regex.Replace(htmlContent, "<[^>]*>", " ");
                plainText = System.Text.RegularExpressions.Regex.Replace(plainText, "\\s+", " ").Trim();
                
                var content = new Paragraph(plainText, contentFont);
                document.Add(content);

                document.Close();
                return ms.ToArray();
            }
        }

        public byte[] GenerateWordReportFromHtml(string htmlContent, string formTitle)
        {
            // Para Word, vamos criar um HTML simples que pode ser aberto no Word
            var wordHtml = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>{formTitle}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1 {{ color: #1976d2; text-align: center; }}
        .dashboard-content {{ margin-top: 20px; }}
        .footer {{ margin-top: 30px; text-align: center; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <h1>Dashboard - {formTitle}</h1>
    <div class='dashboard-content'>
        {htmlContent}
    </div>
    <div class='footer'>
        Gerado em {DateTime.Now:dd/MM/yyyy HH:mm}
    </div>
</body>
</html>";

            return Encoding.UTF8.GetBytes(wordHtml);
        }

        // Métodos antigos mantidos para compatibilidade
        public byte[] GeneratePdfReport(dynamic dashboardData, string formTitle)
        {
            // Criar HTML simples com os dados
            var htmlContent = GenerateHtmlFromDashboardData(dashboardData, formTitle);
            return GeneratePdfReportFromHtml(htmlContent, formTitle);
        }

        public byte[] GenerateWordReport(dynamic dashboardData, string formTitle)
        {
            // Criar HTML simples com os dados
            var htmlContent = GenerateHtmlFromDashboardData(dashboardData, formTitle);
            return GenerateWordReportFromHtml(htmlContent, formTitle);
        }

        private string GenerateHtmlFromDashboardData(dynamic dashboardData, string formTitle)
        {
            var html = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>{formTitle}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }}
        h1, h2, h3 {{ color: #1976d2; }}
        .metric {{ margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }}
        .metric-value {{ font-size: 24px; font-weight: bold; color: #1976d2; }}
        .table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
        .table th, .table td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        .table th {{ background-color: #f2f2f2; }}
        .comment {{ margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 4px solid #1976d2; }}
    </style>
</head>
<body>
    <h1>Dashboard - {formTitle}</h1>
    
    <div class='metric'>
        <h3>Total de Respostas</h3>
        <div class='metric-value'>{dashboardData.totalRespostas}</div>
    </div>

    <div class='metric'>
        <h3>NPS Geral</h3>
        <div class='metric-value'>{dashboardData.npsGeral}%</div>
        <p>Detalhamento: {dashboardData.npsDetalhamento.promotor}% Promotores, {dashboardData.npsDetalhamento.passivo}% Passivos, {dashboardData.npsDetalhamento.detrator}% Detratores</p>
    </div>

    <div class='metric'>
        <h3>Satisfação Geral</h3>
        <div class='metric-value'>{Math.Round((dashboardData.satisfacao / 5) * 1000) / 10}%</div>
        <p>Detalhamento: {dashboardData.satisfacaoDetalhamento.muitoInsatisfeito}% Muito Insatisfeito, {dashboardData.satisfacaoDetalhamento.insatisfeito}% Insatisfeito, {dashboardData.satisfacaoDetalhamento.nemInsatisfeitoNemSatisfeito}% Nem Satisfeito Nem Insatisfeito, {dashboardData.satisfacaoDetalhamento.satisfeito}% Satisfeito, {dashboardData.satisfacaoDetalhamento.muitoSatisfeito}% Muito Satisfeito</p>
    </div>";

            // Adicionar satisfação por curso se existir
            if (dashboardData.satisfacaoPorCurso != null && dashboardData.satisfacaoPorCurso.Count > 0)
            {
                html += "<h2>Satisfação por Curso</h2><table class='table'><tr><th>Curso</th><th>Total</th><th>Satisfação</th></tr>";
                foreach (var curso in dashboardData.satisfacaoPorCurso)
                {
                        // Converter para percentual igual ao frontend
                    double satisfacaoPercentual = Math.Round((curso.satisfacao / 5) * 1000) / 10;
                    html += $"<tr><td>{curso.curso}</td><td>{curso.total}</td><td>{satisfacaoPercentual}%</td></tr>";
                }
                html += "</table>";
            }

            // Adicionar comentários se existirem
            if (dashboardData.comentariosQ19 != null && dashboardData.comentariosQ19.Count > 0)
            {
                html += "<h2>Comentários - Questão 19</h2>";
                foreach (var comentario in dashboardData.comentariosQ19.Take(10)) // Limitar a 10 comentários
                {
                    html += $"<div class='comment'><strong>{comentario.curso}</strong> - {comentario.tipo}<br>{comentario.texto}</div>";
                }
            }

            if (dashboardData.comentariosQ23 != null && dashboardData.comentariosQ23.Count > 0)
            {
                html += "<h2>Comentários - Questão 23</h2>";
                foreach (var comentario in dashboardData.comentariosQ23.Take(10)) // Limitar a 10 comentários
                {
                    html += $"<div class='comment'><strong>{comentario.curso}</strong> - {comentario.tipo}<br>{comentario.texto}</div>";
                }
            }

            html += "</body></html>";
            return html;
        }
    }
} 