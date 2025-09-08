using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class LoginDto
    {
        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "O email deve ser um email válido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "A senha é obrigatória")]
        public string Senha { get; set; } = string.Empty;
    }

    public class RegistroDto
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

        [Required(ErrorMessage = "O perfil é obrigatório")]
        public int PerfilId { get; set; }
    }

    public class TrocaSenhaDto
    {
        [Required(ErrorMessage = "A senha atual é obrigatória")]
        public string SenhaAtual { get; set; } = string.Empty;

        [Required(ErrorMessage = "A nova senha é obrigatória")]
        [MinLength(6, ErrorMessage = "A nova senha deve ter pelo menos 6 caracteres")]
        public string NovaSenha { get; set; } = string.Empty;

        [Required(ErrorMessage = "A confirmação da nova senha é obrigatória")]
        [Compare("NovaSenha", ErrorMessage = "A confirmação da nova senha deve ser igual à nova senha")]
        public string ConfirmacaoNovaSenha { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Perfil { get; set; } = string.Empty;
    }

    public class EsqueciSenhaDto
    {
        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "O email deve ser um email válido")]
        public string Email { get; set; } = string.Empty;
    }

    public class ValidarHashSenhaDto
    {
        [Required(ErrorMessage = "O hash é obrigatório")]
        public string Hash { get; set; } = string.Empty;
    }

    public class RedefinirSenhaDto
    {
        [Required(ErrorMessage = "O hash é obrigatório")]
        public string Hash { get; set; } = string.Empty;

        [Required(ErrorMessage = "A nova senha é obrigatória")]
        [MinLength(6, ErrorMessage = "A nova senha deve ter pelo menos 6 caracteres")]
        public string NovaSenha { get; set; } = string.Empty;

        [Required(ErrorMessage = "A confirmação da nova senha é obrigatória")]
        [Compare("NovaSenha", ErrorMessage = "A confirmação da nova senha deve ser igual à nova senha")]
        public string ConfirmacaoNovaSenha { get; set; } = string.Empty;
    }
}
