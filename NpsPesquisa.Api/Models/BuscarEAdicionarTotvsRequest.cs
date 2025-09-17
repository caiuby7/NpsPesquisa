using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Models
{
    public class BuscarEAdicionarTotvsRequest
    {
        public int QuestionarioId { get; set; }
        public string? PeriodoLetivo { get; set; }
        public int? CursoId { get; set; }
        public int? TurmaId { get; set; }
        public int? DisciplinaId { get; set; }
        public int? ProfessorId { get; set; }
        public int? InstituicaoId { get; set; }
        public int? PeriodoLetivoId { get; set; }
        public TipoParticipante? TipoParticipante { get; set; }
        public string? NomeItemEspecifico { get; set; }
        public int? ItemAvaliadoId { get; set; }
    }
}
