using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NpsPesquisa.Api.Models
{
    public class Questao
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O campo Texto é obrigatório")]
        public string Texto { get; set; } = string.Empty;

        [Required(ErrorMessage = "O campo Tipo é obrigatório")]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TipoQuestao Tipo { get; set; }

        public int Ordem { get; set; }

        public bool Obrigatorio { get; set; } = true;

        public bool IsCondicional { get; set; } = false;

        [JsonIgnore]
        public virtual ICollection<QuestaoQuestionario>? QuestoesQuestionarios { get; set; }

        public virtual ICollection<OpcaoQuestao>? Opcoes { get; set; }

        [NotMapped]
        public ICollection<OpcaoQuestao>? Colunas { get; set; }
    }
} 