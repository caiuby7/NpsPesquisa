using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class ConviteQuestionario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int QuestionarioId { get; set; }

        [Required]
        public int ParticipanteId { get; set; }

        [Required]
        public string Chave { get; set; } = string.Empty;

        [Required]
        public DateTime DataEnvio { get; set; }

        public DateTime? DataResposta { get; set; }

        public bool Respondido { get; set; }

        public DateTime? DataUltimoLembrete { get; set; }

        [ForeignKey("QuestionarioId")]
        public virtual Questionario Questionario { get; set; } = null!;

        [ForeignKey("ParticipanteId")]
        public virtual Participante Participante { get; set; } = null!;

        // Propriedade Aluno para compatibilidade (através do Participante)
        [NotMapped]
        public Aluno? Aluno => Participante?.Aluno;

        // Propriedade AlunoId para compatibilidade
        [NotMapped]
        public int? AlunoId => Participante?.AlunoId;
    }
} 