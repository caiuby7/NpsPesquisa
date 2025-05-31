using System.Text.Json.Serialization;

namespace NpsPesquisa.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TipoQuestao
    {
        MultiplaEscolha,
        CaixaTexto,
        EscalaLinear,
        MenuSuspenso,
        Matriz
    }
} 