using System.Text.Json.Serialization;

namespace NpsPesquisa.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TipoItemAvaliado
    {
        // Avaliações de Alunos
        Professor,       // Aluno avalia professor específico (via TurmaDisciplina)
        Disciplina,      // Aluno avalia disciplina específica
        TurmaDisciplina, // Aluno avalia professor+disciplina+turma (contexto completo)
        Curso,           // Aluno avalia curso (coordenador)
        Estrutura,       // Aluno avalia infraestrutura da instituição
        
        // Avaliações de Professores  
        Coordenador,     // Professor avalia coordenador do curso
        Alunos,          // Professor avalia alunos da turma
        Turma,           // Professor avalia turma como um todo
        
        // Avaliações Gerais
        Infraestrutura   // Avaliação geral de infraestrutura
    }
}
