using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Alunos
{
    public class DetailsModel : PageModel
    {
        public Aluno Aluno { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            Aluno = await client.GetFromJsonAsync<Aluno>($"alunos/{id}");
            if (Aluno == null)
                return RedirectToPage("Index");
            return Page();
        }
    }
} 