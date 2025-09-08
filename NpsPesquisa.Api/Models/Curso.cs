using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class Curso
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do curso é obrigatório")]
        [StringLength(200, ErrorMessage = "O nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "A descrição deve ter no máximo 1000 caracteres")]
        public string? Descricao { get; set; }

        [Required(ErrorMessage = "O código do curso é obrigatório")]
        [StringLength(20, ErrorMessage = "O código deve ter no máximo 20 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "A modalidade é obrigatória")]
        public Modalidade Modalidade { get; set; }

        [Required(ErrorMessage = "O tipo de curso é obrigatório")]
        public TipoCurso TipoCurso { get; set; }

        [StringLength(100, ErrorMessage = "O ID de integração deve ter no máximo 100 caracteres")]
        public string? IntegracaoId { get; set; }

        [StringLength(100, ErrorMessage = "O código da filial deve ter no máximo 100 caracteres")]
        public string? CodigoFilial { get; set; }

        public bool Ativo { get; set; } = true;

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public DateTime? DataAtualizacao { get; set; }

        // Relacionamentos
        public int? InstituicaoId { get; set; }
        public virtual Instituicao? Instituicao { get; set; }

        public virtual ICollection<Aluno> Alunos { get; set; } = new List<Aluno>();

        public virtual ICollection<Turma> Turmas { get; set; } = new List<Turma>();

        public virtual ICollection<CoordenadorCurso> Coordenacoes { get; set; } = new List<CoordenadorCurso>();

        public virtual ICollection<Disciplina> Disciplinas { get; set; } = new List<Disciplina>();

        // Propriedades computadas
        [NotMapped]
        public string NomeCompleto => !string.IsNullOrEmpty(Codigo) ? $"{Codigo} - {Nome}" : Nome;

        [NotMapped]
        public string ModalidadeLabel => Modalidade switch
        {
            Modalidade.PRESENCIAL => "Presencial",
            Modalidade.EAD => "EAD",
            _ => Modalidade.ToString()
        };

        [NotMapped]
        public string TipoCursoLabel => TipoCurso switch
        {
            TipoCurso.GRADUACAO => "Graduação",
            TipoCurso.POSGRADUACAO => "Pós-Graduação",
            _ => TipoCurso.ToString()
        };
    }

    public enum Modalidade
    {
        PRESENCIAL,
        EAD
    }

    public enum TipoCurso
    {
        GRADUACAO,
        POSGRADUACAO
    }
}
