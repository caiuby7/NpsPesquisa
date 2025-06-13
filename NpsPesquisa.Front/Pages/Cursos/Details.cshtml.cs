using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Cursos
{
    public class DetailsModel : PageModel
    {
        public Curso Curso { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            Curso = await client.GetFromJsonAsync<Curso>($"cursos/{id}");
            if (Curso == null)
                return RedirectToPage("Index");
            return Page();
        }
    }
} 