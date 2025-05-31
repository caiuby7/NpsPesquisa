namespace NpsPesquisa.Api.Models
{
    public class Curso
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public virtual ICollection<Aluno> Alunos { get; set; }
    }
} 