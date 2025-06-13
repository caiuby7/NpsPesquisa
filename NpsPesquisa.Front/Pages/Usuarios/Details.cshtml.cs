using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Usuarios
{
    public class DetailsModel : PageModel
    {
        private readonly IConfiguration _config;
        public DetailsModel(IConfiguration config) { _config = config; }
        public Usuario Usuario { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            var apiUrl = _config["ApiBaseUrl"];
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri(apiUrl);
            Usuario = await client.GetFromJsonAsync<Usuario>($"usuarios/{id}");
            if (Usuario == null)
                return RedirectToPage("Index");
            return Page();
        }
    }
} 