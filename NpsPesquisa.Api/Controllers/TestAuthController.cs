using Microsoft.AspNetCore.Mvc;
using NpsPesquisa.Api.Models;
using NpsPesquisa.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestAuthController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public TestAuthController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpPost("test-ad-auth")]
        public IActionResult TestActiveDirectoryAuth([FromBody] TestAuthRequest request)
        {
            try
            {
                var username = request.Email?.Split('@')[0];
                
                if (string.IsNullOrEmpty(username))
                {
                    return BadRequest(new { error = "Email inválido" });
                }

                // Testa autenticação
                var isAuthenticated = ActiveDirectory.IsAuthenticated(username, request.Password);
                
                // Testa consulta de perfil
                var infoPerfil = ActiveDirectory.ConsultaPerfilSemSenha(username);
                
                // Verifica se usuário existe no banco
                var usuarioExistente = _context.Usuarios
                    .Include(u => u.Perfil)
                    .FirstOrDefault(u => u.Email == request.Email);

                var response = new
                {
                    username = username,
                    isAuthenticated = isAuthenticated,
                    profileInfo = new
                    {
                        nome = infoPerfil?.nome,
                        perfil = infoPerfil?.perfil
                    },
                    existingUser = usuarioExistente != null ? new
                    {
                        id = usuarioExistente.Id,
                        nome = usuarioExistente.Nome,
                        email = usuarioExistente.Email,
                        perfil = usuarioExistente.Perfil?.Nome,
                        ativo = usuarioExistente.Ativo
                    } : null
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("profiles")]
        public async Task<IActionResult> GetProfiles()
        {
            try
            {
                var perfis = await _context.Perfis.ToListAsync();
                return Ok(perfis);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var usuarios = await _context.Usuarios
                    .Include(u => u.Perfil)
                    .ToListAsync();
                
                var response = usuarios.Select(u => new
                {
                    id = u.Id,
                    nome = u.Nome,
                    email = u.Email,
                    perfil = u.Perfil?.Nome,
                    ativo = u.Ativo,
                    dataCriacao = u.DataCriacao,
                    ultimoAcesso = u.UltimoAcesso
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class TestAuthRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
