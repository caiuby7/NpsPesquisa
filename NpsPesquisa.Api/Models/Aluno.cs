using System.Text.Json.Serialization;

namespace NpsPesquisa.Api.Models
{
    public class Aluno
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public bool AceitaContato { get; set; }
        public int CursoId { get; set; }
        public virtual Curso? Curso { get; set; }
        public virtual ICollection<Resposta> Respostas { get; set; }
    }
} 