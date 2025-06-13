using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Alunos
{
    public class EditModel : PageModel
    {
        [BindProperty]
        public Aluno Aluno { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            Aluno = await client.GetFromJsonAsync<Aluno>($"alunos/{id}");
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int id)
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            var response = await client.PutAsJsonAsync($"alunos/{id}", Aluno);
            if (response.IsSuccessStatusCode)
                return RedirectToPage("Index");
            ModelState.AddModelError(string.Empty, "Erro ao editar aluno.");
            return Page();
        }
    }
} 