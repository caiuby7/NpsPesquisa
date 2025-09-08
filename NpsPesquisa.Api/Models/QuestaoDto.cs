using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NpsPesquisa.Api.Models
{
    public class QuestaoPostDto
    {
        [Required]
        public string Texto { get; set; } = string.Empty;

        [Required]
        public TipoQuestao Tipo { get; set; }

        public bool Obrigatorio { get; set; } = true;

        public bool IsCondicional { get; set; } = false;

        public List<OpcaoQuestaoDto>? Opcoes { get; set; }

        public List<OpcaoQuestaoDto>? Colunas { get; set; }
    }

    public class QuestaoQuestionarioDto
    {
        [Required(ErrorMessage = "O ID da questão é obrigatório")]
        public int QuestaoId { get; set; }

        [Required(ErrorMessage = "A ordem da questão é obrigatória")]
        public int Ordem { get; set; }
    }

    public class OpcaoQuestaoDto
    {
        [Required]
        public string Texto { get; set; } = string.Empty;

        public string Valor { get; set; } = string.Empty;

        public int Ordem { get; set; }

        public int Peso { get; set; }

        public bool EhColuna { get; set; } = false;

        public bool AtivaCondicao { get; set; } = false;

        public int? QuestaoCondicionalId { get; set; }
    }

    public class QuestaoResponseDto
    {
        public int Id { get; set; }
        public string Texto { get; set; } = string.Empty;
        public TipoQuestao Tipo { get; set; }
        public bool Obrigatorio { get; set; }
        public bool IsCondicional { get; set; }
        public List<OpcaoQuestaoResponseDto> Opcoes { get; set; } = new();
        public List<OpcaoQuestaoResponseDto> Colunas { get; set; } = new();
    }

    public class OpcaoQuestaoResponseDto
    {
        public int Id { get; set; }
        public string Texto { get; set; } = string.Empty;
        public string Valor { get; set; } = string.Empty;
        public int Ordem { get; set; }
        public int Peso { get; set; }
        public bool EhColuna { get; set; }
        public bool AtivaCondicao { get; set; }
        public int? QuestaoCondicionalId { get; set; }
        public QuestaoResponseDto? QuestaoCondicional { get; set; }
    }
} 