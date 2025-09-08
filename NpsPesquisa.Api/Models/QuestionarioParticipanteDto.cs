using System;
using System.Collections.Generic;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Models
{
    /// <summary>
    /// DTO para apresentar o questionário com seus itens para o participante responder
    /// </summary>
    public class QuestionarioParticipanteDto
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public string? TextoBoasVindas { get; set; }
        public TipoQuestionario Tipo { get; set; }
        public TipoItemAvaliado? TipoItemAvaliado { get; set; }
        public bool PermitirComentarios { get; set; }
        public bool PermitirSalvarAndamento { get; set; }
        
        // Lista de itens a serem avaliados
        public List<ItemAvaliadoApresentacaoDto> ItensAvaliados { get; set; } = new List<ItemAvaliadoApresentacaoDto>();
        
        // Questões do questionário
        public List<QuestaoApresentacaoDto> Questoes { get; set; } = new List<QuestaoApresentacaoDto>();
    }

    /// <summary>
    /// DTO para apresentar um item específico a ser avaliado
    /// </summary>
    public class ItemAvaliadoApresentacaoDto
    {
        public int Id { get; set; }
        public TipoItemAvaliado TipoItemAvaliado { get; set; }
        public string NomeItemEspecifico { get; set; } = string.Empty;
        public string? DescricaoItem { get; set; }
        public int OrdemApresentacao { get; set; }
        public int? ItemAvaliadoId { get; set; }
    }

    /// <summary>
    /// DTO para apresentar uma questão para o participante
    /// </summary>
    public class QuestaoApresentacaoDto
    {
        public int Id { get; set; }
        public string Texto { get; set; } = string.Empty;
        public TipoQuestao Tipo { get; set; }
        public bool Obrigatorio { get; set; }
        public int Ordem { get; set; }
        public List<OpcaoApresentacaoDto> Opcoes { get; set; } = new List<OpcaoApresentacaoDto>();
    }

    /// <summary>
    /// DTO para apresentar uma opção de resposta
    /// </summary>
    public class OpcaoApresentacaoDto
    {
        public int Id { get; set; }
        public string Texto { get; set; } = string.Empty;
        public string? Valor { get; set; }
        public int Ordem { get; set; }
    }
}
