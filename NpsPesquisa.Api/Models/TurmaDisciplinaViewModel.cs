using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class TurmaDisciplinaViewModel
    {
        [Required(ErrorMessage = "A turma é obrigatória")]
        public int TurmaId { get; set; }

        [Required(ErrorMessage = "A disciplina é obrigatória")]
        public int DisciplinaId { get; set; }

        [Required(ErrorMessage = "O professor é obrigatório")]
        public int ProfessorId { get; set; }

        [Required(ErrorMessage = "O período letivo é obrigatório")]
        public int PeriodoLetivoId { get; set; }

        [StringLength(100, ErrorMessage = "O ID de integração deve ter no máximo 100 caracteres")]
        public string? IntegracaoId { get; set; }

        public bool Ativo { get; set; } = true;

        /// <summary>
        /// Indica se a disciplina é gerenciada pelo sistema (true) ou se é uma consolidação (false)
        /// para otimizar custos com professores quando há poucos alunos
        /// </summary>
        public bool Gerenciada { get; set; } = true;

        /// <summary>
        /// ID da turma-disciplina gerenciada que será referenciada quando Gerenciada = false.
        /// Permite rastrear qual turma original o aluno pertence para fins de avaliação.
        /// </summary>
        public int? IdTurmaDisciplinaGerenciada { get; set; }
    }
}
