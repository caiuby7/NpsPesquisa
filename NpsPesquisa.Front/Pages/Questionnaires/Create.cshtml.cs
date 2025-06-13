using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Linq;

namespace NpsPesquisa.Front.Pages.Questionnaires
{
    public class CreateModel : PageModel
    {
        [BindProperty]
        public Questionnaire Questionnaire { get; set; }
        [BindProperty]
        public string QuestionIdsInput { get; set; }

        public void OnGet()
        {
            Questionnaire = new Questionnaire();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!string.IsNullOrEmpty(QuestionIdsInput))
                Questionnaire.QuestionIds = QuestionIdsInput.Split(',').Select(id => int.Parse(id.Trim())).ToList();
            else
                Questionnaire.QuestionIds = null;

            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            var response = await client.PostAsJsonAsync("questionnaires", Questionnaire);
            if (response.IsSuccessStatusCode)
                return RedirectToPage("Index");
            ModelState.AddModelError(string.Empty, "Erro ao cadastrar formulário.");
            return Page();
        }
    }
} 