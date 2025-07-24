using System.Collections.Generic;

namespace NpsPesquisa.Api.Models
{
    public class DashboardPdfDto
    {
        public int TotalRespostas { get; set; }
        public List<TendenciaRespostaDto> TendenciaRespostas { get; set; }
        public double NpsGeral { get; set; }
        public NpsDetalhamentoDto NpsDetalhamento { get; set; }
        public double Satisfacao { get; set; }
        public double SatisfacaoCurso { get; set; }
        public SatisfacaoDetalhamentoDto SatisfacaoDetalhamento { get; set; }
        public SatisfacaoDetalhamentoDto SatisfacaoPorCursoDetalhamento { get; set; }
        public List<SatisfacaoPorCursoDto> SatisfacaoPorCurso { get; set; }
        public List<ComentarioDto> ComentariosQ19 { get; set; }
        public List<ComentarioDto> ComentariosQ23 { get; set; }
        public List<MatrizMediaDto> MatrizMedias { get; set; }
        public List<SentimentoDto> AnaliseSentimentoQ19 { get; set; }
        public List<SentimentoDto> AnaliseSentimentoQ23 { get; set; }
        public List<CategoriaSentimentoDto> AnaliseSentimentoPorCategoriaQ19 { get; set; }
        public List<CategoriaSentimentoDto> AnaliseSentimentoPorCategoriaQ23 { get; set; }
        public string EnunciadoQ19 { get; set; }
        public string EnunciadoQ23 { get; set; }
    }

    public class TendenciaRespostaDto
    {
        public string Data { get; set; }
        public int Quantidade { get; set; }
    }

    public class NpsDetalhamentoDto
    {
        public double Passivo { get; set; }
        public double Promotor { get; set; }
        public double Detrator { get; set; }
    }

    public class SatisfacaoDetalhamentoDto
    {
        public double MuitoInsatisfeito { get; set; }
        public double Insatisfeito { get; set; }
        public double NemInsatisfeitoNemSatisfeito { get; set; }
        public double Satisfeito { get; set; }
        public double MuitoSatisfeito { get; set; }
    }

    public class SatisfacaoPorCursoDto
    {
        public string Curso { get; set; }
        public int Total { get; set; }
        public int MuitoInsatisfeito { get; set; }
        public int Insatisfeito { get; set; }
        public int NemSatisfeitoNemInsatisfeito { get; set; }
        public int Satisfeito { get; set; }
        public int MuitoSatisfeito { get; set; }
        public SatisfacaoPercentuaisDto Percentuais { get; set; }
        public double Satisfacao { get; set; }
    }

    public class SatisfacaoPercentuaisDto
    {
        public double MuitoInsatisfeito { get; set; }
        public double Insatisfeito { get; set; }
        public double NemSatisfeitoNemInsatisfeito { get; set; }
        public double Satisfeito { get; set; }
        public double MuitoSatisfeito { get; set; }
    }

    public class ComentarioDto
    {
        public string Texto { get; set; }
        public string Curso { get; set; }
        public double Nota { get; set; }
        public string Tipo { get; set; } // Promotor, Passivo, Detrator
    }

    public class MatrizMediaDto
    {
        public int QuestaoId { get; set; }
        public string QuestaoTexto { get; set; }
        public List<MatrizLinhaDto> Linhas { get; set; }
    }

    public class MatrizLinhaDto
    {
        public string Afirmacao { get; set; }
        public double Media { get; set; }
    }

    public class SentimentoDto
    {
        public string Sentimento { get; set; }
        public int Quantidade { get; set; }
    }

    public class CategoriaSentimentoDto
    {
        public string Categoria { get; set; }
        public int Total { get; set; }
        public List<SentimentoDto> Sentimentos { get; set; }
    }

    public class RespostaPorOpcaoSatisfacaoDto
    {
        public int? OpcaoId { get; set; }
        public string OpcaoNome { get; set; }
        public int Peso { get; set; }
        public int Quantidade { get; set; }
        public double Percentual { get; set; }
    }
    // DTO para o gráfico de bolhas
    public class BubbleCategoriaDto
    {
        public string Categoria { get; set; } = string.Empty;
        public int Total { get; set; }
        public List<BubbleSentimentoDto> Sentimentos { get; set; } = new();
    }
    public class BubbleSentimentoDto
    {
        public string Sentimento { get; set; } = string.Empty;
        public int Quantidade { get; set; }
    }
} 