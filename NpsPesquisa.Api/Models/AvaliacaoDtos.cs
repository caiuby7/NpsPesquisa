using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class CriarAvaliacaoRequest
    {
        [Required(ErrorMessage = "O título é obrigatório")]
        [StringLength(200, ErrorMessage = "O título deve ter no máximo 200 caracteres")]
        public string Titulo { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "A descrição deve ter no máximo 1000 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "A data de início é obrigatória")]
        public DateTime DataInicio { get; set; }

        [Required(ErrorMessage = "A data de fim é obrigatória")]
        public DateTime DataFim { get; set; }

        [Required(ErrorMessage = "O item avaliado é obrigatório")]
        public TipoItemAvaliado ItemAvaliado { get; set; }

        [StringLength(200, ErrorMessage = "O nome do item específico deve ter no máximo 200 caracteres")]
        public string? NomeItemEspecifico { get; set; }

        [StringLength(500, ErrorMessage = "A descrição do item deve ter no máximo 500 caracteres")]
        public string? DescricaoItem { get; set; }

        // Filtros condicionais baseados no ItemAvaliado
        public int? InstituicaoId { get; set; }
        public int? PeriodoLetivoId { get; set; }
        public int? CursoId { get; set; }
        public int? TurmaId { get; set; }
        public int? DisciplinaId { get; set; }
        public int? ProfessorId { get; set; }
        public int? TurmaDisciplinaId { get; set; }
        public int? CoordenadorId { get; set; }

        // Para avaliações de Estrutura
        public TipoParticipante? TipoParticipante { get; set; }
    }

    public class CriarAvaliacaoResponse
    {
        public int QuestionarioId { get; set; }
        public int ItemAvaliadoId { get; set; }
        public int ParticipantesMapeados { get; set; }
        public string Mensagem { get; set; } = string.Empty;
    }

    public class FiltrosAvaliacaoResponse
    {
        public TipoItemAvaliado TipoItemAvaliado { get; set; }
        public List<string> FiltrosDisponiveis { get; set; } = new List<string>();
        
        // Dados para os filtros
        public List<dynamic> Instituicoes { get; set; } = new List<dynamic>();
        public List<dynamic> PeriodosLetivos { get; set; } = new List<dynamic>();
        public List<dynamic> Cursos { get; set; } = new List<dynamic>();
        public List<dynamic> Turmas { get; set; } = new List<dynamic>();
        public List<dynamic> Disciplinas { get; set; } = new List<dynamic>();
        public List<dynamic> Professores { get; set; } = new List<dynamic>();
        public List<dynamic> Coordenadores { get; set; } = new List<dynamic>();
    }

    public class FiltrosParticipantesRequest
    {
        [Required(ErrorMessage = "O tipo de item avaliado é obrigatório")]
        public TipoItemAvaliado TipoItemAvaliado { get; set; }

        // Filtros para busca de participantes
        public int? InstituicaoId { get; set; }
        public int? PeriodoLetivoId { get; set; }
        public int? CursoId { get; set; }
        public int? TurmaId { get; set; }
        public int? DisciplinaId { get; set; }
        public int? ProfessorId { get; set; }
        public int? TurmaDisciplinaId { get; set; }
        public int? CoordenadorId { get; set; }

        // Para avaliações de Estrutura
        public TipoParticipante? TipoParticipante { get; set; }
    }

    public class ParticipantesFiltradosResponse
    {
        public List<Participante> Participantes { get; set; } = new List<Participante>();
        public int Total { get; set; }
    }

    public class AvaliacaoResumo
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public DateTime DataInicio { get; set; }
        public DateTime DataFim { get; set; }
        public TipoItemAvaliado TipoItemAvaliado { get; set; }
        public string NomeItemEspecifico { get; set; } = string.Empty;
        public int TotalParticipantes { get; set; }
        public int TotalRespostas { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
    }
}
