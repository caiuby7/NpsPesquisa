using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Linq;

namespace NpsPesquisa.Front.Pages.Questions
{
    public class CreateModel : PageModel
    {
        [BindProperty]
        public Question Question { get; set; }
        [BindProperty]
        public string OptionsInput { get; set; }

        public void OnGet()
        {
            Question = new Question();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!string.IsNullOrEmpty(OptionsInput))
                Question.Options = OptionsInput.Split(',').Select(o => o.Trim()).ToList();
            else
                Question.Options = null;

            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            var response = await client.PostAsJsonAsync("questions", Question);
            if (response.IsSuccessStatusCode)
                return RedirectToPage("Index");
            ModelState.AddModelError(string.Empty, "Erro ao cadastrar questão.");
            return Page();
        }
    }
} 