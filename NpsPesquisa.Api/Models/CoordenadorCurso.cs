using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class CoordenadorCurso
    {
        public int Id { get; set; }

        [Required]
        public int CoordenadorId { get; set; }

        [Required]
        public int CursoId { get; set; }

        [Required]
        public DateTime DataInicio { get; set; }

        public DateTime? DataFim { get; set; }

        [StringLength(500, ErrorMessage = "A observação deve ter no máximo 500 caracteres")]
        public string? Observacao { get; set; }

        public bool Ativo { get; set; } = true;

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public DateTime? DataAtualizacao { get; set; }

        // Relacionamentos
        public virtual Coordenador Coordenador { get; set; } = null!;
        public virtual Curso Curso { get; set; } = null!;

        // Propriedades computadas
        [NotMapped]
        public bool EhCoordenacaoAtiva => Ativo && (DataFim == null || DataFim > DateTime.Now);

        [NotMapped]
        public string PeriodoCoordenacao
        {
            get
            {
                var inicio = DataInicio.ToString("MM/yyyy");
                var fim = DataFim?.ToString("MM/yyyy") ?? "Atual";
                return $"{inicio} - {fim}";
            }
        }
    }
}
