using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.IntegracaoExterna.Models
{
    /// <summary>
    /// Modelo para dados de alunos vindos do TOTVS (View V_ALUNOS)
    /// </summary>
    public class TotvsAluno
    {
        [Key]
        public string RA { get; set; } = string.Empty;
        
        public string PERIODO_LETIVO { get; set; } = string.Empty;
        public string NIVEL_ENSINO { get; set; } = string.Empty;
        public string CODFILIAL { get; set; } = string.Empty;
        public string FILIAL_NOME { get; set; } = string.Empty;
        public string CODIGO_PESSOA { get; set; } = string.Empty;
        public string NOME { get; set; } = string.Empty;
        public string CPF { get; set; } = string.Empty;
        public DateTime? NASCIMENTO_ALUNO { get; set; }
        public string EMAIL { get; set; } = string.Empty;
        public string EMAIL_PESSOAL { get; set; } = string.Empty;
        public string SEXO { get; set; } = string.Empty;
        public DateTime? DT_NASC { get; set; }
        public string COD_STATUS_NA_DISCIPLINA { get; set; } = string.Empty;
        public string STATUS_NA_DISCIPLINA { get; set; } = string.Empty;
        public string TIPO_MATRICULA { get; set; } = string.Empty;
        public DateTime? DATA_MATRICULA { get; set; }
        public string IDTURMADISC { get; set; } = string.Empty;
        public string CODIGO_DISCIPLINA { get; set; } = string.Empty;
        public string CODTURMA { get; set; } = string.Empty;
        public string COD_CURSO_DA_TURMA { get; set; } = string.Empty;
        public string CURSO_DA_TURMA { get; set; } = string.Empty;
        public string FASE { get; set; } = string.Empty;
        public string NOME_DISCIPLINA { get; set; } = string.Empty;
        public string TIPO_TURMA { get; set; } = string.Empty;
        public string STATUS_NO_PERIODO_LETIVO { get; set; } = string.Empty;
        public string COD_CURSO_DO_ALUNO { get; set; } = string.Empty;
        public string CURSO_DO_ALUNO { get; set; } = string.Empty;
        public string FILIAL { get; set; } = string.Empty;
        public string GRADE_DO_ALUNO { get; set; } = string.Empty;
        public string HABILITACAO_DO_ALUNO { get; set; } = string.Empty;
        public DateTime? INGRESSO_NO_CURSO { get; set; }
        public string TURNO_POLO { get; set; } = string.Empty;
        public string TURMA_ATIVA { get; set; } = string.Empty;
    }
}
