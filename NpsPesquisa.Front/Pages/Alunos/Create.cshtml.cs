using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Alunos
{
    public class CreateModel : PageModel
    {
        [BindProperty]
        public Aluno Aluno { get; set; }

        public void OnGet()
        {
            Aluno = new Aluno();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            var response = await client.PostAsJsonAsync("alunos", Aluno);
            if (response.IsSuccessStatusCode)
                return RedirectToPage("Index");
            ModelState.AddModelError(string.Empty, "Erro ao cadastrar aluno.");
            return Page();
        }
    }
} 