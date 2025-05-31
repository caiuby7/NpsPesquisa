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
        public int AlunoId { get; set; }

        [ForeignKey("QuestionarioId")]
        public Questionario Questionario { get; set; }

        [ForeignKey("AlunoId")]
        public Aluno Aluno { get; set; }
    }
} 