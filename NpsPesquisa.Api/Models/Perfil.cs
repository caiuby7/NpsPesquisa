using System.Collections.Generic;

namespace NpsPesquisa.Api.Models
{
    public class Perfil
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public virtual ICollection<Usuario> Usuarios { get; set; }
    }
} 