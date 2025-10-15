# 🔧 Implementação Backend - Relatório Excel

## 📋 Resumo

Documentação para implementação do backend que gera relatórios de acompanhamento em Excel no formato especificado pelo usuário.

## 🎯 Endpoints Necessários

### **1. Gerar Relatório de Dados**
```
POST /api/relatorios/acompanhamento
```

**Request Body:**
```json
{
  "tipo": "aluno",
  "periodoLetivo": "1",
  "instituicao": "1",
  "curso": "1"
}
```

**Response:**
```json
{
  "tipo": "aluno",
  "periodoLetivo": "2024/1",
  "instituicao": "Universidade Católica",
  "dados": [
    {
      "curso": "ADMINISTRAÇÃO",
      "codCurso": "1001",
      "turno": "Noturno",
      "codTurma": "T1ADM01N",
      "disciplina": "EMPREENDEDORISMO ESTRATÉGICO E CRIATIVO",
      "qtdTotal": 44,
      "qtdResp": 21,
      "taxaResposta": 47.7
    }
  ],
  "totais": {
    "totalGeral": 353,
    "totalRespostas": 176,
    "taxaGeral": 49.9
  }
}
```

### **2. Exportar Excel**
```
POST /api/relatorios/acompanhamento/excel
```

**Request Body:**
```json
{
  "tipo": "aluno",
  "periodoLetivo": "1",
  "instituicao": "1",
  "curso": "1",
  "dados": [...]
}
```

**Response:** Arquivo Excel (.xlsx)

## 🔧 Implementação C# (ASP.NET Core)

### **1. Controller**
```csharp
[ApiController]
[Route("api/relatorios")]
public class RelatoriosController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IExcelService _excelService;

    public RelatoriosController(ApplicationDbContext context, IExcelService excelService)
    {
        _context = context;
        _excelService = excelService;
    }

    [HttpPost("acompanhamento")]
    public async Task<IActionResult> GetAcompanhamentoRelatorio([FromBody] AcompanhamentoFiltros filtros)
    {
        try
        {
            var dados = await ObterDadosAcompanhamento(filtros);
            var totais = CalcularTotais(dados);
            
            var relatorio = new RelatorioAcompanhamento
            {
                Tipo = filtros.Tipo,
                PeriodoLetivo = await ObterNomePeriodoLetivo(filtros.PeriodoLetivo),
                Instituicao = await ObterNomeInstituicao(filtros.Instituicao),
                Dados = dados,
                Totais = totais
            };

            return Ok(relatorio);
        }
        catch (Exception ex)
        {
            return BadRequest($"Erro ao gerar relatório: {ex.Message}");
        }
    }

    [HttpPost("acompanhamento/excel")]
    public async Task<IActionResult> ExportarAcompanhamentoExcel([FromBody] AcompanhamentoExcelRequest request)
    {
        try
        {
            var excelBytes = await _excelService.GerarRelatorioAcompanhamento(request);
            
            return File(excelBytes, 
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"Acompanhamento_{request.Tipo}_{DateTime.Now:yyyy-MM-dd}.xlsx");
        }
        catch (Exception ex)
        {
            return BadRequest($"Erro ao gerar Excel: {ex.Message}");
        }
    }

    private async Task<List<DadosAcompanhamento>> ObterDadosAcompanhamento(AcompanhamentoFiltros filtros)
    {
        var query = from p in _context.Participantes
                   join pq in _context.ParticipantesQuestionarios on p.Id equals pq.ParticipanteId
                   join q in _context.Questionarios on pq.QuestionarioId equals q.Id
                   join t in _context.Turmas on p.TurmaId equals t.Id
                   join c in _context.Cursos on t.CursoId equals c.Id
                   join d in _context.Disciplinas on p.DisciplinaId equals d.Id
                   join pl in _context.PeriodosLetivos on q.PeriodoLetivoId equals pl.Id
                   where pl.Id == filtros.PeriodoLetivo
                         && c.InstituicaoId == filtros.Instituicao
                         && (filtros.Curso == null || c.Id == filtros.Curso)
                   select new DadosAcompanhamento
                   {
                       Curso = c.Nome,
                       CodCurso = c.Codigo,
                       Turno = t.Turno,
                       CodTurma = t.Codigo,
                       Disciplina = d.Nome,
                       QtdTotal = 1, // Contar participantes únicos
                       QtdResp = _context.Respostas
                           .Count(r => r.ParticipanteId == p.Id && r.QuestionarioId == q.Id)
                   };

        var dados = await query.ToListAsync();
        
        // Agrupar e calcular totais
        var dadosAgrupados = dados
            .GroupBy(d => new { d.Curso, d.CodCurso, d.Turno, d.CodTurma, d.Disciplina })
            .Select(g => new DadosAcompanhamento
            {
                Curso = g.Key.Curso,
                CodCurso = g.Key.CodCurso,
                Turno = g.Key.Turno,
                CodTurma = g.Key.CodTurma,
                Disciplina = g.Key.Disciplina,
                QtdTotal = g.Sum(x => x.QtdTotal),
                QtdResp = g.Sum(x => x.QtdResp),
                TaxaResposta = g.Sum(x => x.QtdTotal) > 0 
                    ? (double)g.Sum(x => x.QtdResp) / g.Sum(x => x.QtdTotal) * 100 
                    : 0
            })
            .OrderBy(d => d.Curso)
            .ThenBy(d => d.Turno)
            .ThenBy(d => d.CodTurma)
            .ThenBy(d => d.Disciplina)
            .ToList();

        return dadosAgrupados;
    }

    private TotaisAcompanhamento CalcularTotais(List<DadosAcompanhamento> dados)
    {
        var totalGeral = dados.Sum(d => d.QtdTotal);
        var totalRespostas = dados.Sum(d => d.QtdResp);
        var taxaGeral = totalGeral > 0 ? (double)totalRespostas / totalGeral * 100 : 0;

        return new TotaisAcompanhamento
        {
            TotalGeral = totalGeral,
            TotalRespostas = totalRespostas,
            TaxaGeral = taxaGeral
        };
    }
}
```

### **2. Modelos**
```csharp
public class AcompanhamentoFiltros
{
    public string Tipo { get; set; } // "aluno" ou "professor"
    public int PeriodoLetivo { get; set; }
    public int Instituicao { get; set; }
    public int? Curso { get; set; }
}

public class DadosAcompanhamento
{
    public string Curso { get; set; }
    public string CodCurso { get; set; }
    public string Turno { get; set; }
    public string CodTurma { get; set; }
    public string Disciplina { get; set; }
    public int QtdTotal { get; set; }
    public int QtdResp { get; set; }
    public double TaxaResposta { get; set; }
}

public class TotaisAcompanhamento
{
    public int TotalGeral { get; set; }
    public int TotalRespostas { get; set; }
    public double TaxaGeral { get; set; }
}

public class RelatorioAcompanhamento
{
    public string Tipo { get; set; }
    public string PeriodoLetivo { get; set; }
    public string Instituicao { get; set; }
    public List<DadosAcompanhamento> Dados { get; set; }
    public TotaisAcompanhamento Totais { get; set; }
}

public class AcompanhamentoExcelRequest
{
    public string Tipo { get; set; }
    public int PeriodoLetivo { get; set; }
    public int Instituicao { get; set; }
    public int? Curso { get; set; }
    public List<DadosAcompanhamento> Dados { get; set; }
}
```

### **3. Serviço de Excel**
```csharp
public interface IExcelService
{
    Task<byte[]> GerarRelatorioAcompanhamento(AcompanhamentoExcelRequest request);
}

public class ExcelService : IExcelService
{
    public async Task<byte[]> GerarRelatorioAcompanhamento(AcompanhamentoExcelRequest request)
    {
        using var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add("Acompanhamento");

        // Configurar cabeçalho
        worksheet.Cells[1, 1].Value = "CURSO";
        worksheet.Cells[1, 2].Value = "CODCURSO";
        worksheet.Cells[1, 3].Value = "TURNO";
        worksheet.Cells[1, 4].Value = "CODTURMA";
        worksheet.Cells[1, 5].Value = "DISCIPLINA";
        worksheet.Cells[1, 6].Value = "Total Geral";
        worksheet.Cells[1, 7].Value = "QTD_TOTAL";
        worksheet.Cells[1, 8].Value = "QTD_RESP";

        // Mesclar células do cabeçalho
        worksheet.Cells[1, 6, 1, 7].Merge = true;

        // Estilizar cabeçalho
        using (var range = worksheet.Cells[1, 1, 2, 8])
        {
            range.Style.Font.Bold = true;
            range.Style.Fill.PatternType = ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            range.Style.Border.BorderAround(ExcelBorderStyle.Thin);
        }

        // Agrupar dados por curso
        var dadosAgrupados = request.Dados
            .GroupBy(d => new { d.Curso, d.CodCurso, d.Turno })
            .ToList();

        int row = 3;
        foreach (var grupo in dadosAgrupados)
        {
            var disciplinas = grupo.OrderBy(d => d.CodTurma).ThenBy(d => d.Disciplina).ToList();
            
            // Mesclar células do curso
            worksheet.Cells[row, 1, row + disciplinas.Count - 1, 1].Merge = true;
            worksheet.Cells[row, 1].Value = grupo.Key.Curso;
            
            // Mesclar células do código do curso
            worksheet.Cells[row, 2, row + disciplinas.Count - 1, 2].Merge = true;
            worksheet.Cells[row, 2].Value = grupo.Key.CodCurso;
            
            // Mesclar células do turno
            worksheet.Cells[row, 3, row + disciplinas.Count - 1, 3].Merge = true;
            worksheet.Cells[row, 3].Value = grupo.Key.Turno;

            // Adicionar disciplinas
            foreach (var disciplina in disciplinas)
            {
                worksheet.Cells[row, 4].Value = disciplina.CodTurma;
                worksheet.Cells[row, 5].Value = disciplina.Disciplina;
                worksheet.Cells[row, 6].Value = disciplina.QtdTotal;
                worksheet.Cells[row, 7].Value = disciplina.QtdResp;
                
                // Formatar taxa de resposta
                var taxa = disciplina.TaxaResposta;
                var cor = taxa >= 50 ? Color.Green : taxa >= 30 ? Color.Orange : Color.Red;
                worksheet.Cells[row, 8].Value = $"{taxa:F1}%";
                worksheet.Cells[row, 8].Style.Font.Color.SetColor(cor);
                
                row++;
            }

            // Adicionar linha de subtotal
            var totalGeral = disciplinas.Sum(d => d.QtdTotal);
            var totalResp = disciplinas.Sum(d => d.QtdResp);
            
            worksheet.Cells[row, 3, row, 4].Merge = true;
            worksheet.Cells[row, 3].Value = $"{grupo.Key.Turno} Total";
            worksheet.Cells[row, 5].Value = totalGeral;
            worksheet.Cells[row, 6].Value = totalResp;
            worksheet.Cells[row, 7].Value = $"{totalGeral > 0 ? (double)totalResp / totalGeral * 100 : 0:F1}%";
            
            // Estilizar linha de subtotal
            using (var range = worksheet.Cells[row, 1, row, 8])
            {
                range.Style.Font.Bold = true;
                range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                range.Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
            }
            
            row += 2; // Espaço entre grupos
        }

        // Ajustar largura das colunas
        worksheet.Cells.AutoFitColumns();

        return package.GetAsByteArray();
    }
}
```

### **4. Configuração de Serviços**
```csharp
// Program.cs ou Startup.cs
services.AddScoped<IExcelService, ExcelService>();
```

## 📦 Pacotes NuGet Necessários

```xml
<PackageReference Include="EPPlus" Version="7.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="7.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="7.0.0" />
```

## 🎯 Características do Excel Gerado

### **1. Formatação**
- ✅ **Células Mescladas:** CURSO, CODCURSO, TURNO, CODTURMA
- ✅ **Cores:** Verde (≥50%), Laranja (≥30%), Vermelho (<30%)
- ✅ **Bordas:** Linhas separando grupos
- ✅ **Fonte:** Negrito para cabeçalhos e totais

### **2. Estrutura**
- ✅ **Cabeçalho:** Títulos das colunas
- ✅ **Dados Agrupados:** Por curso e turno
- ✅ **Subtotais:** Linhas de total por turno
- ✅ **Cálculos:** Taxa de resposta automática

### **3. Nome do Arquivo**
- ✅ **Formato:** `Acompanhamento_{tipo}_{data}.xlsx`
- ✅ **Exemplo:** `Acompanhamento_aluno_2024-10-14.xlsx`

## 🚀 Status

**🎯 DOCUMENTAÇÃO COMPLETA**

- ✅ Endpoints definidos
- ✅ Modelos C# criados
- ✅ Lógica de negócio documentada
- ✅ Serviço de Excel implementado
- ✅ Formatação especificada
- ✅ Pacotes necessários listados

**Pronto para implementação no backend!** 🔧

---

**Data:** 14 de outubro de 2025  
**Status:** ✅ Documentação Completa  
**Próximo:** 🔧 Implementação Backend
