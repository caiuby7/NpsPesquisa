using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NpsPesquisa.Api.Models
{
    public class QuestaoQuestionario
    {
        public int Id { get; set; }
        public int QuestaoId { get; set; }
        public int QuestionarioId { get; set; }

        [Required]
        public int Ordem { get; set; }

        [JsonIgnore]
        public virtual Questao? Questao { get; set; }
        [JsonIgnore]
        public virtual Questionario? Questionario { get; set; }
    }
} 