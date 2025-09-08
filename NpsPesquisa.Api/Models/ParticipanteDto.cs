using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class ParticipanteCreateDto
    {
        [Required(ErrorMessage = "O nome é obrigatório")]
        [StringLength(200, ErrorMessage = "O nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        [StringLength(200, ErrorMessage = "O email deve ter no máximo 200 caracteres")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "O tipo de participante é obrigatório")]
        public TipoParticipante Tipo { get; set; }

        // Campos adicionais úteis para todos
        public string? Telefone { get; set; }
        public string? Cpf { get; set; }
        public string? DataNascimento { get; set; }
    }

    public class AlunoCreateDto : ParticipanteCreateDto
    {
        [Required(ErrorMessage = "O curso é obrigatório para alunos")]
        public int CursoId { get; set; }

        [Required(ErrorMessage = "A matrícula é obrigatória para alunos")]
        [StringLength(50, ErrorMessage = "A matrícula deve ter no máximo 50 caracteres")]
        public string Matricula { get; set; } = string.Empty;

        public int? Semestre { get; set; }
        public string? Turno { get; set; }
        public string? PeriodoLetivo { get; set; }
        public string? NivelEnsino { get; set; }
        public string? Filial { get; set; }
        public string? StatusNoPeriodoLetivo { get; set; } = "Ativo";
        public bool AceitaContato { get; set; } = true;
        public string? EmailInstitucional { get; set; }
        public string? EmailPessoal { get; set; }
        public string? Fone { get; set; }
    }

    public class ProfessorCreateDto : ParticipanteCreateDto
    {
        [Required(ErrorMessage = "O departamento é obrigatório para professores")]
        [StringLength(100, ErrorMessage = "O departamento deve ter no máximo 100 caracteres")]
        public string Departamento { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "A titulação deve ter no máximo 100 caracteres")]
        public string? Titulacao { get; set; }
    }

    public class CoordenadorCreateDto : ParticipanteCreateDto
    {
        [Required(ErrorMessage = "O departamento é obrigatório para coordenadores")]
        [StringLength(100, ErrorMessage = "O departamento deve ter no máximo 100 caracteres")]
        public string Departamento { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "A titulação deve ter no máximo 100 caracteres")]
        public string? Titulacao { get; set; }
    }

    public class FuncionarioCreateDto : ParticipanteCreateDto
    {
        [Required(ErrorMessage = "O setor é obrigatório para funcionários")]
        [StringLength(100, ErrorMessage = "O setor deve ter no máximo 100 caracteres")]
        public string Setor { get; set; } = string.Empty;

        [Required(ErrorMessage = "O cargo é obrigatório para funcionários")]
        [StringLength(100, ErrorMessage = "O cargo deve ter no máximo 100 caracteres")]
        public string Cargo { get; set; } = string.Empty;
    }

    public class ParticipanteUpdateDto : ParticipanteCreateDto
    {
        public int Id { get; set; }
        public bool Ativo { get; set; } = true;
    }
}
