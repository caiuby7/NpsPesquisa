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
        public int AlunoId { get; set; }

        [Required]
        public string Chave { get; set; }

        [Required]
        public DateTime DataEnvio { get; set; }

        public DateTime? DataResposta { get; set; }

        public bool Respondido { get; set; }

        public DateTime? DataUltimoLembrete { get; set; }

        [ForeignKey("QuestionarioId")]
        public Questionario Questionario { get; set; }

        [ForeignKey("AlunoId")]
        public Aluno Aluno { get; set; }
    }
} 