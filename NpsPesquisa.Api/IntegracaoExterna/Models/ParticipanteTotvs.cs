using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.IntegracaoExterna.Models
{
    /// <summary>
    /// Modelo unificado para participantes do TOTVS (Alunos e Professores)
    /// </summary>
    public class ParticipanteTotvs
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public TipoParticipante Tipo { get; set; }
        
        // Campos específicos para Aluno
        public string? RA { get; set; }
        public int? CursoId { get; set; }
        public string? CursoNome { get; set; }
        public int? InstituicaoId { get; set; }
        public string? InstituicaoNome { get; set; }
        public int? PeriodoLetivoId { get; set; }
        public string? PeriodoLetivoNome { get; set; }
        
        // Campos específicos para Professor
        public string? Login { get; set; }
        public string? Departamento { get; set; }
        public string? Titulacao { get; set; }
        
        // Campos de contexto da disciplina/turma
        public int? TurmaId { get; set; }
        public string? TurmaNome { get; set; }
        public int? DisciplinaId { get; set; }
        public string? DisciplinaNome { get; set; }
        public int? TurmaDisciplinaId { get; set; }
        public int? ProfessorId { get; set; }
        public string? ProfessorNome { get; set; }
        
        // Tipo de item avaliado identificado
        public string? TipoItemAvaliado { get; set; }
    }
}
