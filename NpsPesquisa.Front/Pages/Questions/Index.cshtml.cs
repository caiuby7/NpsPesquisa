using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using NpsPesquisa.Front.Models;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace NpsPesquisa.Front.Pages.Questions
{
    public class IndexModel : PageModel
    {
        private readonly IConfiguration _config;
        public IndexModel(IConfiguration config) { _config = config; }
        public List<Question> Questions { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            var apiUrl = _config["ApiBaseUrl"];
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri(apiUrl);
            Questions = await client.GetFromJsonAsync<List<Question>>("questions");
            return Page();
        }

        public async Task<IActionResult> OnPostDeleteAsync(int id)
        {
            var apiUrl = _config["ApiBaseUrl"];
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri(apiUrl);
            await client.DeleteAsync($"questions/{id}");
            return RedirectToPage();
        }
    }
} 