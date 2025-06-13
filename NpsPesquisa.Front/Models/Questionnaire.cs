using System.Collections.Generic;

namespace NpsPesquisa.Front.Models
{
    public class Questionnaire
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public List<int>? QuestionIds { get; set; }
    }
} 