using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Perfis
{
    public class DetailsModel : PageModel
    {
        public Perfil Perfil { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            Perfil = await client.GetFromJsonAsync<Perfil>($"perfis/{id}");
            if (Perfil == null)
                return RedirectToPage("Index");
            return Page();
        }
    }
} 