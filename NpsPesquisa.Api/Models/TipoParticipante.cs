using System.Text.Json.Serialization;

namespace NpsPesquisa.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TipoParticipante
    {
        Aluno,
        Professor,
        Funcionario,
        Coordenador
    }
}
