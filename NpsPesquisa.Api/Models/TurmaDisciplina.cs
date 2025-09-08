using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class TurmaDisciplina
    {
        public int Id { get; set; }

        [Required]
        public int TurmaId { get; set; }
        public virtual Turma Turma { get; set; }

        [Required]
        public int DisciplinaId { get; set; }
        public virtual Disciplina Disciplina { get; set; }

        [Required]
        public int ProfessorId { get; set; }
        public virtual Professor Professor { get; set; }

        public int PeriodoLetivoId { get; set; }
        public virtual PeriodoLetivo PeriodoLetivo { get; set; }

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
        public virtual TurmaDisciplina? TurmaDisciplinaGerenciada { get; set; }

        public DateTime DataCriacao { get; set; } = DateTime.Now;

        // Relacionamentos
        public virtual ICollection<Aluno> Alunos { get; set; } = new List<Aluno>();

        // Configuração de chave composta será feita no DbContext
    }
}
