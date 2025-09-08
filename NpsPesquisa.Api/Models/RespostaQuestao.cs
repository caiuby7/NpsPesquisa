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

        [ForeignKey("RespostaId")]
        public virtual Resposta Resposta { get; set; } = null!;

        [ForeignKey("QuestaoId")]
        public virtual Questao Questao { get; set; } = null!;

        [ForeignKey("OpcaoId")]
        public virtual OpcaoQuestao? Opcao { get; set; }
    }
} 