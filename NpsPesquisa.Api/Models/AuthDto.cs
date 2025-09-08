using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class AuthDto
    {
        [Required(ErrorMessage = "O nome é obrigatório")]
        [StringLength(200, ErrorMessage = "O nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "O email deve ser um email válido")]
        [StringLength(200, ErrorMessage = "O email deve ter no máximo 200 caracteres")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "A senha é obrigatória")]
        [StringLength(100, ErrorMessage = "A senha deve ter no máximo 100 caracteres")]
        public string Senha { get; set; } = string.Empty;
    }
} 