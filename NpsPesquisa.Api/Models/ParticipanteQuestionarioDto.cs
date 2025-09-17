using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class ParticipanteQuestionarioDto
    {
        [Required]
        public int QuestionarioId { get; set; }

        [Required]
        public int ParticipanteId { get; set; }

        // Campos de contexto opcionais
        public int? CursoId { get; set; }
        public int? TurmaId { get; set; }
        public int? DisciplinaId { get; set; }
        public int? ProfessorId { get; set; }
        public int? InstituicaoId { get; set; }
        public int? PeriodoLetivoId { get; set; }

        // Campos para identificar o item específico avaliado
        public TipoItemAvaliado? TipoItemAvaliado { get; set; }
        public string? NomeItemEspecifico { get; set; }
        public int? ItemAvaliadoId { get; set; }
    }

    public class AdicionarParticipantesComContextoDto
    {
        [Required]
        public int QuestionarioId { get; set; }

        [Required]
        public List<int> ParticipanteIds { get; set; } = new List<int>();

        // Contexto de filtros aplicados
        public int? CursoId { get; set; }
        public int? TurmaId { get; set; }
        public int? DisciplinaId { get; set; }
        public int? ProfessorId { get; set; }
        public int? InstituicaoId { get; set; }
        public int? PeriodoLetivoId { get; set; }

        // Item específico sendo avaliado
        public TipoItemAvaliado? TipoItemAvaliado { get; set; }
        public string? NomeItemEspecifico { get; set; }
        public int? ItemAvaliadoId { get; set; }
    }
}
