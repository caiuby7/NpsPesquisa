using System.Text.Json.Serialization;

namespace NpsPesquisa.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TipoQuestionario
    {
        NPS,                    // Pesquisas de satisfação (atual)
        AvaliacaoInstitucional  // Avaliações acadêmicas (novo)
    }
}
