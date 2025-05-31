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

        [Required]
        public string Valor { get; set; }

        public string? Texto { get; set; }

        public int? OpcaoId { get; set; }

        [ForeignKey("RespostaId")]
        public Resposta Resposta { get; set; }

        [ForeignKey("QuestaoId")]
        public Questao Questao { get; set; }

        [ForeignKey("OpcaoId")]
        public OpcaoQuestao Opcao { get; set; }
    }
} 