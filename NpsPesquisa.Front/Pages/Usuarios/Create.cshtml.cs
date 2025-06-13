using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Usuarios
{
    public class CreateModel : PageModel
    {
        private readonly IConfiguration _config;
        public CreateModel(IConfiguration config) { _config = config; }
        [BindProperty]
        public Usuario Usuario { get; set; }

        public void OnGet()
        {
            Usuario = new Usuario();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            var apiUrl = _config["ApiBaseUrl"];
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri(apiUrl);
            var response = await client.PostAsJsonAsync("usuarios", Usuario);
            if (response.IsSuccessStatusCode)
                return RedirectToPage("Index");
            ModelState.AddModelError(string.Empty, "Erro ao cadastrar usuário.");
            return Page();
        }
    }
} 