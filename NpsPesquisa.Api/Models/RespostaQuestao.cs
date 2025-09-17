using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class RespostaQuestao
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int RespostaId { get; set; }

        [Required]
        public int QuestaoId { get; set; }

        public string? Valor { get; set; }

        public string? Texto { get; set; }

        public int? OpcaoId { get; set; }

        public int? ItemAvaliadoId { get; set; }  // ID do item específico sendo avaliado

        // Campos desnormalizados para performance
        public int? CursoId { get; set; }
        public int? TurmaId { get; set; }
        public int? DisciplinaId { get; set; }
        public int? ProfessorId { get; set; }
        public int? InstituicaoId { get; set; }

        [ForeignKey("RespostaId")]
        public virtual Resposta Resposta { get; set; } = null!;

        [ForeignKey("QuestaoId")]
        public virtual Questao Questao { get; set; } = null!;

        [ForeignKey("OpcaoId")]
        public virtual OpcaoQuestao? Opcao { get; set; }

        // Navegação para os campos desnormalizados
        public virtual Curso? Curso { get; set; }
        public virtual Turma? Turma { get; set; }
        public virtual Disciplina? Disciplina { get; set; }
        public virtual Professor? Professor { get; set; }
        public virtual Instituicao? Instituicao { get; set; }
    }
} 