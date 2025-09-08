using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class ProfessorViewModel
    {
        [Required(ErrorMessage = "O nome do professor é obrigatório")]
        [StringLength(200, ErrorMessage = "O nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        [StringLength(200, ErrorMessage = "O email deve ter no máximo 200 caracteres")]
        public string Email { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "O departamento deve ter no máximo 100 caracteres")]
        public string? Departamento { get; set; }

        [StringLength(100, ErrorMessage = "A titulação deve ter no máximo 100 caracteres")]
        public string? Titulacao { get; set; }

        [StringLength(20, ErrorMessage = "O telefone deve ter no máximo 20 caracteres")]
        public string? Telefone { get; set; }

        [StringLength(14, ErrorMessage = "O CPF deve ter no máximo 14 caracteres")]
        public string? Cpf { get; set; }

        public DateTime? DataNascimento { get; set; }

        // Novos campos baseados na planilha
        public string? Sexo { get; set; } // Mudado para string

        [StringLength(50, ErrorMessage = "O login deve ter no máximo 50 caracteres")]
        public string? Login { get; set; }

        public string? TipoProfessor { get; set; } // Mudado para string

        // Campos de Integração com Sistema Externo
        [StringLength(100, ErrorMessage = "O ID de integração deve ter no máximo 100 caracteres")]
        public string? IntegracaoId { get; set; }

        [StringLength(100, ErrorMessage = "O ID de integração do curso deve ter no máximo 100 caracteres")]
        public string? CursoIntegracaoId { get; set; }

        [StringLength(100, ErrorMessage = "O ID de integração da turma deve ter no máximo 100 caracteres")]
        public string? TurmaIntegracaoId { get; set; }

        [StringLength(100, ErrorMessage = "O ID de integração do período letivo deve ter no máximo 100 caracteres")]
        public string? PeriodoLetivoIntegracaoId { get; set; }

        [StringLength(100, ErrorMessage = "O ID de integração da instituição deve ter no máximo 100 caracteres")]
        public string? InstituicaoIntegracaoId { get; set; }

        [StringLength(100, ErrorMessage = "O ID de integração da disciplina deve ter no máximo 100 caracteres")]
        public string? DisciplinaIntegracaoId { get; set; }

        public int? InstituicaoId { get; set; }

        public bool Ativo { get; set; } = true;
    }
}
