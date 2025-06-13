using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Extensions.Configuration;

namespace NpsPesquisa.Front.Pages.Usuarios
{
    public class IndexModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<Usuario> Usuarios { get; set; }
        public Dictionary<int, string> PerfisDict { get; set; } = new();

        public IndexModel(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            if (Request.Cookies["AuthToken"] == null)
                return RedirectToPage("/Account/Login");

            using var client = new HttpClient();
            client.BaseAddress = new System.Uri(_configuration["ApiUrl"]);
            Usuarios = await client.GetFromJsonAsync<List<Usuario>>("usuarios");
            var perfis = await client.GetFromJsonAsync<List<Perfil>>("perfis");
            PerfisDict = perfis?.ToDictionary(p => p.Id, p => p.Nome ?? "") ?? new();
            return Page();
        }

        public async Task<IActionResult> OnPostDeleteAsync(int id)
        {
            if (Request.Cookies["AuthToken"] == null)
                return RedirectToPage("/Account/Login");

            using var client = new HttpClient();
            client.BaseAddress = new System.Uri(_configuration["ApiUrl"]);
            await client.DeleteAsync($"usuarios/{id}");
            return RedirectToPage();
        }
    }
} 