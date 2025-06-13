using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Linq;

namespace NpsPesquisa.Front.Pages.Questions
{
    public class EditModel : PageModel
    {
        [BindProperty]
        public Question Question { get; set; }
        [BindProperty]
        public string OptionsInput { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            Question = await client.GetFromJsonAsync<Question>($"questions/{id}");
            OptionsInput = Question.Options != null ? string.Join(", ", Question.Options) : string.Empty;
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int id)
        {
            if (!string.IsNullOrEmpty(OptionsInput))
                Question.Options = OptionsInput.Split(',').Select(o => o.Trim()).ToList();
            else
                Question.Options = null;

            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            var response = await client.PutAsJsonAsync($"questions/{id}", Question);
            if (response.IsSuccessStatusCode)
                return RedirectToPage("Index");
            ModelState.AddModelError(string.Empty, "Erro ao editar questão.");
            return Page();
        }
    }
} 