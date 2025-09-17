using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class RespostaDto
    {
        public int QuestionarioId { get; set; }
        public int ParticipanteId { get; set; }
        public List<RespostaQuestaoDto> RespostasQuestoes { get; set; } = new List<RespostaQuestaoDto>();

        // Campos para identificar o item específico sendo avaliado
        public TipoItemAvaliado? TipoItemAvaliado { get; set; }
        
        [StringLength(200)]
        public string? NomeItemEspecifico { get; set; }
        
        public int? ItemAvaliadoId { get; set; }

        // Campo removido - não faz mais sentido aqui
        // [Required(ErrorMessage = "O ID da questão é obrigatório")]
        // public int QuestaoId { get; set; }
    }

    public class RespostaQuestaoDto
    {
        public int QuestaoId { get; set; }
        public int? OpcaoId { get; set; }  // ID da opção selecionada para questões de múltipla escolha e matriz
        public int? ItemAvaliadoId { get; set; }  // ID do item específico sendo avaliado (disciplina, turma, etc.)
        public string? Valor { get; set; }  // Valor para questões de texto livre ou escala linear
    }
} 