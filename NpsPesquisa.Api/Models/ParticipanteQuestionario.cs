using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class ParticipanteQuestionario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int QuestionarioId { get; set; }

        [Required]
        public int ParticipanteId { get; set; }

        [ForeignKey("QuestionarioId")]
        public virtual Questionario Questionario { get; set; } = null!;

        [ForeignKey("ParticipanteId")]
        public virtual Participante Participante { get; set; } = null!;

        public DateTime DataConvite { get; set; } = DateTime.UtcNow!;
        public DateTime? DataResposta { get; set; } 

        public string Status { get; set; }
    }
} 