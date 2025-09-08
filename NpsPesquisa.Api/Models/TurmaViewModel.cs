using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Models
{
    public class TurmaViewModel
    {
        [Required(ErrorMessage = "O nome da turma é obrigatório")]
        [StringLength(100, ErrorMessage = "O nome deve ter no máximo 100 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres")]
        public string? Descricao { get; set; }

        [Required(ErrorMessage = "O curso é obrigatório")]
        public int CursoId { get; set; }

        [Required(ErrorMessage = "O período letivo é obrigatório")]
        public int PeriodoLetivoId { get; set; }

        public int? Turno { get; set; } // 1 = Manhã, 2 = Tarde, 3 = Noite

        [StringLength(100, ErrorMessage = "O ID de integração deve ter no máximo 100 caracteres")]
        public string? IntegracaoId { get; set; }

        public bool Ativo { get; set; } = true;
    }
}
