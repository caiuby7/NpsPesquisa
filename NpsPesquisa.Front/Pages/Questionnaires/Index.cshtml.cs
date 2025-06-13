using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Questionnaires
{
    public class IndexModel : PageModel
    {
        public List<Questionnaire> Questionnaires { get; set; }

        public async Task OnGetAsync()
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            Questionnaires = await client.GetFromJsonAsync<List<Questionnaire>>("questionnaires");
        }

        public async Task<IActionResult> OnPostDeleteAsync(int id)
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            await client.DeleteAsync($"questionnaires/{id}");
            return RedirectToPage();
        }
    }
} 