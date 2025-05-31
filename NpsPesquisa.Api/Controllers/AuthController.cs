using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NpsPesquisa.Api.Models;
using NpsPesquisa.Api.Services;
using System.Security.Claims;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            try
            {
                var response = await _authService.Login(loginDto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegistroDto registroDto)
        {
            try
            {
                var response = await _authService.Register(registroDto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("trocar-senha")]
        public async Task<IActionResult> TrocarSenha(TrocaSenhaDto trocaSenhaDto)
        {
            try
            {
                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new InvalidOperationException("User ID not found"));
                await _authService.TrocarSenha(usuarioId, trocaSenhaDto);
                return Ok(new { message = "Senha alterada com sucesso" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("esqueci-senha")]
        public async Task<IActionResult> EsqueciSenha(EsqueciSenhaDto esqueciSenhaDto)
        {
            try
            {
                await _authService.EsqueciSenha(esqueciSenhaDto);
                // Por segurança, sempre retornamos sucesso mesmo se o email não existir
                return Ok(new { message = "Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("validar-hash-senha")]
        public async Task<IActionResult> ValidarHashSenha(ValidarHashSenhaDto validarHashDto)
        {
            try
            {
                var isValid = await _authService.ValidarHashSenha(validarHashDto);
                return Ok(new { isValid });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("redefinir-senha")]
        public async Task<IActionResult> RedefinirSenha(RedefinirSenhaDto redefinirSenhaDto)
        {
            try
            {
                await _authService.RedefinirSenha(redefinirSenhaDto);
                return Ok(new { message = "Senha redefinida com sucesso" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 