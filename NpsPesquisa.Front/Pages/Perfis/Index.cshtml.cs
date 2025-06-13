using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Perfis
{
    public class IndexModel : PageModel
    {
        public List<Perfil> Perfis { get; set; }

        public async Task OnGetAsync()
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            Perfis = await client.GetFromJsonAsync<List<Perfil>>("perfis");
        }

        public async Task<IActionResult> OnPostDeleteAsync(int id)
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            await client.DeleteAsync($"perfis/{id}");
            return RedirectToPage();
        }
    }
} 