using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class Resposta
    {
        public int Id { get; set; }
        public int QuestionarioId { get; set; }
        public virtual Questionario Questionario { get; set; } = null!;
        public int ParticipanteId { get; set; }
        public virtual Participante Participante { get; set; } = null!;
        public DateTime DataResposta { get; set; }
        public virtual List<RespostaQuestao> RespostasQuestoes { get; set; } = new List<RespostaQuestao>();

        // Campos para identificar o item específico avaliado
        public TipoItemAvaliado? TipoItemAvaliado { get; set; }
        
        [StringLength(200)]
        public string? NomeItemEspecifico { get; set; }
        
        public int? ItemAvaliadoId { get; set; }

        // Propriedade Aluno para compatibilidade (através do Participante)
        [NotMapped]
        public Aluno? Aluno => Participante?.Aluno;

        // Propriedade AlunoId para compatibilidade (através do Participante)
        [NotMapped]
        public int? AlunoId => Participante?.AlunoId;
    }
} 