using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class RespostaDto
    {
        public int QuestionarioId { get; set; }
        public int AlunoId { get; set; }
        public List<RespostaQuestaoDto> RespostasQuestoes { get; set; }

        [Required(ErrorMessage = "O ID da questão é obrigatório")]
        public int QuestaoId { get; set; }
    }

    public class RespostaQuestaoDto
    {
        public int QuestaoId { get; set; }
        public int? OpcaoId { get; set; }  // ID da opção selecionada para questões de múltipla escolha e matriz
    }
} 