using System.Text.Json.Serialization;

namespace NpsPesquisa.Api.Models
{
    public class Aluno
    {
        public int Id { get; set; }
        public string Filial { get; set; }
        public string NivelEnsino { get; set; }
        public string PeriodoLetivo { get; set; }
        public string Nome { get; set; }
        public string Matricula { get; set; }
        public int CursoId { get; set; }
        public virtual Curso? Curso { get; set; }
        public string Turno { get; set; }
        public string EmailInstitucional { get; set; }
        public string EmailPessoal { get; set; }
        public string Fone { get; set; }
        public string StatusNoPeriodoLetivo { get; set; }
        public bool AceitaContato { get; set; }
        public virtual ICollection<Resposta> Respostas { get; set; }
    }
} 