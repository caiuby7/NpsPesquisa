using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Cursos
{
    public class CreateModel : PageModel
    {
        [BindProperty]
        public Curso Curso { get; set; }

        public void OnGet()
        {
            Curso = new Curso();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            var response = await client.PostAsJsonAsync("cursos", Curso);
            if (response.IsSuccessStatusCode)
                return RedirectToPage("Index");
            ModelState.AddModelError(string.Empty, "Erro ao cadastrar curso.");
            return Page();
        }
    }
} 