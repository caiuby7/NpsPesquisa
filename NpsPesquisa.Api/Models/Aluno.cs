using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NpsPesquisa.Api.Models
{
    public class Aluno
    {
        public int AlunoId { get; set; }

        // Propriedade Id para compatibilidade
        [NotMapped]
        public int Id => AlunoId;

        // Dados Pessoais
        [Required]
        [StringLength(200)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Matricula { get; set; } = string.Empty;

        [StringLength(14)]
        public string? Cpf { get; set; }

        public DateTime? DataNascimento { get; set; }

        public Sexo? Sexo { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        [EmailAddress]
        [StringLength(200)]
        public string? EmailPessoal { get; set; }

        [StringLength(20)]
        public string? Telefone { get; set; }

        // Dados Acadêmicos
        [Required]
        public int CursoId { get; set; }
        public virtual Curso Curso { get; set; }

        public int? TurmaId { get; set; }
        public virtual Turma? Turma { get; set; }

        [Required]
        public int PeriodoLetivoId { get; set; }
        public virtual PeriodoLetivo PeriodoLetivo { get; set; }

        [Required]
        public int InstituicaoId { get; set; }
        public virtual Instituicao Instituicao { get; set; }

        // Relacionamento N:N com TurmaDisciplina (um aluno pode estar em várias)
        public virtual ICollection<TurmaDisciplina> TurmasDisciplinas { get; set; } = new List<TurmaDisciplina>();

        public Turno? Turno { get; set; }

        public int? Fase { get; set; }

        [StringLength(100)]
        public string? Grade { get; set; }

        [StringLength(100)]
        public string? Habilitacao { get; set; }

        public DateTime? DataIngressoCurso { get; set; }

        public TipoMatricula? TipoMatricula { get; set; }

        public DateTime? DataMatricula { get; set; }

        [StringLength(100)]
        public string? StatusNoPeriodoLetivo { get; set; }

        public bool TurmaAtiva { get; set; } = true;

        public bool AceitaContato { get; set; } = true;

        public bool Ativo { get; set; } = true;

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public DateTime? DataAtualizacao { get; set; }

        // Campos de Integração com Sistema Externo
        [StringLength(100)]
        public string? IntegracaoId { get; set; } // CODIGO_PESSOA da planilha

        [StringLength(100)]
        public string? CursoIntegracaoId { get; set; } // COD_CURSO_DO_ALUNO da planilha

        [StringLength(100)]
        public string? TurmaIntegracaoId { get; set; } // CODTURMA da planilha

        [StringLength(100)]
        public string? PeriodoLetivoIntegracaoId { get; set; } // PERIODO_LETIVO da planilha

        [StringLength(100)]
        public string? InstituicaoIntegracaoId { get; set; } // CODFILIAL da planilha

        // Relacionamentos
        public virtual ICollection<Resposta> Respostas { get; set; } = new List<Resposta>();

        // Propriedades computadas
        [NotMapped]
        public string NomeCompleto => Nome;

        [NotMapped]
        public string InformacaoCompleta => $"{Nome} - {Curso?.Nome} - {Turma?.Nome ?? "Sem turma"}";

        [NotMapped]
        public string InformacaoCompletaComIntegracao => $"{Nome} (RA: {Matricula}) - {Curso?.Nome} - {Turma?.Nome ?? "Sem turma"} - Integração: {IntegracaoId}";

        [NotMapped]
        public string ProfessoresAtivos => string.Join(", ", TurmasDisciplinas
            .Where(td => td.Ativo)
            .Select(td => td.Professor?.Nome)
            .Distinct()
            .Where(n => !string.IsNullOrEmpty(n)));

        [NotMapped]
        public string DisciplinasAtivas => string.Join(", ", TurmasDisciplinas
            .Where(td => td.Ativo)
            .Select(td => td.Disciplina?.Nome)
            .Distinct()
            .Where(n => !string.IsNullOrEmpty(n)));
    }
} 