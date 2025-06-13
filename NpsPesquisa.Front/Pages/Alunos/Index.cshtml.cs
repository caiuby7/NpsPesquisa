using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using NpsPesquisa.Front.Models;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Linq;

namespace NpsPesquisa.Front.Pages.Alunos
{
    public class IndexModel : PageModel
    {
        private readonly IConfiguration _config;
        public IndexModel(IConfiguration config) { _config = config; }

        public List<Aluno> Alunos { get; set; }
        public Dictionary<int, string> CursosDict { get; set; } = new();

        public async Task<IActionResult> OnGetAsync()
        {
            if (Request.Cookies["AuthToken"] == null)
                return RedirectToPage("/Account/Login");

            var apiUrl = _config["ApiBaseUrl"];
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri(apiUrl);
            Alunos = await client.GetFromJsonAsync<List<Aluno>>("alunos");
            var cursos = await client.GetFromJsonAsync<List<Curso>>("cursos");
            CursosDict = cursos?.ToDictionary(c => c.Id, c => c.Nome ?? "") ?? new();
            return Page();
        }

        public async Task<IActionResult> OnPostDeleteAsync(int id)
        {
            if (Request.Cookies["AuthToken"] == null)
                return RedirectToPage("/Account/Login");

            var apiUrl = _config["ApiBaseUrl"];
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri(apiUrl);
            await client.DeleteAsync($"alunos/{id}");
            return RedirectToPage();
        }
    }
} 