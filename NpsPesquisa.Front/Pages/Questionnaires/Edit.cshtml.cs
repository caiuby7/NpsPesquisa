using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Linq;

namespace NpsPesquisa.Front.Pages.Questionnaires
{
    public class EditModel : PageModel
    {
        [BindProperty]
        public Questionnaire Questionnaire { get; set; }
        [BindProperty]
        public string QuestionIdsInput { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            Questionnaire = await client.GetFromJsonAsync<Questionnaire>($"questionnaires/{id}");
            QuestionIdsInput = Questionnaire.QuestionIds != null ? string.Join(", ", Questionnaire.QuestionIds) : string.Empty;
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int id)
        {
            if (!string.IsNullOrEmpty(QuestionIdsInput))
                Questionnaire.QuestionIds = QuestionIdsInput.Split(',').Select(qid => int.Parse(qid.Trim())).ToList();
            else
                Questionnaire.QuestionIds = null;

            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            var response = await client.PutAsJsonAsync($"questionnaires/{id}", Questionnaire);
            if (response.IsSuccessStatusCode)
                return RedirectToPage("Index");
            ModelState.AddModelError(string.Empty, "Erro ao editar formulário.");
            return Page();
        }
    }
} 