using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class Instituicao
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome da instituição é obrigatório")]
        [StringLength(200, ErrorMessage = "O nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "A descrição deve ter no máximo 1000 caracteres")]
        public string? Descricao { get; set; }

        [Required(ErrorMessage = "O ID de integração é obrigatório")]
        public int IntegracaoId { get; set; }

        public bool Ativo { get; set; } = true;

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public DateTime? DataAtualizacao { get; set; }

        // Propriedades computadas
        [NotMapped]
        public string NomeCompleto => Nome;

        // Relacionamentos
        public virtual ICollection<Curso> Cursos { get; set; } = new List<Curso>();
        public virtual ICollection<Disciplina> Disciplinas { get; set; } = new List<Disciplina>();
    }
}