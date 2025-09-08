using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class AlunoViewModel
    {
        // Dados Pessoais
        [Required(ErrorMessage = "O nome do aluno é obrigatório")]
        [StringLength(200, ErrorMessage = "O nome do aluno deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "A matrícula é obrigatória")]
        [StringLength(50, ErrorMessage = "A matrícula deve ter no máximo 50 caracteres")]
        public string Matricula { get; set; } = string.Empty;

        [StringLength(14, ErrorMessage = "O CPF deve ter no máximo 14 caracteres")]
        public string? Cpf { get; set; }

        public DateTime? DataNascimento { get; set; }

        public Sexo? Sexo { get; set; }

        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "O email deve ser um email válido")]
        [StringLength(200, ErrorMessage = "O email deve ter no máximo 200 caracteres")]
        public string Email { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "O email pessoal deve ser um email válido")]
        [StringLength(200, ErrorMessage = "O email pessoal deve ter no máximo 200 caracteres")]
        public string? EmailPessoal { get; set; }

        [StringLength(20, ErrorMessage = "O telefone deve ter no máximo 20 caracteres")]
        public string? Telefone { get; set; }

        // Dados Acadêmicos
        [Required(ErrorMessage = "O curso é obrigatório")]
        public int CursoId { get; set; }

        public int? TurmaId { get; set; }

        [Required(ErrorMessage = "O período letivo é obrigatório")]
        public int PeriodoLetivoId { get; set; }

        [Required(ErrorMessage = "A instituição é obrigatória")]
        public int InstituicaoId { get; set; }

        public Turno? Turno { get; set; }

        public int? Fase { get; set; }

        [StringLength(100, ErrorMessage = "A grade deve ter no máximo 100 caracteres")]
        public string? Grade { get; set; }

        [StringLength(100, ErrorMessage = "A habilitação deve ter no máximo 100 caracteres")]
        public string? Habilitacao { get; set; }

        public DateTime? DataIngressoCurso { get; set; }

        public TipoMatricula? TipoMatricula { get; set; }

        public DateTime? DataMatricula { get; set; }

        [StringLength(100, ErrorMessage = "O status no período letivo deve ter no máximo 100 caracteres")]
        public string? StatusNoPeriodoLetivo { get; set; }

        public bool TurmaAtiva { get; set; } = true;

        public bool AceitaContato { get; set; } = true;

        public bool Ativo { get; set; } = true;

        // Campos de Integração com Sistema Externo
        [StringLength(100, ErrorMessage = "O ID de integração deve ter no máximo 100 caracteres")]
        public string? IntegracaoId { get; set; }

        [StringLength(100, ErrorMessage = "O ID de integração da turma-disciplina deve ter no máximo 100 caracteres")]
        public string? TurmaDisciplinaIntegracaoId { get; set; }

        [StringLength(100, ErrorMessage = "O ID de integração do curso deve ter no máximo 100 caracteres")]
        public string? CursoIntegracaoId { get; set; }

        [StringLength(100, ErrorMessage = "O ID de integração da turma deve ter no máximo 100 caracteres")]
        public string? TurmaIntegracaoId { get; set; }

        [StringLength(100, ErrorMessage = "O ID de integração do período letivo deve ter no máximo 100 caracteres")]
        public string? PeriodoLetivoIntegracaoId { get; set; }

        [StringLength(100, ErrorMessage = "O ID de integração da instituição deve ter no máximo 100 caracteres")]
        public string? InstituicaoIntegracaoId { get; set; }

        // Lista de IDs das turmas-disciplinas vinculadas ao aluno
        public List<int> TurmaDisciplinaIds { get; set; } = new List<int>();
    }
} 