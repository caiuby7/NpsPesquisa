using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class PeriodoLetivo
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do período letivo é obrigatório")]
        [StringLength(200, ErrorMessage = "O nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O código do período letivo é obrigatório")]
        [StringLength(50, ErrorMessage = "O código deve ter no máximo 50 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "O tipo de curso é obrigatório")]
        public TipoCurso TipoCurso { get; set; }

        public bool Ativo { get; set; } = true;

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public DateTime? DataAtualizacao { get; set; }

        // Relacionamentos
        public virtual ICollection<Turma> Turmas { get; set; } = new List<Turma>();

        // Propriedades computadas
        [NotMapped]
        public string NomeCompleto => $"{Codigo} - {Nome}";

        [NotMapped]
        public string TipoCursoLabel => TipoCurso switch
        {
            TipoCurso.GRADUACAO => "Graduação",
            TipoCurso.POSGRADUACAO => "Pós-Graduação",
            _ => TipoCurso.ToString()
        };
    }
}
