using System;
using System.Collections.Generic;

namespace NpsPesquisa.Api.Models
{
    public class Resposta
    {
        public int Id { get; set; }
        public int QuestionarioId { get; set; }
        public Questionario Questionario { get; set; }
        public int AlunoId { get; set; }
        public Aluno Aluno { get; set; }
        public string Valor { get; set; }
        public string? Texto { get; set; }
        public DateTime DataResposta { get; set; }
        public List<RespostaQuestao> RespostasQuestoes { get; set; }
    }
} 