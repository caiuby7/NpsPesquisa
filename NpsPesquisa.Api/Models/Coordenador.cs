using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class Coordenador
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório")]
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

        public bool Ativo { get; set; } = true;

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public DateTime? DataAtualizacao { get; set; }

        // Relacionamentos
        public virtual ICollection<CoordenadorCurso> Coordenacoes { get; set; } = new List<CoordenadorCurso>();

        // Propriedades computadas
        [NotMapped]
        public string NomeCompleto => Nome;

        [NotMapped]
        public string TipoDescricao => "Coordenador";

        [NotMapped]
        public string InformacaoEspecifica => !string.IsNullOrEmpty(Departamento) ? Departamento : "Sem departamento";
    }
}
