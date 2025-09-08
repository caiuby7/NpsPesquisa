using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class DisciplinaViewModel
    {
        [Required(ErrorMessage = "O nome da disciplina é obrigatório")]
        [StringLength(200, ErrorMessage = "O nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres")]
        public string? Descricao { get; set; }

        [StringLength(20, ErrorMessage = "O código deve ter no máximo 20 caracteres")]
        public string? Codigo { get; set; }

        public bool Ativo { get; set; } = true;

        [Required(ErrorMessage = "A instituição é obrigatória")]
        public int InstituicaoId { get; set; }
    }
}
