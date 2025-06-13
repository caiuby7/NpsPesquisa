using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NpsPesquisa.Front.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace NpsPesquisa.Front.Pages.Account
{
    public class ForgotPasswordPageModel : PageModel
    {
        private readonly IConfiguration _config;
        public ForgotPasswordPageModel(IConfiguration config)
        {
            _config = config;
        }

        [BindProperty]
        public ForgotPasswordModel? ForgotPassword { get; set; }
        public string? Message { get; set; }

        public void OnGet() { }

        public async Task<IActionResult> OnPostAsync()
        {
            if (ForgotPassword == null)
            {
                Message = "Preencha o campo de email.";
                return Page();
            }
            var apiUrl = _config["ApiBaseUrl"];
            using var client = new HttpClient();
            client.BaseAddress = new System.Uri(apiUrl);
            var response = await client.PostAsJsonAsync("auth/forgot-password", ForgotPassword);
            if (response.IsSuccessStatusCode)
            {
                Message = "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.";
            }
            else
            {
                Message = "Não foi possível enviar o email. Tente novamente.";
            }
            return Page();
        }
    }
} 