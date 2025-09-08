using Microsoft.AspNetCore.Mvc;
using NpsPesquisa.Api.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SkiaSharp;
using System.IO;
using System.Collections.Generic;
using System;
using System.Linq;
using DocumentFormat.OpenXml.Office2010.Excel;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Services;
using Microsoft.EntityFrameworkCore;
using ClosedXML.Excel;
using ClosedXML.Excel.Drawings;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public ReportController(NpsDbContext context, EmailService emailService)
        {
            _context = context;
        }

        [HttpPost("dashboard-pdf")]
        [Consumes("application/json")]
        public async Task<IActionResult> GerarDashboardPdfAsync([FromBody] DashboardPdfRequest req)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios)
                    .ThenInclude(qq => qq.Questao)
                        .ThenInclude(q => q.Opcoes)
                .FirstOrDefaultAsync(q => q.Id == req.QuestionarioId);
            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            // Buscar todos os convites respondidos para este questionário
            var convitesRespondidos = await _context.ConvitesQuestionarios
                .Where(c => c.QuestionarioId == req.QuestionarioId && c.Respondido)
                .Select(c => new { c.AlunoId, c.QuestionarioId })
                .ToListAsync();

            // Extrair apenas os IDs dos alunos que responderam
            var alunosRespondidos = convitesRespondidos.Select(c => c.AlunoId).ToList();

            // Buscar todas as respostas desses alunos para este questionário
            var respostas = await _context.Respostas
                .Include(r => r.Aluno)
                .Include(r => r.Aluno.Curso)
                .Include(r => r.RespostasQuestoes)
                .Where(r => r.QuestionarioId == req.QuestionarioId && alunosRespondidos.Contains(r.AlunoId))
                .ToListAsync();

            // Tendência de respostas por dia (preencher todas as datas do período)
            var dataInicio = questionario.DataInicio?.Date ?? DateTime.Today;
            var dataFim = questionario.DataFim?.Date ?? DateTime.Today;
            var dias = (dataFim - dataInicio).Days + 1;
            var todasDatas = Enumerable.Range(0, dias)
                .Select(offset => dataInicio.AddDays(offset))
                .ToList();

            var tendenciaRespostas = todasDatas
                .Select(data => new TendenciaRespostaDto
                {
                    Data = data.ToString("yyyy-MM-dd"),
                    Quantidade = respostas.Count(r => r.DataResposta.Date == data)
                })
                .ToList();

            if (!respostas.Any())
            {
                return Ok(new DashboardPdfDto
                {
                    TotalRespostas = 0,
                    TendenciaRespostas = new List<TendenciaRespostaDto>(),
                    NpsGeral = 0,
                    NpsDetalhamento = new NpsDetalhamentoDto { Passivo = 0, Promotor = 0, Detrator = 0 },
                    Satisfacao = 0,
                    SatisfacaoDetalhamento = new SatisfacaoDetalhamentoDto { MuitoInsatisfeito = 0, Insatisfeito = 0, NemInsatisfeitoNemSatisfeito = 0, Satisfeito = 0, MuitoSatisfeito = 0 },
                    SatisfacaoPorCurso = new List<SatisfacaoPorCursoDto>(),
                    ComentariosQ19 = new List<ComentarioDto>(),
                    ComentariosQ23 = new List<ComentarioDto>(),
                    MatrizMedias = new List<MatrizMediaDto>(),
                    AnaliseSentimentoQ19 = new List<SentimentoDto>(),
                    AnaliseSentimentoQ23 = new List<SentimentoDto>(),
                    AnaliseSentimentoPorCategoriaQ19 = new List<CategoriaSentimentoDto>(),
                    AnaliseSentimentoPorCategoriaQ23 = new List<CategoriaSentimentoDto>(),
                    EnunciadoQ19 = "",
                    EnunciadoQ23 = ""
                });
            }

            // Calcular NPS (Net Promoter Score)
            var questoesNPS = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.Questao.Tipo == TipoQuestao.EscalaLinear && rq.Valor != null)
                .ToList();

            var npsScores = questoesNPS
                .Select(rq => int.Parse(rq.Valor))
                .ToList();

            var promotores = npsScores.Count(s => s >= 9 && s <= 10);
            var detratores = npsScores.Count(s => s >= 0 && s <= 6);
            var passivos = npsScores.Count(s => s >= 7 && s <= 8);
            var totalNPS = npsScores.Count();

            var npsGeral = totalNPS > 0 ? Math.Round(((double)(promotores - detratores) / totalNPS) * 100, 0) : 0;

            // Cálculo da média de satisfação para questão múltipla escolha (exemplo QuestaoId = 22)
            var questaoSatisfacao = _context.Questoes
                .Include(q => q.Opcoes)
                .FirstOrDefault(q => q.Id == 21);

            var opcoesSatisfacao = questaoSatisfacao?.Opcoes.OrderBy(o => o.Ordem).ToList() ?? new List<OpcaoQuestao>();

            var questoesSatisfacaoMultipla = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 21 && rq.OpcaoId != null)
                .ToList();

            // Agrupa as respostas por opção para mostrar no gráfico
            var respostasPorOpcaoSatisfacao = questoesSatisfacaoMultipla
                .GroupBy(rq => rq.OpcaoId)
                .Select(g =>
                {
                    var opcao = opcoesSatisfacao.FirstOrDefault(o => o.Id == g.Key);
                    var peso = opcao != null ? opcao.Peso : 0;
                    return new RespostaPorOpcaoSatisfacaoDto
                    {
                        OpcaoId = g.Key,
                        OpcaoNome = opcao?.Texto ?? "",
                        Peso = peso,
                        Quantidade = g.Count(),
                        Percentual = questoesSatisfacaoMultipla.Count() > 0 ? Math.Round((double)g.Count() / questoesSatisfacaoMultipla.Count * 100, 1) : 0
                    };
                })
                .OrderBy(x => x.Peso)
                .ToList();

            var valoresSatisfacao = questoesSatisfacaoMultipla
                .Select(rq =>
                {
                    var opcao = opcoesSatisfacao.FirstOrDefault(o => o.Id == rq.OpcaoId);
                    return opcao != null ? (opcao.Peso != 0 ? opcao.Peso : (opcoesSatisfacao.IndexOf(opcao) + 1)) : (int?)null;
                })
                .Where(v => v.HasValue)
                .Select(v => v.Value)
                .ToList();

            double mediaSatisfacao = valoresSatisfacao.Count() > 0 ? Math.Round(valoresSatisfacao.Average(), 1) : 0;

            // Satisfação por curso (questão 22)
            var questaoSatisfacaoCurso = _context.Questoes
                .Include(q => q.Opcoes)
                .FirstOrDefault(q => q.Id == 22);

            var opcoesSatisfacaoCurso = questaoSatisfacaoCurso?.Opcoes.OrderBy(o => o.Ordem).ToList() ?? new List<OpcaoQuestao>();

            var respostasPorCurso = respostas
                .SelectMany(r => r.RespostasQuestoes, (r, rq) => new { r, rq })
                .Where(x => x.rq.QuestaoId == 22 && x.rq.OpcaoId != null && x.r.Aluno?.Curso != null)
                .GroupBy(x => x.r.Aluno.Curso.Nome)
                .ToList();

            var satisfacaoPorCurso = respostasPorCurso.Select(g =>
            {
                var total = g.Count();
                int GetPeso(int? opcaoId)
                {
                    var opcao = opcoesSatisfacaoCurso.FirstOrDefault(o => o.Id == opcaoId);
                    return opcao != null ? (opcao.Peso != 0 ? opcao.Peso : (opcoesSatisfacaoCurso.IndexOf(opcao) + 1)) : 0;
                }
                var muitoInsatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 1);
                var insatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 2);
                var nemSatisfeitoNemInsatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 3);
                var satisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 4);
                var muitoSatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 5);
                double media = total > 0 ? Math.Round((g.Select(x => GetPeso(x.rq.OpcaoId)).Where(p => p > 0).DefaultIfEmpty(0).Average()), 1) : 0;
                return new SatisfacaoPorCursoDto
                {
                    Curso = g.Key,
                    Total = total,
                    MuitoInsatisfeito = muitoInsatisfeito,
                    Insatisfeito = insatisfeito,
                    NemSatisfeitoNemInsatisfeito = nemSatisfeitoNemInsatisfeito,
                    Satisfeito = satisfeito,
                    MuitoSatisfeito = muitoSatisfeito,
                    Percentuais = new SatisfacaoPercentuaisDto
                    {
                        MuitoInsatisfeito = total > 0 ? Math.Round((double)muitoInsatisfeito / total * 100, 1) : 0,
                        Insatisfeito = total > 0 ? Math.Round((double)insatisfeito / total * 100, 1) : 0,
                        NemSatisfeitoNemInsatisfeito = total > 0 ? Math.Round((double)nemSatisfeitoNemInsatisfeito / total * 100, 1) : 0,
                        Satisfeito = total > 0 ? Math.Round((double)satisfeito / total * 100, 1) : 0,
                        MuitoSatisfeito = total > 0 ? Math.Round((double)muitoSatisfeito / total * 100, 1) : 0
                    },
                    Satisfacao = media
                };
            }).ToList();

            // Calcular média de satisfação por curso igual ao frontend
            double satisfacaoCurso = 0;
            if (satisfacaoPorCurso != null && satisfacaoPorCurso.Count() > 0)
            {
                satisfacaoCurso = Math.Round(
                    (satisfacaoPorCurso.Sum(x => x.Satisfacao) / satisfacaoPorCurso.Count) / 5 * 1000
                ) / 10;
            }

            // Comentários das questões 19 e 23
            var comentariosQ19 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 19 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => new ComentarioDto
                {
                    Texto = rq.Valor,
                    Curso = rq.Resposta.Aluno.Curso.Nome,
                    Nota = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average(),
                    Tipo = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() >= 9 ? "Promotor" :
                        rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() <= 6 ? "Detrator" : "Passivo"
                })
                .ToList();

            var comentariosQ23 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 23 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => new ComentarioDto
                {
                    Texto = rq.Valor,
                    Curso = rq.Resposta.Aluno.Curso.Nome,
                    Nota = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average(),
                    Tipo = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() >= 9 ? "Promotor" :
                        rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() <= 6 ? "Detrator" : "Passivo"
                })
                .ToList();

            // Cálculo das médias das questões do tipo matriz (usando Peso)
            var matrizMedias = questionario.QuestoesQuestionarios
                .Where(qq => qq.Questao.Tipo == TipoQuestao.Matriz)
                .Select(qq =>
                {
                    var colunas = qq.Questao.Opcoes.Where(o => o.EhColuna).OrderBy(o => o.Ordem).ToList();
                    return new MatrizMediaDto
                    {
                        QuestaoId = qq.Questao.Id,
                        QuestaoTexto = qq.Questao.Texto,
                        Linhas = qq.Questao.Opcoes
                            .Where(o => !o.EhColuna)
                            .Select(linha => new MatrizLinhaDto
                            {
                                Afirmacao = linha.Texto,
                                Media = Math.Round(
                                    respostas
                                        .SelectMany(r => r.RespostasQuestoes)
                                        .Where(rq => rq.QuestaoId == qq.Questao.Id && rq.OpcaoId == linha.Id && rq.Valor != null)
                                        .Select(rq =>
                                        {
                                            var col = colunas.FirstOrDefault(c => c.Texto == rq.Valor);
                                            return col != null ? (double?)col.Peso : null;
                                        })
                                        .Where(v => v.HasValue)
                                        .Select(v => v.Value)
                                        .DefaultIfEmpty(0)
                                        .Average(), 1)
                            })
                            .ToList()
                    };
                })
                .ToList();

            // Instanciar o serviço de sentimento
            var sentimentService = new SentimentAnalysisService();

            // Respostas de texto da questão 19
            var respostasQ19 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 19 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => rq.Valor)
                .ToList();

            var sentimentosQ19 = respostasQ19.Select(texto => sentimentService.Predict(texto)).ToList();
            var analiseSentimentoQ19 = sentimentosQ19
                .GroupBy(s => s)
                .Select(g => new SentimentoDto { Sentimento = g.Key, Quantidade = g.Count() })
                .ToList();

            // Respostas de texto da questão 23
            var respostasQ23 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 23 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => rq.Valor)
                .ToList();

            var sentimentosQ23 = respostasQ23.Select(texto => sentimentService.Predict(texto)).ToList();
            var analiseSentimentoQ23 = sentimentosQ23
                .GroupBy(s => s)
                .Select(g => new SentimentoDto { Sentimento = g.Key, Quantidade = g.Count() })
                .ToList();

            // Dicionário de categorias
            var categorias = new Dictionary<string, string[]>
            {
                { "Ensino", new[] { "ensino", "professor", "aula", "didática", "conteúdo", "explicação", "pedagógico" } },
                { "Melhoria", new[] { "melhorar", "melhoria", "sugestão", "precisa", "corrigir", "aperfeiçoar" } },
                { "Financeiro", new[] { "preço", "mensalidade", "financeiro", "custo", "desconto", "bolsa", "parcelamento" } },
                { "Infraestrutura", new[] { "estrutura", "sala", "laboratório", "equipamento", "biblioteca", "instalações", "cadeira", "ambiente" } },
                { "Atendimento", new[] { "atendimento", "secretaria", "suporte", "resposta", "demora", "funcionário", "cordialidade" } },
                { "Sistema", new[] { "sistema", "site", "plataforma", "portal", "erro", "login", "instabilidade", "tecnologia" } },
                { "Empregabilidade", new[] { "emprego", "estágio", "carreira", "parceria", "networking", "empresa", "mercado" } },
                { "Coordenação", new[] { "coordenação", "coordenador", "organização", "responsável", "gestão", "comunicação interna" } },
                { "Horários", new[] { "horário", "turno", "grade", "incompatível", "tarde", "noite", "sábado" } },
                { "Transporte e Acesso", new[] { "localização", "transporte", "ônibus", "metrô", "estacionamento", "acesso", "trânsito" } },
                { "Ambiente Acadêmico", new[] { "clima", "ambiente", "amizade", "acolhimento", "respeito", "interação", "comunidade" } },
                { "Reputação", new[] { "nome", "reputação", "ranking", "reconhecimento", "nota mec", "qualidade", "tradição" } },
                { "Eventos e Atividades", new[] { "evento", "palestra", "semana acadêmica", "atividade", "projeto", "workshop", "intercâmbio" } },
                { "EAD", new[] { "ead", "online", "plataforma", "vídeo aula", "remoto", "estudar em casa", "ambiente virtual", "atividade online", "fórum" } },
                { "Presencial", new[] { "presencial", "em sala", "campus", "presença física", "aula prática", "frequência", "estrutura física" } }
            };

            // Função para análise por categoria
            List<CategoriaSentimentoDto> AnalisePorCategoria(List<string> respostas, SentimentAnalysisService sentimentService)
            {
                var resultado = new List<CategoriaSentimentoDto>();
                foreach (var categoria in categorias)
                {
                    var respostasCategoria = respostas.Where(texto =>
                        categoria.Value.Any(palavra => texto.ToLower().Contains(palavra))
                    ).ToList();
                    var sentimentos = respostasCategoria.Select(texto => sentimentService.Predict(texto)).ToList();
                    var agrupado = sentimentos
                        .GroupBy(s => s)
                        .Select(g => new SentimentoDto { Sentimento = g.Key, Quantidade = g.Count() })
                        .ToList();
                    resultado.Add(new CategoriaSentimentoDto
                    {
                        Categoria = categoria.Key,
                        Total = respostasCategoria.Count,
                        Sentimentos = agrupado
                    });
                }
                return resultado;
            }

            // Enunciados das questões 19 e 23
            var enunciadoQ19 = _context.Questoes.FirstOrDefault(q => q.Id == 19)?.Texto ?? "";
            var enunciadoQ23 = _context.Questoes.FirstOrDefault(q => q.Id == 23)?.Texto ?? "";

            var analiseSentimentoPorCategoriaQ19 = AnalisePorCategoria(respostasQ19, sentimentService);
            var analiseSentimentoPorCategoriaQ23 = AnalisePorCategoria(respostasQ23, sentimentService);

            // Detalhamento geral da satisfação com o curso (questão 22)
            var questoesSatisfacaoCursoMultipla = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 22 && rq.OpcaoId != null)
                .ToList();

            var respostasPorOpcaoSatisfacaoCurso = questoesSatisfacaoCursoMultipla
                .GroupBy(rq => rq.OpcaoId)
                .Select(g =>
                {
                    var opcao = opcoesSatisfacaoCurso.FirstOrDefault(o => o.Id == g.Key);
                    var peso = opcao != null ? opcao.Peso : 0;
                    return new RespostaPorOpcaoSatisfacaoDto
                    {
                        OpcaoId = g.Key,
                        OpcaoNome = opcao?.Texto ?? "",
                        Peso = peso,
                        Quantidade = g.Count(),
                        Percentual = questoesSatisfacaoCursoMultipla.Count() > 0 ? Math.Round((double)g.Count() / questoesSatisfacaoCursoMultipla.Count * 100, 1) : 0
                    };
                })
                .OrderBy(x => x.Peso)
                .ToList();

            var satisfacaoCursoDetalhamento = new SatisfacaoDetalhamentoDto
            {
                Insatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 2).Sum(x => x.Percentual),
                NemInsatisfeitoNemSatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 3).Sum(x => x.Percentual),
                Satisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 4).Sum(x => x.Percentual),
                MuitoSatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 5).Sum(x => x.Percentual)
            };

            // Criar DTO principal com todos os dados
            var dashboardData = new DashboardPdfDto
            {
                TotalRespostas = respostas.Count(),
                TendenciaRespostas = tendenciaRespostas,
                NpsGeral = npsGeral,
                NpsDetalhamento = new NpsDetalhamentoDto
                {
                    Passivo = totalNPS > 0 ? Math.Round(((double)passivos / totalNPS) * 100, 1) : 0,
                    Promotor = totalNPS > 0 ? Math.Round(((double)promotores / totalNPS) * 100, 1) : 0,
                    Detrator = totalNPS > 0 ? Math.Round(((double)detratores / totalNPS) * 100, 1) : 0,
                },
                Satisfacao = Math.Round((mediaSatisfacao / 5) * 1000) / 10,
                SatisfacaoDetalhamento = new SatisfacaoDetalhamentoDto
                {
                    MuitoInsatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.Peso == 1).Sum(x => x.Percentual),
                    Insatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.Peso == 2).Sum(x => x.Percentual),
                    NemInsatisfeitoNemSatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.Peso == 3).Sum(x => x.Percentual),
                    Satisfeito = respostasPorOpcaoSatisfacao.Where(x => x.Peso == 4).Sum(x => x.Percentual),
                    MuitoSatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.Peso == 5).Sum(x => x.Percentual)
                },
                SatisfacaoPorCurso = satisfacaoPorCurso,
                SatisfacaoCurso = satisfacaoCurso,
                SatisfacaoPorCursoDetalhamento = new SatisfacaoDetalhamentoDto
                {
                    MuitoInsatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 1).Sum(x => x.Percentual),
                    Insatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 2).Sum(x => x.Percentual),
                    NemInsatisfeitoNemSatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 3).Sum(x => x.Percentual),
                    Satisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 4).Sum(x => x.Percentual),
                    MuitoSatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 5).Sum(x => x.Percentual)
                },
                ComentariosQ19 = comentariosQ19,
                ComentariosQ23 = comentariosQ23,
                MatrizMedias = matrizMedias,
                AnaliseSentimentoQ19 = analiseSentimentoQ19,
                AnaliseSentimentoQ23 = analiseSentimentoQ23,
                AnaliseSentimentoPorCategoriaQ19 = analiseSentimentoPorCategoriaQ19,
                AnaliseSentimentoPorCategoriaQ23 = analiseSentimentoPorCategoriaQ23,
                EnunciadoQ19 = enunciadoQ19,
                EnunciadoQ23 = enunciadoQ23
            };

            // Substituir geração dos gráficos para usar os dados reais
            var chartBytes = GerarGraficoBarras(dashboardData.NpsDetalhamento);
            var linhaBytes = GerarGraficoLinha(dashboardData.TendenciaRespostas);

            // 2. Monta o PDF igual antes
            var pdfBytes = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);
                    page.DefaultTextStyle(x => x.FontSize(12));
                    
                                        // Cabeçalho que se repete em todas as páginas
                    page.Header().Column(col =>
                    {
                        // Primeira linha: Título e Logo
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().AlignLeft().Text(questionario.Descricao).FontSize(14).Bold();
                            row.ConstantItem(80).AlignRight().Image("logo/logo.png", ImageScaling.FitWidth);
                        });
                        
                        // Segunda linha: Datas
                        col.Item().PaddingTop(5).Row(row =>
                        {
                            row.RelativeItem().AlignLeft().Text($"Data de Início: {questionario.DataInicio?.ToString("dd/MM/yyyy HH:mm")} - Data de Encerramento: {questionario.DataFim?.ToString("dd/MM/yyyy HH:mm")}").FontSize(10).FontColor(Colors.Grey.Medium);
                        });

                        // Segunda linha: Datas
                        col.Item().PaddingTop(10).Row(row =>
                        {
                            row.RelativeItem().AlignLeft().Text($" ").FontSize(10).FontColor(Colors.Grey.Medium);
                        });
                    });
                    
                    // Rodapé que se repete em todas as páginas
                    page.Footer().Row(row =>
                    {
                        row.RelativeItem().AlignLeft().Text($"Gerado em: {DateTime.Now.ToString("dd/MM/yyyy HH:mm")}").FontSize(8);
                        row.RelativeItem().AlignCenter().Text("Dashboard NPS").FontSize(8).FontColor(Colors.Grey.Medium);
                        row.RelativeItem().AlignRight().Text("NPS Pesquisa - Católica SC").FontSize(8).FontColor(Colors.Grey.Medium);
                    });
                    
                    page.Content()
                        .Column(col =>
                        {
                            // 1. Tendência de Respostas por Dia
                            col.Item().Text(" ").FontSize(12).Bold();
                            col.Item().Text("Tendência de Respostas por Dia").FontSize(12).Bold();
                            col.Item().PaddingBottom(22).Image(linhaBytes);

                            col.Item().PageBreak();
                            // 2. NPS Geral e Detalhamento NPS (Cabeçalhos)
                            var gaugeNpsBytes = GerarGaugeNps((int)dashboardData.NpsGeral);
                            var barraNpsBytes = GerarBarraSegmentadaNps(dashboardData.NpsDetalhamento);

                            col.Item().PaddingBottom(8).Row(row =>
                            {
                                row.ConstantItem(100).AlignCenter().Text($"NPS Geral: {dashboardData.TotalRespostas}").FontSize(12).Bold().FontColor(Colors.Blue.Medium);
                                row.RelativeItem().AlignCenter().Text($"Detalhamento NPS | NPS Geral: {dashboardData.TotalRespostas}").FontSize(12).Bold();
                            });

                            // 2. NPS Geral e Detalhamento NPS (Gráficos)
                            col.Item().Row(row =>
                            {
                                // 20% (gauge)
                                row.ConstantItem(100).PaddingBottom(0).AlignCenter().Image(gaugeNpsBytes, ImageScaling.FitWidth);

                                // 80% (barra + legenda)
                                row.RelativeItem().Column(colBarra =>
                                {
                                    // Barra de detalhamento
                                    colBarra.Item().Image(barraNpsBytes, ImageScaling.FitWidth);

                                    // Legenda logo abaixo da barra
                                    colBarra.Item().PaddingLeft(20).Row(legendRow =>
                                    {
                                        // Passivo
                                        legendRow.ConstantItem(12).Background(Colors.Orange.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Passivo").FontSize(8)
                                        );

                                        legendRow.ConstantItem(16); // Espaço entre

                                        // Promotor
                                        legendRow.ConstantItem(12).Background(Colors.Green.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Promotor").FontSize(8)
                                        );

                                        legendRow.ConstantItem(16); // Espaço entre

                                        // Detrator
                                        legendRow.ConstantItem(12).Background(Colors.Red.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Detrator").FontSize(8)
                                        );
                                    });
                                });
                            });

                            col.Item().Text(" ").FontSize(12).Bold();
                            col.Item().Text(" ").FontSize(12).Bold();
                            // 3. Satisfação Geral
                            var gaugeSatisfaçãoBytes = GerarGaugeSatisfacao(dashboardData.Satisfacao);
                            var barraSatisfaçãoBytes = GerarBarraSegmentadaSatisfacao(dashboardData.SatisfacaoDetalhamento);

                            col.Item().PaddingBottom(8).Row(row =>
                            {
                                row.ConstantItem(100).AlignCenter().Text($"Satisfação: { dashboardData.TotalRespostas}").FontSize(12).Bold().FontColor(Colors.Blue.Medium);
                                row.RelativeItem().AlignCenter().Text($"Detalhamento | Satisfação: {dashboardData.TotalRespostas}").FontSize(12).Bold();
                            });
                            // 3. Detalhamento Satisfação
                            col.Item().Row(row =>
                            {
                                // 20% (gauge)
                                row.ConstantItem(100).PaddingBottom(0).AlignCenter().Image(gaugeSatisfaçãoBytes, ImageScaling.FitWidth);

                                // 80% (barra + legenda)
                                row.RelativeItem().Column(colBarra =>
                                {
                                    // Barra de detalhamento
                                    colBarra.Item().Image(barraSatisfaçãoBytes, ImageScaling.FitWidth);

                                    // Legenda logo abaixo da barra
                                    colBarra.Item().PaddingLeft(20).Row(legendRow =>
                                    {
                                        // MuitoInsatisfeito
                                        legendRow.ConstantItem(12).Background(Colors.Red.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Muito Insatisfeito").FontSize(8)
                                        );

                                        // Insatisfeito
                                        legendRow.ConstantItem(12).Background(Colors.Orange.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Insatisfeito").FontSize(8)
                                        );

                                        legendRow.ConstantItem(16); // Espaço entre

                                        // Nem Insatisfeito / Nem Satisfeito
                                        legendRow.ConstantItem(12).Background(Colors.Yellow.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Nem Insatisfeito / Nem Satisfeito").FontSize(8)
                                        );

                                        legendRow.ConstantItem(16); // Espaço entre

                                        // Satisfeito
                                        legendRow.ConstantItem(12).Background(Colors.Green.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Satisfeito").FontSize(8)
                                        ); 
                                        legendRow.ConstantItem(16); // Espaço entre

                                        // Muito Satisfeito
                                        legendRow.ConstantItem(12).Background(Colors.Green.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Muito Satisfeito").FontSize(8)
                                        );
                                    });
                                });
                            });

                            // 4. Satisfação por Curso (Gauge e Detalhamento)
                            var gaugeSatisfaçãoPorCursoBytes = GerarGaugeSatisfacao(dashboardData.SatisfacaoCurso);
                            var barraSatisfaçãoPorCursoBytes = GerarBarraSegmentadaSatisfacao(dashboardData.SatisfacaoPorCursoDetalhamento);

                            col.Item().Text(" ").FontSize(12).Bold();
                            col.Item().Text(" ").FontSize(12).Bold();
                            col.Item().Text(" ").FontSize(12).Bold();
                            col.Item().PaddingBottom(8).Row(row =>
                            {
                                row.ConstantItem(100).AlignCenter().Text("Satisfação Por Curso").FontSize(12).Bold().FontColor(Colors.Blue.Medium);
                                row.RelativeItem().AlignCenter().Text("Detalhamento | Satisfação Por Curso").FontSize(12).Bold();
                            });

                            // 4. Detalhamento Satisfação com Curso
                            col.Item().Row(row =>
                            {
                                // 20% (gauge)
                                row.ConstantItem(100).PaddingBottom(0).AlignCenter().Image(gaugeSatisfaçãoPorCursoBytes, ImageScaling.FitWidth);

                                // 80% (barra + legenda)
                                row.RelativeItem().Column(colBarra =>
                                {
                                    // Barra de detalhamento
                                    colBarra.Item().Image(barraSatisfaçãoPorCursoBytes, ImageScaling.FitWidth);

                                    // Legenda logo abaixo da barra
                                    colBarra.Item().PaddingLeft(20).Row(legendRow =>
                                    {
                                        // MuitoInsatisfeito
                                        legendRow.ConstantItem(12).Background(Colors.Red.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Muito Insatisfeito").FontSize(8)
                                        );

                                        // Insatisfeito
                                        legendRow.ConstantItem(12).Background(Colors.Orange.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Insatisfeito").FontSize(8)
                                        );

                                        legendRow.ConstantItem(16); // Espaço entre

                                        // Nem Insatisfeito / Nem Satisfeito
                                        legendRow.ConstantItem(12).Background(Colors.Yellow.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Nem Insatisfeito / Nem Satisfeito").FontSize(8)
                                        );

                                        legendRow.ConstantItem(16); // Espaço entre

                                        // Satisfeito
                                        legendRow.ConstantItem(12).Background(Colors.Green.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Satisfeito").FontSize(8)
                                        );
                                        legendRow.ConstantItem(16); // Espaço entre

                                        // Muito Satisfeito
                                        legendRow.ConstantItem(12).Background(Colors.Green.Medium).Height(12).AlignMiddle();
                                        legendRow.ConstantItem(4);
                                        legendRow.ConstantItem(50).Element(container =>
                                            container.AlignMiddle().Text("Muito Satisfeito").FontSize(8)
                                        );
                                    });
                                });
                            });

                            // 5. Gráfico de Satisfação por Curso
                            col.Item().PageBreak();
                            col.Item().Text("Satisfação por Curso").FontSize(12).Bold();
                            
                            var graficoSatisfaçãoPorCurso = GerarGraficoSatisfacaoPorCurso(dashboardData.SatisfacaoPorCurso);
                            col.Item().PaddingBottom(20).Image(graficoSatisfaçãoPorCurso);

                            col.Item().PageBreak();
                            
                            // 9. Matrizes de Médias
                            foreach (var matriz in dashboardData.MatrizMedias)
                            {
                                col.Item().Text(" ").FontSize(12).Bold();
                                col.Item().Text(matriz.QuestaoTexto).FontSize(11).Bold();
                                var graficoMatrizBytes = GerarGraficoMatriz(matriz);
                                col.Item().PaddingBottom(20).Image(graficoMatrizBytes, ImageScaling.FitWidth);
                            }

                             col.Item().PageBreak();
                            // 10. Análise de Sentimento Q19
                            col.Item().Text($"Análise de Sentimento - {dashboardData.EnunciadoQ19}").FontSize(12).Bold();
                            var bubbleChartQ19Bytes = GerarBubbleChartPorCategoria(dashboardData.AnaliseSentimentoPorCategoriaQ19);
                            col.Item().PaddingBottom(20).Image(bubbleChartQ19Bytes, ImageScaling.FitWidth);

                            col.Item().PageBreak();
                            // 11. Análise de Sentimento Q23
                            col.Item().Text($"Análise de Sentimento - {dashboardData.EnunciadoQ23}").FontSize(12).Bold();
                            var bubbleChartQ23Bytes = GerarBubbleChartPorCategoria(dashboardData.AnaliseSentimentoPorCategoriaQ19);
                            col.Item().PaddingBottom(20).Image(bubbleChartQ23Bytes, ImageScaling.FitWidth);
                            col.Item().PageBreak();
                            // 12. Comentários Q19
                            col.Item().Text($"Comentários - {dashboardData.EnunciadoQ19}").FontSize(12).Bold();
                            foreach (var comentario in dashboardData.ComentariosQ19)
                            {
                                var notaImg = GerarNotaComentario(comentario.Nota, comentario.Tipo);
                                col.Item().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(10).Row(row =>
                                {
                                    row.ConstantItem(40).AlignTop().Image(notaImg, ImageScaling.FitWidth);
                                    row.RelativeItem().Column(innerCol =>
                                    {
                                        innerCol.Item().Text($"{comentario.Tipo} - {comentario.Curso}").Bold().FontSize(10).FontColor(Colors.Grey.Darken2);
                                        innerCol.Item().PaddingTop(2).Text(comentario.Texto).FontSize(10).FontColor(Colors.Grey.Darken3);
                                    });
                                });
                            }
                            col.Item().PageBreak();
                            // 13. Comentários Q23
                            col.Item().Text($"Comentários - {dashboardData.EnunciadoQ23}").FontSize(12).Bold();
                            foreach (var comentario in dashboardData.ComentariosQ23)
                            {
                                var notaImg = GerarNotaComentario(comentario.Nota, comentario.Tipo);
                                col.Item().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(10).Row(row =>
                                {
                                    row.ConstantItem(40).AlignTop().Image(notaImg, ImageScaling.FitWidth);
                                    row.RelativeItem().Column(innerCol =>
                                    {
                                        innerCol.Item().Text($"{comentario.Tipo} - {comentario.Curso}").Bold().FontSize(10).FontColor(Colors.Grey.Darken2);
                                        innerCol.Item().PaddingTop(2).Text(comentario.Texto).FontSize(10).FontColor(Colors.Grey.Darken3);
                                    });
                                });
                            }
                        });
                });
            }).GeneratePdf();

            return File(pdfBytes, "application/pdf", "dashboard.pdf");
        }

        [HttpPost("dashboard-excel")]
        [Consumes("application/json")]
        public async Task<IActionResult> GerarDashboardExcelAsync([FromBody] DashboardPdfRequest req)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.QuestoesQuestionarios)
                    .ThenInclude(qq => qq.Questao)
                        .ThenInclude(q => q.Opcoes)
                .FirstOrDefaultAsync(q => q.Id == req.QuestionarioId);
            if (questionario == null)
                return NotFound(new { message = "Questionário não encontrado" });

            // Buscar todos os convites respondidos para este questionário
            var convitesRespondidos = await _context.ConvitesQuestionarios
                .Where(c => c.QuestionarioId == req.QuestionarioId && c.Respondido)
                .Select(c => new { c.AlunoId, c.QuestionarioId })
                .ToListAsync();

            // Extrair apenas os IDs dos alunos que responderam
            var alunosRespondidos = convitesRespondidos.Select(c => c.AlunoId).ToList();

            // Buscar todas as respostas desses alunos para este questionário
            var respostas = await _context.Respostas
                .Include(r => r.Aluno)
                .Include(r => r.Aluno.Curso)
                .Include(r => r.RespostasQuestoes)
                .Where(r => r.QuestionarioId == req.QuestionarioId && alunosRespondidos.Contains(r.AlunoId))
                .ToListAsync();

            // Tendência de respostas por dia (preencher todas as datas do período)
            var dataInicio = questionario.DataInicio?.Date ?? DateTime.Today;
            var dataFim = questionario.DataFim?.Date ?? DateTime.Today;
            var dias = (dataFim - dataInicio).Days + 1;
            var todasDatas = Enumerable.Range(0, dias)
                .Select(offset => dataInicio.AddDays(offset))
                .ToList();

            var tendenciaRespostas = todasDatas
                .Select(data => new TendenciaRespostaDto
                {
                    Data = data.ToString("yyyy-MM-dd"),
                    Quantidade = respostas.Count(r => r.DataResposta.Date == data)
                })
                .ToList();

            if (!respostas.Any())
            {
                return Ok(new DashboardPdfDto
                {
                    TotalRespostas = 0,
                    TendenciaRespostas = new List<TendenciaRespostaDto>(),
                    NpsGeral = 0,
                    NpsDetalhamento = new NpsDetalhamentoDto { Passivo = 0, Promotor = 0, Detrator = 0 },
                    Satisfacao = 0,
                    SatisfacaoDetalhamento = new SatisfacaoDetalhamentoDto { MuitoInsatisfeito = 0, Insatisfeito = 0, NemInsatisfeitoNemSatisfeito = 0, Satisfeito = 0, MuitoSatisfeito = 0 },
                    SatisfacaoPorCurso = new List<SatisfacaoPorCursoDto>(),
                    ComentariosQ19 = new List<ComentarioDto>(),
                    ComentariosQ23 = new List<ComentarioDto>(),
                    MatrizMedias = new List<MatrizMediaDto>(),
                    AnaliseSentimentoQ19 = new List<SentimentoDto>(),
                    AnaliseSentimentoQ23 = new List<SentimentoDto>(),
                    AnaliseSentimentoPorCategoriaQ19 = new List<CategoriaSentimentoDto>(),
                    AnaliseSentimentoPorCategoriaQ23 = new List<CategoriaSentimentoDto>(),
                    EnunciadoQ19 = "",
                    EnunciadoQ23 = ""
                });
            }

            // Calcular NPS (Net Promoter Score)
            var questoesNPS = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.Questao.Tipo == TipoQuestao.EscalaLinear && rq.Valor != null)
                .ToList();

            var npsScores = questoesNPS
                .Select(rq => int.Parse(rq.Valor))
                .ToList();

            var promotores = npsScores.Count(s => s >= 9 && s <= 10);
            var detratores = npsScores.Count(s => s >= 0 && s <= 6);
            var passivos = npsScores.Count(s => s >= 7 && s <= 8);
            var totalNPS = npsScores.Count();

            var npsGeral = totalNPS > 0 ? Math.Round(((double)(promotores - detratores) / totalNPS) * 100, 0) : 0;

            // Cálculo da média de satisfação para questão múltipla escolha (exemplo QuestaoId = 22)
            var questaoSatisfacao = _context.Questoes
                .Include(q => q.Opcoes)
                .FirstOrDefault(q => q.Id == 21);

            var opcoesSatisfacao = questaoSatisfacao?.Opcoes.OrderBy(o => o.Ordem).ToList() ?? new List<OpcaoQuestao>();

            var questoesSatisfacaoMultipla = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 21 && rq.OpcaoId != null)
                .ToList();

            // Agrupa as respostas por opção para mostrar no gráfico
            var respostasPorOpcaoSatisfacao = questoesSatisfacaoMultipla
                .GroupBy(rq => rq.OpcaoId)
                .Select(g =>
                {
                    var opcao = opcoesSatisfacao.FirstOrDefault(o => o.Id == g.Key);
                    var peso = opcao != null ? opcao.Peso : 0;
                    return new RespostaPorOpcaoSatisfacaoDto
                    {
                        OpcaoId = g.Key,
                        OpcaoNome = opcao?.Texto ?? "",
                        Peso = peso,
                        Quantidade = g.Count(),
                        Percentual = questoesSatisfacaoMultipla.Count() > 0 ? Math.Round((double)g.Count() / questoesSatisfacaoMultipla.Count * 100, 1) : 0
                    };
                })
                .OrderBy(x => x.Peso)
                .ToList();

            var valoresSatisfacao = questoesSatisfacaoMultipla
                .Select(rq =>
                {
                    var opcao = opcoesSatisfacao.FirstOrDefault(o => o.Id == rq.OpcaoId);
                    return opcao != null ? (opcao.Peso != 0 ? opcao.Peso : (opcoesSatisfacao.IndexOf(opcao) + 1)) : (int?)null;
                })
                .Where(v => v.HasValue)
                .Select(v => v.Value)
                .ToList();

            double mediaSatisfacao = valoresSatisfacao.Count() > 0 ? Math.Round(valoresSatisfacao.Average(), 1) : 0;

            // Satisfação por curso (questão 22)
            var questaoSatisfacaoCurso = _context.Questoes
                .Include(q => q.Opcoes)
                .FirstOrDefault(q => q.Id == 22);

            var opcoesSatisfacaoCurso = questaoSatisfacaoCurso?.Opcoes.OrderBy(o => o.Ordem).ToList() ?? new List<OpcaoQuestao>();

            var respostasPorCurso = respostas
                .SelectMany(r => r.RespostasQuestoes, (r, rq) => new { r, rq })
                .Where(x => x.rq.QuestaoId == 22 && x.rq.OpcaoId != null && x.r.Aluno?.Curso != null)
                .GroupBy(x => x.r.Aluno.Curso.Nome)
                .ToList();

            var satisfacaoPorCurso = respostasPorCurso.Select(g =>
            {
                var total = g.Count();
                int GetPeso(int? opcaoId)
                {
                    var opcao = opcoesSatisfacaoCurso.FirstOrDefault(o => o.Id == opcaoId);
                    return opcao != null ? (opcao.Peso != 0 ? opcao.Peso : (opcoesSatisfacaoCurso.IndexOf(opcao) + 1)) : 0;
                }
                var muitoInsatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 1);
                var insatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 2);
                var nemSatisfeitoNemInsatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 3);
                var satisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 4);
                var muitoSatisfeito = g.Count(x => GetPeso(x.rq.OpcaoId) == 5);
                double media = total > 0 ? Math.Round((g.Select(x => GetPeso(x.rq.OpcaoId)).Where(p => p > 0).DefaultIfEmpty(0).Average()), 1) : 0;
                return new SatisfacaoPorCursoDto
                {
                    Curso = g.Key,
                    Total = total,
                    MuitoInsatisfeito = muitoInsatisfeito,
                    Insatisfeito = insatisfeito,
                    NemSatisfeitoNemInsatisfeito = nemSatisfeitoNemInsatisfeito,
                    Satisfeito = satisfeito,
                    MuitoSatisfeito = muitoSatisfeito,
                    Percentuais = new SatisfacaoPercentuaisDto
                    {
                        MuitoInsatisfeito = total > 0 ? Math.Round((double)muitoInsatisfeito / total * 100, 1) : 0,
                        Insatisfeito = total > 0 ? Math.Round((double)insatisfeito / total * 100, 1) : 0,
                        NemSatisfeitoNemInsatisfeito = total > 0 ? Math.Round((double)nemSatisfeitoNemInsatisfeito / total * 100, 1) : 0,
                        Satisfeito = total > 0 ? Math.Round((double)satisfeito / total * 100, 1) : 0,
                        MuitoSatisfeito = total > 0 ? Math.Round((double)muitoSatisfeito / total * 100, 1) : 0
                    },
                    Satisfacao = media
                };
            }).ToList();

            // Calcular média de satisfação por curso igual ao frontend
            double satisfacaoCurso = 0;
            if (satisfacaoPorCurso != null && satisfacaoPorCurso.Count() > 0)
            {
                satisfacaoCurso = Math.Round(
                    (satisfacaoPorCurso.Sum(x => x.Satisfacao) / satisfacaoPorCurso.Count) / 5 * 1000
                ) / 10;
            }

            // Comentários das questões 19 e 23
            var comentariosQ19 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 19 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => new ComentarioDto
                {
                    Texto = rq.Valor,
                    Curso = rq.Resposta.Aluno.Curso.Nome,
                    Nota = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average(),
                    Tipo = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() >= 9 ? "Promotor" :
                        rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() <= 6 ? "Detrator" : "Passivo"
                })
                .ToList();

            var comentariosQ23 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 23 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => new ComentarioDto
                {
                    Texto = rq.Valor,
                    Curso = rq.Resposta.Aluno.Curso.Nome,
                    Nota = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average(),
                    Tipo = rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() >= 9 ? "Promotor" :
                        rq.Resposta.RespostasQuestoes
                        .Where(rq2 => rq2.Questao.Tipo == TipoQuestao.EscalaLinear && rq2.Valor != null)
                        .Select(rq2 => int.Parse(rq2.Valor))
                        .DefaultIfEmpty(0)
                        .Average() <= 6 ? "Detrator" : "Passivo"
                })
                .ToList();

            // Cálculo das médias das questões do tipo matriz (usando Peso)
            var matrizMedias = questionario.QuestoesQuestionarios
                .Where(qq => qq.Questao.Tipo == TipoQuestao.Matriz)
                .Select(qq =>
                {
                    var colunas = qq.Questao.Opcoes.Where(o => o.EhColuna).OrderBy(o => o.Ordem).ToList();
                    return new MatrizMediaDto
                    {
                        QuestaoId = qq.Questao.Id,
                        QuestaoTexto = qq.Questao.Texto,
                        Linhas = qq.Questao.Opcoes
                            .Where(o => !o.EhColuna)
                            .Select(linha => new MatrizLinhaDto
                            {
                                Afirmacao = linha.Texto,
                                Media = Math.Round(
                                    respostas
                                        .SelectMany(r => r.RespostasQuestoes)
                                        .Where(rq => rq.QuestaoId == qq.Questao.Id && rq.OpcaoId == linha.Id && rq.Valor != null)
                                        .Select(rq =>
                                        {
                                            var col = colunas.FirstOrDefault(c => c.Texto == rq.Valor);
                                            return col != null ? (double?)col.Peso : null;
                                        })
                                        .Where(v => v.HasValue)
                                        .Select(v => v.Value)
                                        .DefaultIfEmpty(0)
                                        .Average(), 1)
                            })
                            .ToList()
                    };
                })
                .ToList();

            // Instanciar o serviço de sentimento
            var sentimentService = new SentimentAnalysisService();

            // Respostas de texto da questão 19
            var respostasQ19 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 19 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => rq.Valor)
                .ToList();

            var sentimentosQ19 = respostasQ19.Select(texto => sentimentService.Predict(texto)).ToList();
            var analiseSentimentoQ19 = sentimentosQ19
                .GroupBy(s => s)
                .Select(g => new SentimentoDto { Sentimento = g.Key, Quantidade = g.Count() })
                .ToList();

            // Respostas de texto da questão 23
            var respostasQ23 = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 23 && !string.IsNullOrEmpty(rq.Valor))
                .Select(rq => rq.Valor)
                .ToList();

            var sentimentosQ23 = respostasQ23.Select(texto => sentimentService.Predict(texto)).ToList();
            var analiseSentimentoQ23 = sentimentosQ23
                .GroupBy(s => s)
                .Select(g => new SentimentoDto { Sentimento = g.Key, Quantidade = g.Count() })
                .ToList();

            // Dicionário de categorias
            var categorias = new Dictionary<string, string[]>
            {
                { "Ensino", new[] { "ensino", "professor", "aula", "didática", "conteúdo", "explicação", "pedagógico" } },
                { "Melhoria", new[] { "melhorar", "melhoria", "sugestão", "precisa", "corrigir", "aperfeiçoar" } },
                { "Financeiro", new[] { "preço", "mensalidade", "financeiro", "custo", "desconto", "bolsa", "parcelamento" } },
                { "Infraestrutura", new[] { "estrutura", "sala", "laboratório", "equipamento", "biblioteca", "instalações", "cadeira", "ambiente" } },
                { "Atendimento", new[] { "atendimento", "secretaria", "suporte", "resposta", "demora", "funcionário", "cordialidade" } },
                { "Sistema", new[] { "sistema", "site", "plataforma", "portal", "erro", "login", "instabilidade", "tecnologia" } },
                { "Empregabilidade", new[] { "emprego", "estágio", "carreira", "parceria", "networking", "empresa", "mercado" } },
                { "Coordenação", new[] { "coordenação", "coordenador", "organização", "responsável", "gestão", "comunicação interna" } },
                { "Horários", new[] { "horário", "turno", "grade", "incompatível", "tarde", "noite", "sábado" } },
                { "Transporte e Acesso", new[] { "localização", "transporte", "ônibus", "metrô", "estacionamento", "acesso", "trânsito" } },
                { "Ambiente Acadêmico", new[] { "clima", "ambiente", "amizade", "acolhimento", "respeito", "interação", "comunidade" } },
                { "Reputação", new[] { "nome", "reputação", "ranking", "reconhecimento", "nota mec", "qualidade", "tradição" } },
                { "Eventos e Atividades", new[] { "evento", "palestra", "semana acadêmica", "atividade", "projeto", "workshop", "intercâmbio" } },
                { "EAD", new[] { "ead", "online", "plataforma", "vídeo aula", "remoto", "estudar em casa", "ambiente virtual", "atividade online", "fórum" } },
                { "Presencial", new[] { "presencial", "em sala", "campus", "presença física", "aula prática", "frequência", "estrutura física" } }
            };

            // Função para análise por categoria
            List<CategoriaSentimentoDto> AnalisePorCategoria(List<string> respostas, SentimentAnalysisService sentimentService)
            {
                var resultado = new List<CategoriaSentimentoDto>();
                foreach (var categoria in categorias)
                {
                    var respostasCategoria = respostas.Where(texto =>
                        categoria.Value.Any(palavra => texto.ToLower().Contains(palavra))
                    ).ToList();
                    var sentimentos = respostasCategoria.Select(texto => sentimentService.Predict(texto)).ToList();
                    var agrupado = sentimentos
                        .GroupBy(s => s)
                        .Select(g => new SentimentoDto { Sentimento = g.Key, Quantidade = g.Count() })
                        .ToList();
                    resultado.Add(new CategoriaSentimentoDto
                    {
                        Categoria = categoria.Key,
                        Total = respostasCategoria.Count,
                        Sentimentos = agrupado
                    });
                }
                return resultado;
            }

            // Enunciados das questões 19 e 23
            var enunciadoQ19 = _context.Questoes.FirstOrDefault(q => q.Id == 19)?.Texto ?? "";
            var enunciadoQ23 = _context.Questoes.FirstOrDefault(q => q.Id == 23)?.Texto ?? "";

            var analiseSentimentoPorCategoriaQ19 = AnalisePorCategoria(respostasQ19, sentimentService);
            var analiseSentimentoPorCategoriaQ23 = AnalisePorCategoria(respostasQ23, sentimentService);

            // Detalhamento geral da satisfação com o curso (questão 22)
            var questoesSatisfacaoCursoMultipla = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.QuestaoId == 22 && rq.OpcaoId != null)
                .ToList();

            var respostasPorOpcaoSatisfacaoCurso = questoesSatisfacaoCursoMultipla
                .GroupBy(rq => rq.OpcaoId)
                .Select(g =>
                {
                    var opcao = opcoesSatisfacaoCurso.FirstOrDefault(o => o.Id == g.Key);
                    var peso = opcao != null ? opcao.Peso : 0;
                    return new RespostaPorOpcaoSatisfacaoDto
                    {
                        OpcaoId = g.Key,
                        OpcaoNome = opcao?.Texto ?? "",
                        Peso = peso,
                        Quantidade = g.Count(),
                        Percentual = questoesSatisfacaoCursoMultipla.Count() > 0 ? Math.Round((double)g.Count() / questoesSatisfacaoCursoMultipla.Count * 100, 1) : 0
                    };
                })
                .OrderBy(x => x.Peso)
                .ToList();

            var satisfacaoCursoDetalhamento = new SatisfacaoDetalhamentoDto
            {
                Insatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 2).Sum(x => x.Percentual),
                NemInsatisfeitoNemSatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 3).Sum(x => x.Percentual),
                Satisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 4).Sum(x => x.Percentual),
                MuitoSatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 5).Sum(x => x.Percentual)
            };

            // Criar DTO principal com todos os dados
            var dashboardData = new DashboardPdfDto
            {
                TotalRespostas = respostas.Count(),
                TendenciaRespostas = tendenciaRespostas,
                NpsGeral = npsGeral,
                NpsDetalhamento = new NpsDetalhamentoDto
                {
                    Passivo = totalNPS > 0 ? Math.Round(((double)passivos / totalNPS) * 100, 1) : 0,
                    Promotor = totalNPS > 0 ? Math.Round(((double)promotores / totalNPS) * 100, 1) : 0,
                    Detrator = totalNPS > 0 ? Math.Round(((double)detratores / totalNPS) * 100, 1) : 0,
                },
                Satisfacao = Math.Round((mediaSatisfacao / 5) * 1000) / 10,
                SatisfacaoDetalhamento = new SatisfacaoDetalhamentoDto
                {
                    MuitoInsatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.Peso == 1).Sum(x => x.Percentual),
                    Insatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.Peso == 2).Sum(x => x.Percentual),
                    NemInsatisfeitoNemSatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.Peso == 3).Sum(x => x.Percentual),
                    Satisfeito = respostasPorOpcaoSatisfacao.Where(x => x.Peso == 4).Sum(x => x.Percentual),
                    MuitoSatisfeito = respostasPorOpcaoSatisfacao.Where(x => x.Peso == 5).Sum(x => x.Percentual)
                },
                SatisfacaoPorCurso = satisfacaoPorCurso,
                SatisfacaoCurso = satisfacaoCurso,
                SatisfacaoPorCursoDetalhamento = new SatisfacaoDetalhamentoDto
                {
                    MuitoInsatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 1).Sum(x => x.Percentual),
                    Insatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 2).Sum(x => x.Percentual),
                    NemInsatisfeitoNemSatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 3).Sum(x => x.Percentual),
                    Satisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 4).Sum(x => x.Percentual),
                    MuitoSatisfeito = respostasPorOpcaoSatisfacaoCurso.Where(x => x.Peso == 5).Sum(x => x.Percentual)
                },
                ComentariosQ19 = comentariosQ19,
                ComentariosQ23 = comentariosQ23,
                MatrizMedias = matrizMedias,
                AnaliseSentimentoQ19 = analiseSentimentoQ19,
                AnaliseSentimentoQ23 = analiseSentimentoQ23,
                AnaliseSentimentoPorCategoriaQ19 = analiseSentimentoPorCategoriaQ19,
                AnaliseSentimentoPorCategoriaQ23 = analiseSentimentoPorCategoriaQ23,
                EnunciadoQ19 = enunciadoQ19,
                EnunciadoQ23 = enunciadoQ23
            };

            // Debug: Verificar se encontrou comentários
            Console.WriteLine($"Comentários Q19 encontrados: {comentariosQ19.Count()}");
            Console.WriteLine($"Comentários Q23 encontrados: {comentariosQ23.Count()}");
            
            // Debug: Verificar todas as questões de texto
            var todasQuestoesTexto = respostas
                .SelectMany(r => r.RespostasQuestoes)
                .Where(rq => rq.Questao.Tipo == TipoQuestao.CaixaTexto)
                .ToList();
            
            Console.WriteLine($"Total de questões de texto: {todasQuestoesTexto.Count()}");
            foreach (var q in todasQuestoesTexto.Take(5))
            {
                Console.WriteLine($"Questão: {q.Questao.Texto}, Texto: {q.Texto}");
            }

            // Gerar Excel
            using (var workbook = new XLWorkbook())
            {
                // Aba 1: Comentários Q19
                var comentariosQ19Sheet = workbook.Worksheets.Add("Comentários 1");
                
                // Adicionar enunciado da questão 19
                comentariosQ19Sheet.Cell(1, 1).Value = "Enunciado da Questão:";
                comentariosQ19Sheet.Cell(1, 2).Value = enunciadoQ19;
                comentariosQ19Sheet.Cell(1, 1).Style.Font.Bold = true;
                comentariosQ19Sheet.Cell(1, 2).Style.Font.Bold = true;
                
                // Cabeçalhos das colunas (linha 3)
                comentariosQ19Sheet.Cell(3, 1).Value = "Comentário";
                comentariosQ19Sheet.Cell(3, 2).Value = "Nota";
                comentariosQ19Sheet.Cell(3, 3).Value = "Tipo";
                comentariosQ19Sheet.Cell(3, 4).Value = "Curso";
                comentariosQ19Sheet.Cell(3, 1).Style.Font.Bold = true;
                comentariosQ19Sheet.Cell(3, 2).Style.Font.Bold = true;
                comentariosQ19Sheet.Cell(3, 3).Style.Font.Bold = true;
                comentariosQ19Sheet.Cell(3, 4).Style.Font.Bold = true;

                for (int i = 0; i < comentariosQ19.Count(); i++)
                {
                    comentariosQ19Sheet.Cell(i + 4, 1).Value = comentariosQ19[i].Texto;
                    comentariosQ19Sheet.Cell(i + 4, 2).Value = comentariosQ19[i].Nota;
                    comentariosQ19Sheet.Cell(i + 4, 3).Value = comentariosQ19[i].Tipo;
                    comentariosQ19Sheet.Cell(i + 4, 4).Value = comentariosQ19[i].Curso;
                }

                comentariosQ19Sheet.Columns().AdjustToContents();

                // Aba 2: Comentários Q23
                var comentariosQ23Sheet = workbook.Worksheets.Add("Comentários 2");
                
                // Adicionar enunciado da questão 23
                comentariosQ23Sheet.Cell(1, 1).Value = "Enunciado da Questão:";
                comentariosQ23Sheet.Cell(1, 2).Value = enunciadoQ23;
                comentariosQ23Sheet.Cell(1, 1).Style.Font.Bold = true;
                comentariosQ23Sheet.Cell(1, 2).Style.Font.Bold = true;
                
                // Cabeçalhos das colunas (linha 3)
                comentariosQ23Sheet.Cell(3, 1).Value = "Comentário";
                comentariosQ23Sheet.Cell(3, 2).Value = "Nota";
                comentariosQ23Sheet.Cell(3, 3).Value = "Tipo";
                comentariosQ23Sheet.Cell(3, 4).Value = "Curso";
                comentariosQ23Sheet.Cell(3, 1).Style.Font.Bold = true;
                comentariosQ23Sheet.Cell(3, 2).Style.Font.Bold = true;
                comentariosQ23Sheet.Cell(3, 3).Style.Font.Bold = true;
                comentariosQ23Sheet.Cell(3, 4).Style.Font.Bold = true;

                for (int i = 0; i < comentariosQ23.Count(); i++)
                {
                    comentariosQ23Sheet.Cell(i + 4, 1).Value = comentariosQ23[i].Texto;
                    comentariosQ23Sheet.Cell(i + 4, 2).Value = comentariosQ23[i].Nota;
                    comentariosQ23Sheet.Cell(i + 4, 3).Value = comentariosQ23[i].Tipo;
                    comentariosQ23Sheet.Cell(i + 4, 4).Value = comentariosQ23[i].Curso;
                }

                comentariosQ23Sheet.Columns().AdjustToContents();

                // Aba 3: Dados de Tendência de Respostas
                var tendenciaSheet = workbook.Worksheets.Add("Tendência de Respostas");
                tendenciaSheet.Cell(1, 1).Value = "Data";
                tendenciaSheet.Cell(1, 2).Value = "Quantidade de Respostas";
                tendenciaSheet.Cell(1, 1).Style.Font.Bold = true;
                tendenciaSheet.Cell(1, 2).Style.Font.Bold = true;

                for (int i = 0; i < dashboardData.TendenciaRespostas.Count(); i++)
                {
                    tendenciaSheet.Cell(i + 2, 1).Value = dashboardData.TendenciaRespostas[i].Data;
                    tendenciaSheet.Cell(i + 2, 2).Value = dashboardData.TendenciaRespostas[i].Quantidade;
                }

                tendenciaSheet.Columns().AdjustToContents();

                // Aba 4: Dados NPS
                var npsSheet = workbook.Worksheets.Add("NPS Geral");
                npsSheet.Cell(1, 1).Value = "NPS Geral";
                npsSheet.Cell(1, 2).Value = dashboardData.NpsGeral;
                npsSheet.Cell(1, 1).Style.Font.Bold = true;
                npsSheet.Cell(1, 2).Style.Font.Bold = true;
                
                npsSheet.Cell(3, 1).Value = "Tipo";
                npsSheet.Cell(3, 2).Value = "Percentual";
                npsSheet.Cell(3, 1).Style.Font.Bold = true;
                npsSheet.Cell(3, 2).Style.Font.Bold = true;
                
                npsSheet.Cell(4, 1).Value = "Promotor";
                npsSheet.Cell(4, 2).Value = dashboardData.NpsDetalhamento.Promotor;
                
                npsSheet.Cell(5, 1).Value = "Passivo";
                npsSheet.Cell(5, 2).Value = dashboardData.NpsDetalhamento.Passivo;
                
                npsSheet.Cell(6, 1).Value = "Detrator";
                npsSheet.Cell(6, 2).Value = dashboardData.NpsDetalhamento.Detrator;

                npsSheet.Columns().AdjustToContents();

                // Aba 5: Dados Satisfação
                var satisfacaoSheet = workbook.Worksheets.Add("Satisfação Geral");
                satisfacaoSheet.Cell(1, 1).Value = "Satisfação Geral";
                // Converter para percentual igual ao frontend
                double satisfacaoGeralPercentual = Math.Round((dashboardData.Satisfacao / 5) * 1000) / 10;
                satisfacaoSheet.Cell(1, 2).Value = satisfacaoGeralPercentual;
                satisfacaoSheet.Cell(1, 1).Style.Font.Bold = true;
                satisfacaoSheet.Cell(1, 2).Style.Font.Bold = true;
                
                satisfacaoSheet.Cell(3, 1).Value = "Nível";
                satisfacaoSheet.Cell(3, 2).Value = "Percentual";
                satisfacaoSheet.Cell(3, 1).Style.Font.Bold = true;
                satisfacaoSheet.Cell(3, 2).Style.Font.Bold = true;
                
                satisfacaoSheet.Cell(4, 1).Value = "Muito Insatisfeito";
                satisfacaoSheet.Cell(4, 2).Value = dashboardData.SatisfacaoDetalhamento.MuitoInsatisfeito;
                
                satisfacaoSheet.Cell(5, 1).Value = "Insatisfeito";
                satisfacaoSheet.Cell(5, 2).Value = dashboardData.SatisfacaoDetalhamento.Insatisfeito;
                
                satisfacaoSheet.Cell(6, 1).Value = "Nem Satisfeito/Nem Insatisfeito";
                satisfacaoSheet.Cell(6, 2).Value = dashboardData.SatisfacaoDetalhamento.NemInsatisfeitoNemSatisfeito;
                
                satisfacaoSheet.Cell(7, 1).Value = "Satisfeito";
                satisfacaoSheet.Cell(7, 2).Value = dashboardData.SatisfacaoDetalhamento.Satisfeito;
                
                satisfacaoSheet.Cell(8, 1).Value = "Muito Satisfeito";
                satisfacaoSheet.Cell(8, 2).Value = dashboardData.SatisfacaoDetalhamento.MuitoSatisfeito;

                satisfacaoSheet.Columns().AdjustToContents();

                // Aba 6: Dados Satisfação por Curso
                var satisfacaoCursoSheet = workbook.Worksheets.Add("Satisfação por Curso");
                satisfacaoCursoSheet.Cell(1, 1).Value = "Curso";
                satisfacaoCursoSheet.Cell(1, 2).Value = "Total";
                satisfacaoCursoSheet.Cell(1, 3).Value = "Muito Insatisfeito";
                satisfacaoCursoSheet.Cell(1, 4).Value = "Insatisfeito";
                satisfacaoCursoSheet.Cell(1, 5).Value = "Nem Satisfeito/Nem Insatisfeito";
                satisfacaoCursoSheet.Cell(1, 6).Value = "Satisfeito";
                satisfacaoCursoSheet.Cell(1, 7).Value = "Muito Satisfeito";
                satisfacaoCursoSheet.Cell(1, 8).Value = "Satisfação (%)";
                satisfacaoCursoSheet.Cell(1, 1).Style.Font.Bold = true;
                satisfacaoCursoSheet.Cell(1, 2).Style.Font.Bold = true;
                satisfacaoCursoSheet.Cell(1, 3).Style.Font.Bold = true;
                satisfacaoCursoSheet.Cell(1, 4).Style.Font.Bold = true;
                satisfacaoCursoSheet.Cell(1, 5).Style.Font.Bold = true;
                satisfacaoCursoSheet.Cell(1, 6).Style.Font.Bold = true;
                satisfacaoCursoSheet.Cell(1, 7).Style.Font.Bold = true;
                satisfacaoCursoSheet.Cell(1, 8).Style.Font.Bold = true;

                for (int i = 0; i < dashboardData.SatisfacaoPorCurso.Count(); i++)
                {
                    var curso = dashboardData.SatisfacaoPorCurso[i];
                    satisfacaoCursoSheet.Cell(i + 2, 1).Value = curso.Curso;
                    satisfacaoCursoSheet.Cell(i + 2, 2).Value = curso.Total;
                    satisfacaoCursoSheet.Cell(i + 2, 3).Value = curso.MuitoInsatisfeito;
                    satisfacaoCursoSheet.Cell(i + 2, 4).Value = curso.Insatisfeito;
                    satisfacaoCursoSheet.Cell(i + 2, 5).Value = curso.NemSatisfeitoNemInsatisfeito;
                    satisfacaoCursoSheet.Cell(i + 2, 6).Value = curso.Satisfeito;
                    satisfacaoCursoSheet.Cell(i + 2, 7).Value = curso.MuitoSatisfeito;
                    // Converter para percentual igual ao frontend
                    double satisfacaoPercentual = Math.Round((curso.Satisfacao / 5) * 1000) / 10;
                    satisfacaoCursoSheet.Cell(i + 2, 8).Value = satisfacaoPercentual;
                }

                satisfacaoCursoSheet.Columns().AdjustToContents();

                // Aba 7: Dados Matrizes de Médias
                var matrizSheet = workbook.Worksheets.Add("Matrizes de Médias");
                int rowOffset = 1;
                
                foreach (var matriz in dashboardData.MatrizMedias)
                {
                    // Título da matriz
                    matrizSheet.Cell(rowOffset, 1).Value = "Questão:";
                    matrizSheet.Cell(rowOffset, 2).Value = matriz.QuestaoTexto;
                    matrizSheet.Cell(rowOffset, 1).Style.Font.Bold = true;
                    matrizSheet.Cell(rowOffset, 2).Style.Font.Bold = true;
                    rowOffset++;
                    
                    // Cabeçalhos
                    matrizSheet.Cell(rowOffset, 1).Value = "Afirmação";
                    matrizSheet.Cell(rowOffset, 2).Value = "Média";
                    matrizSheet.Cell(rowOffset, 1).Style.Font.Bold = true;
                    matrizSheet.Cell(rowOffset, 2).Style.Font.Bold = true;
                    rowOffset++;
                    
                    // Dados das linhas
                    foreach (var linha in matriz.Linhas)
                    {
                        matrizSheet.Cell(rowOffset, 1).Value = linha.Afirmacao;
                        matrizSheet.Cell(rowOffset, 2).Value = linha.Media;
                        rowOffset++;
                    }
                    
                    rowOffset += 2; // Espaço entre matrizes
                }

                matrizSheet.Columns().AdjustToContents();

                // Aba 8: Dados Análise de Sentimento Q19
                var sentimentoQ19Sheet = workbook.Worksheets.Add("Análise Sentimento Q19");
                sentimentoQ19Sheet.Cell(1, 1).Value = "Enunciado:";
                sentimentoQ19Sheet.Cell(1, 2).Value = dashboardData.EnunciadoQ19;
                sentimentoQ19Sheet.Cell(1, 1).Style.Font.Bold = true;
                sentimentoQ19Sheet.Cell(1, 2).Style.Font.Bold = true;
                
                sentimentoQ19Sheet.Cell(3, 1).Value = "Categoria";
                sentimentoQ19Sheet.Cell(3, 2).Value = "Sentimento";
                sentimentoQ19Sheet.Cell(3, 3).Value = "Quantidade";
                sentimentoQ19Sheet.Cell(3, 4).Value = "Total";
                sentimentoQ19Sheet.Cell(3, 1).Style.Font.Bold = true;
                sentimentoQ19Sheet.Cell(3, 2).Style.Font.Bold = true;
                sentimentoQ19Sheet.Cell(3, 3).Style.Font.Bold = true;
                sentimentoQ19Sheet.Cell(3, 4).Style.Font.Bold = true;

                int row = 4;
                foreach (var categoria in dashboardData.AnaliseSentimentoPorCategoriaQ19)
                {
                    foreach (var sentimento in categoria.Sentimentos)
                    {
                        sentimentoQ19Sheet.Cell(row, 1).Value = categoria.Categoria;
                        sentimentoQ19Sheet.Cell(row, 2).Value = sentimento.Sentimento;
                        sentimentoQ19Sheet.Cell(row, 3).Value = sentimento.Quantidade;
                        sentimentoQ19Sheet.Cell(row, 4).Value = categoria.Total;
                        row++;
                    }
                }

                sentimentoQ19Sheet.Columns().AdjustToContents();

                // Aba 9: Dados Análise de Sentimento Q23
                var sentimentoQ23Sheet = workbook.Worksheets.Add("Análise Sentimento Q23");
                sentimentoQ23Sheet.Cell(1, 1).Value = "Enunciado:";
                sentimentoQ23Sheet.Cell(1, 2).Value = dashboardData.EnunciadoQ23;
                sentimentoQ23Sheet.Cell(1, 1).Style.Font.Bold = true;
                sentimentoQ23Sheet.Cell(1, 2).Style.Font.Bold = true;
                
                sentimentoQ23Sheet.Cell(3, 1).Value = "Categoria";
                sentimentoQ23Sheet.Cell(3, 2).Value = "Sentimento";
                sentimentoQ23Sheet.Cell(3, 3).Value = "Quantidade";
                sentimentoQ23Sheet.Cell(3, 4).Value = "Total";
                sentimentoQ23Sheet.Cell(3, 1).Style.Font.Bold = true;
                sentimentoQ23Sheet.Cell(3, 2).Style.Font.Bold = true;
                sentimentoQ23Sheet.Cell(3, 3).Style.Font.Bold = true;
                sentimentoQ23Sheet.Cell(3, 4).Style.Font.Bold = true;

                row = 4;
                foreach (var categoria in dashboardData.AnaliseSentimentoPorCategoriaQ23)
                {
                    foreach (var sentimento in categoria.Sentimentos)
                    {
                        sentimentoQ23Sheet.Cell(row, 1).Value = categoria.Categoria;
                        sentimentoQ23Sheet.Cell(row, 2).Value = sentimento.Sentimento;
                        sentimentoQ23Sheet.Cell(row, 3).Value = sentimento.Quantidade;
                        sentimentoQ23Sheet.Cell(row, 4).Value = categoria.Total;
                        row++;
                    }
                }

                sentimentoQ23Sheet.Columns().AdjustToContents();

                // Salvar arquivo
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    stream.Position = 0;
                    return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Dashboard_Questionario_{req.QuestionarioId}.xlsx");
                }
            }
        }

        // Exemplo: gera gráfico de barras simples (NPS detalhamento)
        private byte[] GerarGraficoBarras(NpsDetalhamentoDto nps)
        {
            int width = 420, height = 220;
            using var bitmap = new SKBitmap(width, height);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.White);

            // Dados
            var valores = new[] { nps.Passivo, nps.Promotor, nps.Detrator };
            var cores = new[] { SKColors.Orange, SKColors.Green, SKColors.Red };
            var labels = new[] { "Passivo", "Promotor", "Detrator" };
            int max = 100;
            int barWidth = 90;
            int spacing = 20;

            for (int i = 0; i < valores.Length; i++)
            {
                float barHeight = (float)valores[i] / max * 110f;
                float x = 30 + i * (barWidth + spacing);
                float y = height - 60 - barHeight;

                // Barra
                var paint = new SKPaint { Color = cores[i], Style = SKPaintStyle.Fill };
                canvas.DrawRect(x, y, barWidth, barHeight, paint);

                // Valor acima da barra (bold)
                var valuePaint = new SKPaint { Color = SKColors.Black, TextSize = 28, IsAntialias = true, TextAlign = SKTextAlign.Center, Typeface = SKTypeface.FromFamilyName(null, SKFontStyle.Bold) };
                canvas.DrawText(valores[i].ToString(), x + barWidth / 2, y - 8, valuePaint);

                // Label abaixo da barra
                var labelPaint = new SKPaint { Color = SKColors.Black, TextSize = 20, IsAntialias = true, TextAlign = SKTextAlign.Center };
                canvas.DrawText(labels[i], x + barWidth / 2, height - 25, labelPaint);
            }

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }

        private byte[] GerarGraficoLinha(List<TendenciaRespostaDto> tendencia)
        {
            int width = 700, height = 360;
            using var bitmap = new SKBitmap(width, height);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.White);

            // Margens - aumentei a margem inferior para acomodar as datas rotacionadas
            int marginLeft = 60, marginBottom = 80, marginTop = 30, marginRight = 30;
            int plotWidth = width - marginLeft - marginRight;
            int plotHeight = height - marginTop - marginBottom;

            // Eixos
            var eixoPaint = new SKPaint { Color = SKColors.Gray.WithAlpha(120), StrokeWidth = 1 };
            var gridPaint = new SKPaint { Color = SKColors.Gray.WithAlpha(60), StrokeWidth = 1 };
            var textPaint = new SKPaint { Color = SKColors.Gray, TextSize = 14, IsAntialias = true };

            // Dados
            if (tendencia == null || tendencia.Count == 0)
                return bitmap.Bytes;

            int n = tendencia.Count();
            int maxY = tendencia.Max(t => t.Quantidade);
            maxY = Math.Max(maxY, 10);
            // Arredonda maxY para o próximo múltiplo de 100 para garantir folga
            int maxYArredondado = ((maxY + 99) / 100) * 100;
            int stepY = (int)Math.Ceiling(maxYArredondado / 5.0 / 10) * 10; // múltiplo de 10
            if (stepY == 0) stepY = 10;
            int gridLines = Math.Max(2, maxYArredondado / stepY);

            float stepX = plotWidth / (float)(n - 1);
            float scaleY = plotHeight / (float)(stepY * gridLines);

            // Grid horizontal
            for (int i = 0; i <= gridLines; i++)
            {
                float y = marginTop + plotHeight - i * stepY * scaleY;
                canvas.DrawLine(marginLeft, y, width - marginRight, y, gridPaint);
                // Label eixo Y
                var label = (i * stepY).ToString();
                canvas.DrawText(label, marginLeft - 10 - textPaint.MeasureText(label), y + 5, textPaint);
            }

            // Eixo X
            canvas.DrawLine(marginLeft, marginTop + plotHeight, width - marginRight, marginTop + plotHeight, eixoPaint);
            // Eixo Y
            canvas.DrawLine(marginLeft, marginTop, marginLeft, marginTop + plotHeight, eixoPaint);

            // Linha preta contínua e suave
            var linePaint = new SKPaint { Color = SKColors.Black, StrokeWidth = 1.5f, IsAntialias = true, Style = SKPaintStyle.Stroke }; 
            using (var path = new SKPath())
            {
                for (int i = 0; i < n; i++)
                {
                    float x = marginLeft + i * stepX;
                    float y = marginTop + plotHeight - (tendencia[i].Quantidade * scaleY);
                    if (i == 0)
                        path.MoveTo(x, y);
                    else
                        path.LineTo(x, y);
                }
                canvas.DrawPath(path, linePaint);
            }

            // Valores pequenos acima da linha
            var valuePaint = new SKPaint { Color = SKColors.Black, TextSize = 10, IsAntialias = true, TextAlign = SKTextAlign.Center };
            for (int i = 0; i < n; i++)
            {
                float x = marginLeft + i * stepX;
                float y = marginTop + plotHeight - (tendencia[i].Quantidade * scaleY);
                canvas.DrawText(tendencia[i].Quantidade.ToString(), x, y - 16, valuePaint);
            }

            // Datas eixo X rotacionadas em 45 graus
            var datePaint = new SKPaint { Color = SKColors.Black, TextSize = 16, IsAntialias = true, TextAlign = SKTextAlign.Center };
            for (int i = 0; i < n; i++)
            {
                float x = marginLeft + i * stepX;
                float y = marginTop + plotHeight + 45; // Posicionado mais abaixo para acomodar a rotação
                string dataFormatada = tendencia[i].Data;
                if (DateTime.TryParse(tendencia[i].Data, out var dataDt))
                    dataFormatada = dataDt.ToString("dd MMM");
                
                // Salvar o estado atual do canvas
                canvas.Save();
                
                // Rotacionar o canvas em 45 graus
                canvas.RotateDegrees(45, x, y);
                
                // Desenhar o texto rotacionado
                canvas.DrawText(dataFormatada, x, y, datePaint);
                
                // Restaurar o estado do canvas
                canvas.Restore();
            }

            // Legenda "Respostas" com bolinha preta - posicionada mais abaixo
            var legendPaint = new SKPaint { Color = SKColors.Black, TextSize = 12, IsAntialias = true };
            float legendX = marginLeft + 10;
            float legendY = height - 4; // Movido mais para baixo
            canvas.DrawCircle(legendX, legendY - 5, 6, legendPaint);
            canvas.DrawText("Respostas", legendX + 18, legendY, legendPaint);

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }

        private byte[] GerarBarraSegmentadaNps(NpsDetalhamentoDto nps)
        {
            int width = 400, height = 80;
            using var bitmap = new SKBitmap(width, height);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.White);

            // Dados
            var valores = new[] { nps.Passivo, nps.Promotor, nps.Detrator };
            var cores = new[] { SKColors.Orange, SKColors.Green, SKColors.Red };
            var labels = new[] { "Passivo", "Promotor", "Detrator" };

            float x = 20;
            float y = 20;
            float barHeight = 28;
            float barWidth = width - 40;

            // Desenhar segmentos
            float currentX = x;
            for (int i = 0; i < valores.Length; i++)
            {
                // Os valores já estão em porcentagem, então usamos diretamente
                float percent = (float)valores[i] / 100f;
                float segmentWidth = barWidth * percent;

                var paint = new SKPaint { Color = cores[i], Style = SKPaintStyle.Fill, IsAntialias = true };
                canvas.DrawRect(currentX, y, segmentWidth, barHeight, paint);

                // Percentual centralizado no segmento - fonte menor
                if (percent > 0)
                {
                    var percentPaint = new SKPaint { Color = SKColors.Black, TextSize = 8, IsAntialias = true, TextAlign = SKTextAlign.Center };
                    string percentText = $"{valores[i]:F1}%";
                    float textX = currentX + segmentWidth / 2;
                    float textY = y + barHeight / 2 + 6;
                    canvas.DrawText(percentText, textX, textY, percentPaint);
                }

                currentX += segmentWidth;
            }

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }

        private byte[] GerarBarraSegmentadaSatisfacao(SatisfacaoDetalhamentoDto nps)
        {
            int width = 400, height = 80;
            using var bitmap = new SKBitmap(width, height);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.White);

            // Dados
            var valores = new[] { nps.MuitoInsatisfeito, nps.Insatisfeito, nps.NemInsatisfeitoNemSatisfeito, nps.Satisfeito, nps.MuitoSatisfeito };
            // Cores consistentes com o frontend
            var cores = new[] { 
                new SKColor(0xD3, 0x2F, 0x2F), // #d32f2f - Muito Insatisfeito
                new SKColor(0xFF, 0x98, 0x00), // #ff9800 - Insatisfeito
                new SKColor(0xFF, 0xEB, 0x3B), // #ffeb3b - Nem Satisfeito/Nem Insatisfeito
                new SKColor(0x8B, 0xC3, 0x4A), // #8bc34a - Satisfeito
                new SKColor(0x43, 0xA0, 0x47)  // #43a047 - Muito Satisfeito
            };
            var labels = new[] { "MuitoInsatisfeito", "Insatisfeito", "Nem Insatisfeito / Nem Satisfeito", "Satisfeito", "Muito Satisfeito" };

            float x = 20;
            float y = 20;
            float barHeight = 28;
            float barWidth = width - 40;

            // Desenhar segmentos
            float currentX = x;
            for (int i = 0; i < valores.Length; i++)
            {
                // Os valores já estão em porcentagem, então usamos diretamente
                float percent = (float)valores[i] / 100f;
                float segmentWidth = barWidth * percent;

                var paint = new SKPaint { Color = cores[i], Style = SKPaintStyle.Fill, IsAntialias = true };
                canvas.DrawRect(currentX, y, segmentWidth, barHeight, paint);

                // Percentual centralizado no segmento - fonte menor
                if (percent > 0)
                {
                    var percentPaint = new SKPaint { Color = SKColors.Black, TextSize = 8, IsAntialias = true, TextAlign = SKTextAlign.Center };
                    string percentText = $"{valores[i]:F1}%";
                    float textX = currentX + segmentWidth / 2;
                    float textY = y + barHeight / 2 + 6;
                    canvas.DrawText(percentText, textX, textY, percentPaint);
                }

                currentX += segmentWidth;
            }

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }

        private byte[] GerarGaugeNps(int nps)
        {
            int width = 300, height = 300;
            using var bitmap = new SKBitmap(width, height);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.White);

            // Arco de fundo (cinza claro)
            float stroke = width / 14f;
            var arcoFundo = new SKPaint
            {
                Style = SKPaintStyle.Stroke,
                Color = SKColors.LightGray,
                StrokeWidth = stroke,
                IsAntialias = true,
                StrokeCap = SKStrokeCap.Round
            };
            float margin = stroke + 2;
            var rect = new SKRect(margin, margin, width - margin, height - margin);
            canvas.DrawArc(rect, 135, 270, false, arcoFundo);

            // Cores do gauge (igual ao Chart.js)
            var cores = new[] { SKColors.Red, SKColors.Orange, SKColors.Yellow, SKColors.LightGreen, SKColors.Green };
            var faixas = new[] { 54, 54, 54, 54, 54 }; // 270/5 = 54 graus por faixa

            float startAngle = 135;
            for (int i = 0; i < cores.Length; i++)
            {
                var paint = new SKPaint
                {
                    Style = SKPaintStyle.Stroke,
                    Color = cores[i],
                    StrokeWidth = stroke,
                    IsAntialias = true,
                    StrokeCap = SKStrokeCap.Butt
                };
                canvas.DrawArc(rect, startAngle, faixas[i], false, paint);
                startAngle += faixas[i];
            }

            // Valor central
            var valuePaint = new SKPaint { Color = SKColors.Black, TextSize = width / 4f, IsAntialias = true, TextAlign = SKTextAlign.Center, Typeface = SKTypeface.FromFamilyName(null, SKFontStyle.Bold) };
            canvas.DrawText(nps.ToString(), width / 2, height / 2 + width / 10f, valuePaint);

            // Texto "NPS"
            var labelPaint = new SKPaint { Color = SKColors.Gray, TextSize = width / 8f, IsAntialias = true, TextAlign = SKTextAlign.Center };
            canvas.DrawText("NPS", width / 2, height / 2 + width / 3.2f, labelPaint);

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }
        private byte[] GerarGaugeSatisfacao(double nps)
        {
            int width = 300, height = 300;
            using var bitmap = new SKBitmap(width, height);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.White);

            // Arco de fundo (cinza claro)
            float stroke = width / 14f;
            var arcoFundo = new SKPaint
            {
                Style = SKPaintStyle.Stroke,
                Color = SKColors.LightGray,
                StrokeWidth = stroke,
                IsAntialias = true,
                StrokeCap = SKStrokeCap.Round
            };
            float margin = stroke + 2;
            var rect = new SKRect(margin, margin, width - margin, height - margin);
            canvas.DrawArc(rect, 135, 270, false, arcoFundo);

            // Cores do gauge (consistentes com o frontend)
            var cores = new[] { 
                new SKColor(0xD3, 0x2F, 0x2F), // #d32f2f - Muito Insatisfeito
                new SKColor(0xFF, 0x98, 0x00), // #ff9800 - Insatisfeito
                new SKColor(0xFF, 0xEB, 0x3B), // #ffeb3b - Nem Satisfeito/Nem Insatisfeito
                new SKColor(0x8B, 0xC3, 0x4A), // #8bc34a - Satisfeito
                new SKColor(0x43, 0xA0, 0x47)  // #43a047 - Muito Satisfeito
            };
            var faixas = new[] { 54, 54, 54, 54, 54 }; // 270/5 = 54 graus por faixa

            float startAngle = 135;
            for (int i = 0; i < cores.Length; i++)
            {
                var paint = new SKPaint
                {
                    Style = SKPaintStyle.Stroke,
                    Color = cores[i],
                    StrokeWidth = stroke,
                    IsAntialias = true,
                    StrokeCap = SKStrokeCap.Butt
                };
                canvas.DrawArc(rect, startAngle, faixas[i], false, paint);
                startAngle += faixas[i];
            }

            // Valor central
            var valuePaint = new SKPaint { Color = SKColors.Black, TextSize = width / 4f, IsAntialias = true, TextAlign = SKTextAlign.Center, Typeface = SKTypeface.FromFamilyName(null, SKFontStyle.Bold) };
            canvas.DrawText(nps.ToString() + "%", width / 2, height / 2 + width / 10f, valuePaint);

            // Texto "Satisfação"
            var labelPaint = new SKPaint { Color = SKColors.Gray, TextSize = width / 8f, IsAntialias = true, TextAlign = SKTextAlign.Center };
            canvas.DrawText("Satisfação", width / 2, height / 2 + width / 3.2f, labelPaint);

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }

        private byte[] GerarBubbleChartPorCategoria(List<CategoriaSentimentoDto> analiseSentimento)
        {
            int width = 900, height = 600;
            using var bitmap = new SKBitmap(width, height);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.White);

            // Cores para sentimentos
            var cores = new Dictionary<string, SKColor> {
                { "Muito negativo", SKColors.Red },
                { "Negativo", SKColors.OrangeRed },
                { "Misto", SKColors.Gray },
                { "Positivo", SKColors.LimeGreen },
                { "Muito positivo", SKColors.Green },
                { "Neutro", SKColors.LightGray }
            };

            // Parâmetros de layout
            int maxBubble = analiseSentimento.Max(c => c.Total);
            float minRadius = 40, maxRadius = 90;
            float margin = 30;
            int cols = 5;
            int colWidth = (width - (int)margin * 2) / cols;
            int rowHeight = 170;

            for (int i = 0; i < analiseSentimento.Count(); i++)
            {
                var cat = analiseSentimento[i];
                float raio = minRadius + (maxRadius - minRadius) * ((float)cat.Total / maxBubble);
                int col = i % cols;
                int row = i / cols;
                float cx = margin + col * colWidth + colWidth / 2;
                float cy = margin + row * rowHeight + rowHeight / 2;

                // Desenhar arcos de sentimento
                float startAngle = -90;
                int totalSent = cat.Sentimentos.Sum(s => s.Quantidade);
                foreach (var sent in cat.Sentimentos)
                {
                    float sweep = totalSent > 0 ? 360f * ((float)sent.Quantidade / totalSent) : 0;
                    var paint = new SKPaint
                    {
                        Style = SKPaintStyle.Stroke,
                        Color = cores.TryGetValue(sent.Sentimento, out var cor) ? cor : SKColors.Gray,
                        StrokeWidth = 10,
                        IsAntialias = true
                    };
                    var rect = new SKRect(cx - raio, cy - raio, cx + raio, cy + raio);
                    canvas.DrawArc(rect, startAngle, sweep, false, paint);
                    startAngle += sweep;
                }

                // Círculo de fundo
                var fundo = new SKPaint { Style = SKPaintStyle.Fill, Color = SKColors.White, IsAntialias = true };
                canvas.DrawCircle(cx, cy, raio - 8, fundo);

                // Nome da categoria centralizado
                var textPaint = new SKPaint { Color = SKColors.Black, TextSize = 16, IsAntialias = true, TextAlign = SKTextAlign.Center };
                canvas.DrawText(cat.Categoria, cx, cy, textPaint);
            }

            // Legenda (opcional)
            float lx = margin, ly = height - 30;
            float lsize = 12;
            foreach (var kv in cores)
            {
                var paint = new SKPaint { Color = kv.Value, Style = SKPaintStyle.Stroke, StrokeWidth = 8, IsAntialias = true };
                canvas.DrawLine(lx, ly, lx + 20, ly, paint);
                var textPaint = new SKPaint { Color = SKColors.Black, TextSize = 12, IsAntialias = true };
                canvas.DrawText(kv.Key, lx + 30, ly + 5, textPaint);
                lx += 120; // Aumentei o espaçamento de 90 para 120
            }

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }

        // Adicione o método utilitário para gerar a imagem da nota
        private byte[] GerarNotaComentario(double nota, string tipo)
        {
            int size = 40;
            using var bitmap = new SKBitmap(size, size);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.Transparent);

            var cor = tipo == "Promotor" ? SKColors.Green
                    : tipo == "Passivo" ? SKColors.Orange
                    : SKColors.Red;

            var paint = new SKPaint { Color = cor, IsAntialias = true };
            canvas.DrawCircle(size / 2, size / 2, size / 2 - 2, paint);

            var textPaint = new SKPaint { Color = SKColors.White, TextSize = 18, IsAntialias = true, TextAlign = SKTextAlign.Center };
            canvas.DrawText(nota.ToString(), size / 2, size / 2 + 7, textPaint);

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }

        // Gera gráfico de barras horizontal de satisfação por curso (ajuste para texto longo)
        private byte[] GerarGraficoSatisfacaoPorCurso(List<SatisfacaoPorCursoDto> lista)
        {
            if (lista == null || lista.Count == 0)
                return Array.Empty<byte>();

            int width = 1000;
            int barHeight = 32;
            int spacing = 12;
            int leftMargin = 350; // Mais espaço para texto
            int rightMargin = 80;
            int topMargin = 30;
            int bottomMargin = 30;
            int height = topMargin + bottomMargin + lista.Count * (barHeight + spacing);

            using var bitmap = new SKBitmap(width, height);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.White);

            var barColor = SKColors.DeepSkyBlue;
            var barBgColor = SKColors.LightGray.WithAlpha(80);
            var textColor = SKColors.Black;
            var valueColor = SKColors.Black;
            var font = SKTypeface.FromFamilyName(null, SKFontStyle.Normal);

            double maxValue = 5.0;
            float textFontSize = 15;

            for (int i = 0; i < lista.Count(); i++)
            {
                var curso = lista[i];
                float y = topMargin + i * (barHeight + spacing);

                // Fundo da barra
                var bgPaint = new SKPaint { Color = barBgColor, IsAntialias = true };
                canvas.DrawRect(leftMargin, y, width - leftMargin - rightMargin, barHeight, bgPaint);

                // Converter para percentual igual ao frontend
                double satisfacaoPercentual = Math.Round((curso.Satisfacao / 5) * 1000) / 10;
                
                // Barra de valor (usando percentual)
                float barW = (float)((satisfacaoPercentual / 100.0) * (width - leftMargin - rightMargin));
                var barPaint = new SKPaint { Color = barColor, IsAntialias = true };
                canvas.DrawRect(leftMargin, y, barW, barHeight, barPaint);

                // Nome do curso (word wrap, alinhado à esquerda)
                var textPaint = new SKPaint { Color = textColor, TextSize = textFontSize, IsAntialias = true, TextAlign = SKTextAlign.Left, Typeface = font };
                float maxTextWidth = leftMargin - 20;
                var wrappedLines = QuebrarTextoEmLinhas(curso.Curso, textPaint, maxTextWidth);
                float textY = y + barHeight / 2 + (wrappedLines.Count == 1 ? 7 : -((wrappedLines.Count - 1) * textFontSize / 2) + 7);
                for (int l = 0; l < wrappedLines.Count(); l++)
                {
                    canvas.DrawText(wrappedLines[l], 10, textY + l * textFontSize, textPaint);
                }

                // Valor em percentual
                var valuePaint = new SKPaint { Color = valueColor, TextSize = 18, IsAntialias = true, TextAlign = SKTextAlign.Left, Typeface = font };
                string valueText = satisfacaoPercentual.ToString("0.0") + "%";
                canvas.DrawText(valueText, leftMargin + barW + 10, y + barHeight / 2 + 7, valuePaint);
            }

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }

        // Gera gráfico de barras horizontal para matriz de médias
        private byte[] GerarGraficoMatriz(MatrizMediaDto matriz)
        {
            if (matriz == null || matriz.Linhas == null || matriz.Linhas.Count == 0)
                return Array.Empty<byte>();

            int width = 1000;
            int barHeight = 32;
            int spacing = 12;
            int leftMargin = 350; // Mais espaço para texto
            int rightMargin = 80;
            int topMargin = 30;
            int bottomMargin = 30;
            int height = topMargin + bottomMargin + matriz.Linhas.Count * (barHeight + spacing);

            using var bitmap = new SKBitmap(width, height);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.White);

            var barColor = SKColors.DeepSkyBlue;
            var barBgColor = SKColors.LightGray.WithAlpha(80);
            var textColor = SKColors.Black;
            var valueColor = SKColors.Black;
            var font = SKTypeface.FromFamilyName(null, SKFontStyle.Normal);

            double maxValue = 5.0;
            float textFontSize = 15;

            for (int i = 0; i < matriz.Linhas.Count(); i++)
            {
                var linha = matriz.Linhas[i];
                float y = topMargin + i * (barHeight + spacing);

                // Fundo da barra
                var bgPaint = new SKPaint { Color = barBgColor, IsAntialias = true };
                canvas.DrawRect(leftMargin, y, width - leftMargin - rightMargin, barHeight, bgPaint);

                // Barra de valor
                float barW = (float)((linha.Media / maxValue) * (width - leftMargin - rightMargin));
                var barPaint = new SKPaint { Color = barColor, IsAntialias = true };
                canvas.DrawRect(leftMargin, y, barW, barHeight, barPaint);

                // Afirmação (word wrap, alinhado à esquerda)
                var textPaint = new SKPaint { Color = textColor, TextSize = textFontSize, IsAntialias = true, TextAlign = SKTextAlign.Left, Typeface = font };
                float maxTextWidth = leftMargin - 20;
                var wrappedLines = QuebrarTextoEmLinhas(linha.Afirmacao, textPaint, maxTextWidth);
                float textY = y + barHeight / 2 + (wrappedLines.Count == 1 ? 7 : -((wrappedLines.Count - 1) * textFontSize / 2) + 7);
                for (int l = 0; l < wrappedLines.Count(); l++)
                {
                    canvas.DrawText(wrappedLines[l], 10, textY + l * textFontSize, textPaint);
                }

                // Valor
                var valuePaint = new SKPaint { Color = valueColor, TextSize = 18, IsAntialias = true, TextAlign = SKTextAlign.Left, Typeface = font };
                string valueText = linha.Media.ToString("0.0");
                canvas.DrawText(valueText, leftMargin + barW + 10, y + barHeight / 2 + 7, valuePaint);
            }

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }

        // Utilitário para word wrap
        private List<string> QuebrarTextoEmLinhas(string texto, SKPaint paint, float maxWidth)
        {
            var linhas = new List<string>();
            if (string.IsNullOrWhiteSpace(texto)) return linhas;
            var palavras = texto.Split(' ');
            string linhaAtual = "";
            foreach (var palavra in palavras)
            {
                var teste = string.IsNullOrEmpty(linhaAtual) ? palavra : linhaAtual + " " + palavra;
                if (paint.MeasureText(teste) > maxWidth)
                {
                    if (!string.IsNullOrEmpty(linhaAtual)) linhas.Add(linhaAtual);
                    linhaAtual = palavra;
                }
                else
                {
                    linhaAtual = teste;
                }
            }
            if (!string.IsNullOrEmpty(linhaAtual)) linhas.Add(linhaAtual);
            return linhas;
        }
    }
} 