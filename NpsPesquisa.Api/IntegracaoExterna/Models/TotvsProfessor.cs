using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.IntegracaoExterna.Models
{
    /// <summary>
    /// Modelo para dados de professores vindos do TOTVS (View V_PROFESSORES)
    /// </summary>
    public class TotvsProfessor
    {
        [Key]
        public string LOGIN { get; set; } = string.Empty;
        
        public string PERIODO_LETIVO { get; set; } = string.Empty;
        public string COD_FILIAL { get; set; } = string.Empty;
        public string FILIAL_NOME { get; set; } = string.Empty;
        public string NIVEL_ENSINO { get; set; } = string.Empty;
        public string COD_CURSO { get; set; } = string.Empty;
        public string HAB { get; set; } = string.Empty;
        public string MATRIZ { get; set; } = string.Empty;
        public string CURSO { get; set; } = string.Empty;
        public string COD_TURMA { get; set; } = string.Empty;
        public string TURMA_GERENCIAL { get; set; } = string.Empty;
        public string IDTURMADISC { get; set; } = string.Empty;
        public string IDTURMADISCGERENCIADA { get; set; } = string.Empty;
        public string COD_DISC { get; set; } = string.Empty;
        public string DISCIPLINA { get; set; } = string.Empty;
        public string TURNO_POLO { get; set; } = string.Empty;
        public string SEXO { get; set; } = string.Empty;
        public string PROFESSOR { get; set; } = string.Empty;
        public string TIPO_PROF_TURMA { get; set; } = string.Empty;
        public string TURMA_ATIVA { get; set; } = string.Empty;
        public string TIPO_TURMA { get; set; } = string.Empty;
        public string EMAIL { get; set; } = string.Empty;
        public string COORDENADORATUAL { get; set; } = string.Empty;
        public string PROF_ATIVO { get; set; } = string.Empty;
    }
}
