using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class AlunoViewModel
    {
        [Required(ErrorMessage = "O nome é obrigatório")]
        public string Nome { get; set; }

        [Required(ErrorMessage = "A filial é obrigatória")]
        public string Filial { get; set; }

        [Required(ErrorMessage = "O nível de ensino é obrigatório")]
        public string NivelEnsino { get; set; }

        [Required(ErrorMessage = "O período letivo é obrigatório")]
        public string PeriodoLetivo { get; set; }

        [Required(ErrorMessage = "A matrícula é obrigatória")]
        public string Matricula { get; set; }

        [Required(ErrorMessage = "O nome do curso é obrigatório")]
        public string NomeCurso { get; set; }

        [Required(ErrorMessage = "O turno é obrigatório")]
        public string Turno { get; set; }

        [Required(ErrorMessage = "O email institucional é obrigatório")]
        [EmailAddress(ErrorMessage = "Email institucional inválido")]
        public string EmailInstitucional { get; set; }

        [Required(ErrorMessage = "O email pessoal é obrigatório")]
        [EmailAddress(ErrorMessage = "Email pessoal inválido")]
        public string EmailPessoal { get; set; }

        [Required(ErrorMessage = "O telefone é obrigatório")]
        public string Fone { get; set; }

        [Required(ErrorMessage = "O status no período letivo é obrigatório")]
        public string StatusNoPeriodoLetivo { get; set; }

        [Required(ErrorMessage = "A aceitação de contato é obrigatória")]
        public bool AceitaContato { get; set; }
    }
} 