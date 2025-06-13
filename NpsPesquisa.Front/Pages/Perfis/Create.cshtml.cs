using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Perfis
{
    public class CreateModel : PageModel
    {
        [BindProperty]
        public Perfil Perfil { get; set; }

        public void OnGet()
        {
            Perfil = new Perfil();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            var response = await client.PostAsJsonAsync("perfis", Perfil);
            if (response.IsSuccessStatusCode)
                return RedirectToPage("Index");
            ModelState.AddModelError(string.Empty, "Erro ao cadastrar perfil.");
            return Page();
        }
    }
} 