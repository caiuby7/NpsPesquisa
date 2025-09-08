using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class Disciplina
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Nome { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Descricao { get; set; }

        [StringLength(20)]
        public string? Codigo { get; set; }
        
        public bool Ativo { get; set; } = true;

        [Required]
        public int InstituicaoId { get; set; }
        
        public virtual Instituicao Instituicao { get; set; } = null!;

        // Relacionamentos
        public virtual ICollection<TurmaDisciplina> TurmasDisciplinas { get; set; } = new List<TurmaDisciplina>();

        public virtual ICollection<Professor> Professores { get; set; } = new List<Professor>();

        // Propriedades computadas
        [NotMapped]
        public string NomeCompleto => !string.IsNullOrEmpty(Codigo) ? $"{Codigo} - {Nome}" : Nome;
    }
}
