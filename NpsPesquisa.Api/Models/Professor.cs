using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class Professor
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Departamento { get; set; }

        [StringLength(100)]
        public string? Titulacao { get; set; }

        [StringLength(20)]
        public string? Telefone { get; set; }

        [StringLength(14)] // CPF
        public string? Cpf { get; set; }

        public DateTime? DataNascimento { get; set; }

        // Novos campos baseados na planilha
        public Sexo? Sexo { get; set; }

        [StringLength(50)]
        public string? Login { get; set; }

        public TipoProfessor? TipoProfessor { get; set; }

        // Campos de Integração com Sistema Externo
        [StringLength(100)]
        public string? IntegracaoId { get; set; } // ID do professor no sistema externo

        [StringLength(100)]
        public string? CursoIntegracaoId { get; set; } // COD_CURSO da planilha

        [StringLength(100)]
        public string? TurmaIntegracaoId { get; set; } // COD_TURMA da planilha

        [StringLength(100)]
        public string? PeriodoLetivoIntegracaoId { get; set; } // PERIODO_LETIVO da planilha

        [StringLength(100)]
        public string? InstituicaoIntegracaoId { get; set; } // COD_FILIAL da planilha

        [StringLength(100)]
        public string? DisciplinaIntegracaoId { get; set; } // COD_DISC da planilha

        public bool Ativo { get; set; } = true;

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public DateTime? DataAtualizacao { get; set; }

        // Relacionamento com Instituição
        public int? InstituicaoId { get; set; }
        public virtual Instituicao? Instituicao { get; set; }

        // Relacionamentos
        public virtual ICollection<TurmaDisciplina> TurmasDisciplinas { get; set; } = new List<TurmaDisciplina>();

        public virtual ICollection<Disciplina> Disciplinas { get; set; } = new List<Disciplina>();

        // Propriedades computadas
        [NotMapped]
        public string NomeCompleto => Nome;

        [NotMapped]
        public string InformacaoCompleta => $"{Nome} - {Departamento ?? "Departamento não informado"}";

        [NotMapped]
        public string InformacaoCompletaComIntegracao => $"{Nome} ({Login ?? "Sem login"}) - {Departamento ?? "Departamento não informado"} - Integração: {IntegracaoId}";
    }

    public enum TipoProfessor
    {
        Tutor = 1,
        Titular = 2,
        Coordenador = 3
    }
}
