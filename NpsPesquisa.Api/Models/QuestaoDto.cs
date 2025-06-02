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

        public List<OpcaoQuestaoDto>? Opcoes { get; set; }

        public List<OpcaoQuestaoDto>? Colunas { get; set; }
    }

    public class OpcaoQuestaoDto
    {
        [Required]
        public string Texto { get; set; } = string.Empty;

        public string Valor { get; set; } = string.Empty;

        public int Ordem { get; set; }

        public int Peso { get; set; }

        public bool EhColuna { get; set; } = false;
    }

    public class QuestaoResponseDto
    {
        public int Id { get; set; }
        public string Texto { get; set; } = string.Empty;
        public TipoQuestao Tipo { get; set; }
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
    }
} 