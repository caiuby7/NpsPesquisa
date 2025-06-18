using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class QuestaoDto
    {
        [Required(ErrorMessage = "O ID da questão é obrigatório")]
        public int QuestaoId { get; set; }

        [Required(ErrorMessage = "A ordem da questão é obrigatória")]
        public int Ordem { get; set; }
    }

    public class QuestionarioDto
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
        public DateTime? DataExpiracao { get; set; }

        [Required]
        public bool OrdemAleatoria { get; set; }

        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }

        [Required(ErrorMessage = "A lista de questões é obrigatória")]
        public List<QuestaoDto> Questoes { get; set; }

        public List<int>? ParticipantesIds { get; set; }

        public string? TemplateEmailConvite { get; set; }
        public string? TemplateEmailLembrete { get; set; }
        public bool EnviarLembreteAutomatico { get; set; }
        public int? LembrarACadaXDias { get; set; }
        public bool EnviarLembreteParaTodos { get; set; }
    }
} 