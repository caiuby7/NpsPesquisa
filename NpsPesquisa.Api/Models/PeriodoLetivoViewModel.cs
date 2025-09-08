using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class PeriodoLetivoViewModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do período letivo é obrigatório")]
        [StringLength(200, ErrorMessage = "O nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O código do período letivo é obrigatório")]
        [StringLength(50, ErrorMessage = "O código deve ter no máximo 50 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "O tipo de curso é obrigatório")]
        public string TipoCurso { get; set; } = string.Empty;

        public bool Ativo { get; set; } = true;
    }
}
