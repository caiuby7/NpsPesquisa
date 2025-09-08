using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Models
{
    public class QuestionarioDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O título é obrigatório")]
        [StringLength(200, ErrorMessage = "O título deve ter no máximo 200 caracteres")]
        public string Titulo { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "A descrição deve ter no máximo 1000 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "A data de criação é obrigatória")]
        public DateTime DataCriacao { get; set; }

        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }

        public string? TextoBoasVindas { get; set; }
        public string? TemplateEmailConvite { get; set; }
        public string? TemplateEmailLembrete { get; set; }

        public int? LembrarACadaXDias { get; set; }

        public bool EnviarLembreteAutomatico { get; set; }

        public bool EnviarLembreteParaTodos { get; set; }

        [Required]
        public TipoQuestionario Tipo { get; set; } = TipoQuestionario.NPS;

        public bool PermitirComentarios { get; set; } = false;

        public bool PermitirSalvarAndamento { get; set; } = false;

        // Campos para Avaliação Institucional
        public TipoItemAvaliado? TipoItemAvaliado { get; set; }

        // Lista de itens específicos a serem avaliados
        public List<ItemAvaliadoDto>? ItensAvaliados { get; set; } = new List<ItemAvaliadoDto>();

        // Lista de questões do questionário
        public List<QuestaoQuestionarioDto>? Questoes { get; set; } = new List<QuestaoQuestionarioDto>();

        // Campos mantidos para compatibilidade (deprecated)
        public string? NomeItemEspecifico { get; set; }
    }

    /// <summary>
    /// DTO para representar um item específico a ser avaliado
    /// </summary>
    public class ItemAvaliadoDto
    {
        public int Id { get; set; }

        [Required]
        public TipoItemAvaliado TipoItemAvaliado { get; set; }

        [Required]
        [StringLength(200)]
        public string NomeItemEspecifico { get; set; } = string.Empty;

        [StringLength(500)]
        public string? DescricaoItem { get; set; }

        /// <summary>
        /// ID do item no sistema (ex: ID da disciplina, ID da turma, etc.)
        /// Pode ser null para itens genéricos como "Estrutura" ou "Infraestrutura"
        /// </summary>
        public int? ItemAvaliadoId { get; set; }

        /// <summary>
        /// Ordem de apresentação do item no questionário
        /// </summary>
        public int OrdemApresentacao { get; set; } = 0;

        /// <summary>
        /// Indica se o item está ativo para avaliação
        /// </summary>
        public bool Ativo { get; set; } = true;

        /// <summary>
        /// Comentários ou observações sobre o item
        /// </summary>
        [StringLength(1000)]
        public string? Observacoes { get; set; }
    }
} 