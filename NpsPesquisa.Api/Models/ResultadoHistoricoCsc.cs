using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NpsPesquisa.Api.Models
{
    public class ResultadoHistoricoCsc
    {
        public int Id { get; set; }

        [Required]
        public string PeriodoLetivo { get; set; }

        [Required]
        public int CursoId { get; set; }

        [ForeignKey("CursoId")]
        public virtual Curso Curso { get; set; }

        [Required]
        public decimal NotaCsc { get; set; }

        [Required]
        public int TotalRespondentes { get; set; }

        public string Observacoes { get; set; }

        [Required]
        public DateTime DataRegistro { get; set; }

        [Required]
        public string UsuarioRegistro { get; set; }
    }
} 