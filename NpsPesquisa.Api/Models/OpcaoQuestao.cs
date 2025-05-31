using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NpsPesquisa.Api.Models
{
    public class OpcaoQuestao
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int QuestaoId { get; set; }

        [Required]
        public string Texto { get; set; }

        //[Required]
        public string? Valor { get; set; }

        //[Required]
        public int Ordem { get; set; }

        //[Required]
        public int Peso { get; set; }

        public bool EhColuna { get; set; }

        [JsonIgnore]
        [ForeignKey("QuestaoId")]
        public Questao Questao { get; set; }
    }
} 