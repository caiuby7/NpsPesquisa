using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class ParticipanteQuestionario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int QuestionarioId { get; set; }

        [Required]
        public int ParticipanteId { get; set; }

        [ForeignKey("QuestionarioId")]
        public virtual Questionario Questionario { get; set; } = null!;

        [ForeignKey("ParticipanteId")]
        public virtual Participante Participante { get; set; } = null!;

        public DateTime DataConvite { get; set; } = DateTime.UtcNow!;
        public DateTime? DataResposta { get; set; } 

        public string Status { get; set; } = "Pendente";

        // Campos de contexto para filtros aplicados na criação
        // Estes campos salvam o contexto específico usado para adicionar este participante
        public int? CursoId { get; set; }
        public virtual Curso? Curso { get; set; }

        public int? TurmaId { get; set; }
        public virtual Turma? Turma { get; set; }

        public int? DisciplinaId { get; set; }
        public virtual Disciplina? Disciplina { get; set; }

        public int? ProfessorId { get; set; }
        public virtual Professor? Professor { get; set; }

        public int? InstituicaoId { get; set; }
        public virtual Instituicao? Instituicao { get; set; }

        public int? PeriodoLetivoId { get; set; }
        public virtual PeriodoLetivo? PeriodoLetivo { get; set; }

        // Campos para identificar o item específico avaliado
        public TipoItemAvaliado? TipoItemAvaliado { get; set; }
        
        [StringLength(200)]
        public string? NomeItemEspecifico { get; set; }
        
        public int? ItemAvaliadoId { get; set; }

        // Propriedades computadas para facilitar consultas
        [NotMapped]
        public string ContextoDescricao => ObterContextoDescricao();

        private string ObterContextoDescricao()
        {
            var partes = new List<string>();
            
            if (Curso != null) partes.Add($"Curso: {Curso.Nome}");
            if (Turma != null) partes.Add($"Turma: {Turma.Nome}");
            if (Disciplina != null) partes.Add($"Disciplina: {Disciplina.Nome}");
            if (Professor != null) partes.Add($"Professor: {Professor.Nome}");
            if (Instituicao != null) partes.Add($"Instituição: {Instituicao.Nome}");
            if (PeriodoLetivo != null) partes.Add($"Período: {PeriodoLetivo.Nome}");
            
            return partes.Any() ? string.Join(" | ", partes) : "Contexto não especificado";
        }
    }
} 