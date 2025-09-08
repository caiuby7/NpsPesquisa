using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Models
{
    public class Questionario
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

        [JsonIgnore]
        public virtual ICollection<ParticipanteQuestionario>? Participantes { get; set; }

        public virtual ICollection<QuestaoQuestionario>? QuestoesQuestionarios { get; set; }

        [NotMapped]
        public ICollection<Questao>? Questoes { get; set; }

        public virtual ICollection<Resposta>? Respostas { get; set; }

        public string? TextoBoasVindas { get; set; }
        public string? TemplateEmailConvite { get; set; }
        public string? TemplateEmailLembrete { get; set; }

        public int? LembrarACadaXDias { get; set; }

        public bool EnviarLembreteAutomatico { get; set; }

        public bool EnviarLembreteParaTodos { get; set; }

        [Required]
        public TipoQuestionario Tipo { get; set; } = TipoQuestionario.NPS; // Default para manter compatibilidade

        public bool PermitirComentarios { get; set; } = false; // Habilita comentários adicionais nas questões

        public bool PermitirSalvarAndamento { get; set; } = false; // Permite salvar respostas parcialmente

        // Campos para Avaliação Institucional
        public TipoItemAvaliado? TipoItemAvaliado { get; set; } // Nullable para manter compatibilidade com NPS
        
        // Lista de itens específicos a serem avaliados
        public virtual ICollection<ItemAvaliadoQuestionario>? ItensAvaliados { get; set; } = new List<ItemAvaliadoQuestionario>();

        // Campos mantidos para compatibilidade (deprecated)
        [StringLength(200)]
        public string? NomeItemEspecifico { get; set; } // Ex: "Direito", "Turma A", "Matemática"

        // Propriedade ItemAvaliadoId para compatibilidade
        [NotMapped]
        public int? ItemAvaliadoId => null; // Não usado mais, mas mantido para compatibilidade

        public bool Ativo { get; set; }
    }
} 