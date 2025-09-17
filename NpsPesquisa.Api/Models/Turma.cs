using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class Turma
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nome { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Descricao { get; set; }
        public string? Codigo { get; set; }

        [Required]
        public int CursoId { get; set; }
        public virtual Curso Curso { get; set; }

        public int? Turno { get; set; } // Manhã, Tarde, Noite

        public int PeriodoLetivoId { get; set; }
        public virtual PeriodoLetivo PeriodoLetivo { get; set; }
        public string? IntegracaoId { get; set; }
        public bool Ativo { get; set; } = true;

        // Relacionamentos
        public virtual ICollection<Aluno> Alunos { get; set; } = new List<Aluno>();

        public virtual ICollection<TurmaDisciplina> TurmasDisciplinas { get; set; } = new List<TurmaDisciplina>();

        // Propriedades computadas
        [NotMapped]
        public string NomeCompleto => $"{Nome} - {Curso?.Nome}";

        [NotMapped]
        public string PeriodoDescricao => Turno switch
        {
            1 => "Manhã",
            2 => "Tarde",
            3 => "Noite",
            _ => "Não informado"
        };
    }
}
