using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    /// <summary>
    /// Representa um item específico a ser avaliado em um questionário
    /// Ex: Para um questionário de avaliação de disciplinas, pode ter itens como "Matemática", "Física", "História"
    /// </summary>
    public class ItemAvaliadoQuestionario
    {
        public int Id { get; set; }

        [Required]
        public int QuestionarioId { get; set; }
        public virtual Questionario Questionario { get; set; }

        [Required]
        public TipoItemAvaliado TipoItemAvaliado { get; set; }

        [Required]
        [StringLength(200)]
        public string NomeItemEspecifico { get; set; } = string.Empty;

        [StringLength(500)]
        public string? DescricaoItem { get; set; }

        /// <summary>
        /// ID do item no sistema (ex: ID da disciplina, ID da turma, etc.)
        /// Pode ser null para itens genéricos como "Estrutura" ou "Infraestrutura"
        /// </summary>
        public int? ItemAvaliadoId { get; set; }

        /// <summary>
        /// ID específico baseado no tipo de item avaliado
        /// </summary>
        public int? ProfessorId { get; set; }        // Para TipoItemAvaliado.Professor
        public int? DisciplinaId { get; set; }      // Para TipoItemAvaliado.Disciplina
        public int? TurmaDisciplinaId { get; set; } // Para TipoItemAvaliado.TurmaDisciplina
        public int? CursoId { get; set; }           // Para TipoItemAvaliado.Curso
        public int? TurmaId { get; set; }           // Para TipoItemAvaliado.Turma
        public int? CoordenadorId { get; set; }     // Para TipoItemAvaliado.Coordenador

        /// <summary>
        /// Relacionamentos virtuais para facilitar consultas
        /// </summary>
        public virtual Professor? Professor { get; set; }
        public virtual Disciplina? Disciplina { get; set; }
        public virtual TurmaDisciplina? TurmaDisciplina { get; set; }
        public virtual Curso? Curso { get; set; }
        public virtual Turma? Turma { get; set; }
        public virtual Coordenador? Coordenador { get; set; }

        /// <summary>
        /// Ordem de apresentação do item no questionário
        /// </summary>
        public int OrdemApresentacao { get; set; } = 0;

        /// <summary>
        /// Indica se o item está ativo para avaliação
        /// </summary>
        public bool Ativo { get; set; } = true;

        /// <summary>
        /// Data de criação do item
        /// </summary>
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Data da última atualização
        /// </summary>
        public DateTime? DataAtualizacao { get; set; }

        /// <summary>
        /// Comentários ou observações sobre o item
        /// </summary>
        [StringLength(1000)]
        public string? Observacoes { get; set; }
    }
}
