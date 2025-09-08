using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class Participante
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public TipoParticipante Tipo { get; set; }

        public bool Ativo { get; set; } = true;

        // Campos específicos para Alunos
        public int? CursoId { get; set; }
        public virtual Curso? Curso { get; set; }

        [StringLength(50)]
        public string? Matricula { get; set; }

        public string? Semestre { get; set; }

        // Campos específicos para Professores
        [StringLength(100)]
        public string? Departamento { get; set; }

        [StringLength(100)]
        public string? Titulacao { get; set; }

        // Campos específicos para Funcionários
        [StringLength(100)]
        public string? Setor { get; set; }

        [StringLength(100)]
        public string? Cargo { get; set; }

        // Campos adicionais úteis para todos
        [StringLength(20)]
        public string? Telefone { get; set; }

        [StringLength(14)] // CPF
        public string? Cpf { get; set; }

        public DateTime? DataNascimento { get; set; }

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public DateTime? DataAtualizacao { get; set; }

        // Relacionamentos
        public virtual ICollection<ParticipanteQuestionario> Participacoes { get; set; } = new List<ParticipanteQuestionario>();
        
        public virtual ICollection<Resposta> Respostas { get; set; } = new List<Resposta>();
        
        // Relacionamentos com entidades específicas baseado no Tipo
        public int? AlunoId { get; set; }
        public virtual Aluno? Aluno { get; set; }
        
        public int? ProfessorId { get; set; }
        public virtual Professor? Professor { get; set; }
        
        public int? CoordenadorId { get; set; }
        public virtual Coordenador? Coordenador { get; set; }

        // Propriedades computadas para facilitar relatórios
        [NotMapped]
        public string NomeCompleto => Nome;

        [NotMapped]
        public string TipoDescricao => Tipo switch
        {
            TipoParticipante.Aluno => "Aluno",
            TipoParticipante.Professor => "Professor",
            TipoParticipante.Funcionario => "Funcionário",
            TipoParticipante.Coordenador => "Coordenador",
            _ => "Desconhecido"
        };

        [NotMapped]
        public string InformacaoEspecifica => Tipo switch
        {
            TipoParticipante.Aluno => Curso?.Nome ?? "Curso não informado",
            TipoParticipante.Professor => Departamento ?? "Departamento não informado",
            TipoParticipante.Funcionario => $"{Setor} - {Cargo}".Trim(' ', '-'),
            TipoParticipante.Coordenador => Coordenador?.Nome ?? Departamento ?? "Departamento não informado",
            _ => string.Empty
        };
    }
}
