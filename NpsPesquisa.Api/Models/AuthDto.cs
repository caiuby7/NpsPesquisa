using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class LoginDto
    {
        [Required]
        public string Email { get; set; } = null!;

        [Required]
        public string Senha { get; set; } = null!;
    }

    public class RegistroDto
    {
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Senha { get; set; }
        public int PerfilId { get; set; }
    }

    public class TrocaSenhaDto
    {
        [Required]
        public string SenhaAtual { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string NovaSenha { get; set; } = null!;

        [Required]
        [Compare("NovaSenha")]
        public string ConfirmacaoNovaSenha { get; set; } = null!;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = null!;
        public string Nome { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Perfil { get; set; } = null!;
    }

    public class EsqueciSenhaDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
    }

    public class ValidarHashSenhaDto
    {
        [Required]
        public string Hash { get; set; } = null!;
    }

    public class RedefinirSenhaDto
    {
        [Required]
        public string Hash { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string NovaSenha { get; set; } = null!;

        [Required]
        [Compare("NovaSenha")]
        public string ConfirmacaoNovaSenha { get; set; } = null!;
    }
} 