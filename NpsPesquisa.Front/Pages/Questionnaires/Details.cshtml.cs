using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Questionnaires
{
    public class DetailsModel : PageModel
    {
        public Questionnaire Questionnaire { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri("https://localhost:7247/api/");
            Questionnaire = await client.GetFromJsonAsync<Questionnaire>($"questionnaires/{id}");
            if (Questionnaire == null)
                return RedirectToPage("Index");
            return Page();
        }
    }
} 