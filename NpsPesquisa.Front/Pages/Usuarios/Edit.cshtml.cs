using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Usuarios
{
    public class EditModel : PageModel
    {
        private readonly IConfiguration _config;
        public EditModel(IConfiguration config) { _config = config; }
        [BindProperty]
        public Usuario Usuario { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            var apiUrl = _config["ApiBaseUrl"];
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri(apiUrl);
            Usuario = await client.GetFromJsonAsync<Usuario>($"usuarios/{id}");
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int id)
        {
            var apiUrl = _config["ApiBaseUrl"];
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri(apiUrl);
            var response = await client.PutAsJsonAsync($"usuarios/{id}", Usuario);
            if (response.IsSuccessStatusCode)
                return RedirectToPage("Index");
            ModelState.AddModelError(string.Empty, "Erro ao editar usuário.");
            return Page();
        }
    }
} 