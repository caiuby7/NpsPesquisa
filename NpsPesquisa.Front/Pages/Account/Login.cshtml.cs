using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace NpsPesquisa.Front.Pages.Account
{
    public class LoginPageModel : PageModel
    {
        private readonly IConfiguration _config;
        public LoginPageModel(IConfiguration config)
        {
            _config = config;
        }
        [BindProperty]
        public LoginModel? Login { get; set; }
        public string? ErrorMessage { get; set; }

        public void OnGet() { }

        public async Task<IActionResult> OnPostAsync()
        {
            if (Login == null)
            {
                ErrorMessage = "Preencha os campos.";
                return Page();
            }
            var apiUrl = _config["ApiBaseUrl"];
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri(apiUrl);
            var response = await client.PostAsJsonAsync("auth/login", Login);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
                if (!string.IsNullOrEmpty(result?.Token))
                {
                    Response.Cookies.Append("AuthToken", result.Token, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.Strict
                    });
                    return RedirectToPage("/Index");
                }
            }
            ErrorMessage = "Usuário ou senha inválidos.";
            return Page();
        }
    }
} 