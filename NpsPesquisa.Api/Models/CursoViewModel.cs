using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class CursoViewModel
    {
        [Required(ErrorMessage = "O nome do curso é obrigatório")]
        [StringLength(200, ErrorMessage = "O nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "A descrição deve ter no máximo 1000 caracteres")]
        public string? Descricao { get; set; }

        [Required(ErrorMessage = "O código do curso é obrigatório")]
        [StringLength(20, ErrorMessage = "O código deve ter no máximo 20 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "A modalidade é obrigatória")]
        public string Modalidade { get; set; } = string.Empty; // Mudado para string

        [Required(ErrorMessage = "O tipo de curso é obrigatório")]
        public string TipoCurso { get; set; } = string.Empty; // Mudado para string

        [StringLength(100, ErrorMessage = "O ID de integração deve ter no máximo 100 caracteres")]
        public string? IntegracaoId { get; set; }

        [StringLength(100, ErrorMessage = "O código da filial deve ter no máximo 100 caracteres")]
        public string? CodigoFilial { get; set; }

        public bool Ativo { get; set; } = true;

        public int? InstituicaoId { get; set; }
    }
} 