using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NpsPesquisa.Api.Models
{
    public class Questionario
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O título é obrigatório")]
        [StringLength(200, ErrorMessage = "O título deve ter no máximo 200 caracteres")]
        public string Titulo { get; set; }

        [StringLength(1000, ErrorMessage = "A descrição deve ter no máximo 1000 caracteres")]
        public string Descricao { get; set; }

        [Required(ErrorMessage = "A data de criação é obrigatória")]
        public DateTime DataCriacao { get; set; }

        [Required(ErrorMessage = "A data de expiração é obrigatória")]
        public DateTime DataExpiracao { get; set; }

        [Required]
        public bool OrdemAleatoria { get; set; }

        public DateTime DataInicio { get; set; }
        public DateTime DataFim { get; set; }

        [JsonIgnore]
        public virtual ICollection<ParticipanteQuestionario>? Participantes { get; set; }

        public virtual ICollection<QuestaoQuestionario>? QuestoesQuestionarios { get; set; }

        [NotMapped]
        public ICollection<Questao>? Questoes { get; set; }

        public virtual ICollection<Resposta>? Respostas { get; set; }
    }
} 