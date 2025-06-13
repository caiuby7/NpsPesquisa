using System.Collections.Generic;

namespace NpsPesquisa.Front.Models
{
    public class Question
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Type { get; set; } // Ex: "multiple_choice", "checkbox", "text"
        public List<string> Options { get; set; }
        public bool Required { get; set; }
    }
} 