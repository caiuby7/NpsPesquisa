using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NpsPesquisa.Api.Models;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using NpsPesquisa.Api.Data;
using System.Net.Mail;
using System.Net;

namespace NpsPesquisa.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> Login(LoginDto loginDto);
        Task<AuthResponseDto> Register(RegistroDto registroDto);
        string GenerateJwtToken(Usuario usuario);
        Task<Usuario> Register(Usuario usuario, string senha);
        Task TrocarSenha(int usuarioId, TrocaSenhaDto trocaSenhaDto);
        Task EsqueciSenha(EsqueciSenhaDto esqueciSenhaDto);
        Task<bool> ValidarHashSenha(ValidarHashSenhaDto validarHashDto);
        Task RedefinirSenha(RedefinirSenhaDto redefinirSenhaDto);
    }

    public class AuthService : IAuthService
    {
        private readonly NpsDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(NpsDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private string HashPassword(string password)
        {
            using (var md5 = MD5.Create())
            {
                var inputBytes = Encoding.UTF8.GetBytes(password);
                var hashBytes = md5.ComputeHash(inputBytes);
                return Convert.ToBase64String(hashBytes);
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            var passwordHash = HashPassword(password);
            return passwordHash == hash;
        }

        public async Task<AuthResponseDto> Login(LoginDto loginDto)
        {
            var usuario = await _context.Usuarios
                .Include(u => u.Perfil)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email && u.Ativo);

            if (usuario == null || !VerifyPassword(loginDto.Senha, usuario.Senha))
                throw new Exception("Email ou senha inválidos");

            usuario.UltimoAcesso = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(usuario);

            return new AuthResponseDto
            {
                Token = token,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Perfil = usuario.Perfil.Nome
            };
        }

        public async Task<AuthResponseDto> Register(RegistroDto registroDto)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Email == registroDto.Email))
                throw new Exception("Email já cadastrado");

            var usuario = new Usuario
            {
                Nome = registroDto.Nome,
                Email = registroDto.Email,
                Senha = HashPassword(registroDto.Senha),
                Ativo = true,
                DataCriacao = DateTime.UtcNow,
                PerfilId = registroDto.PerfilId
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(usuario);

            return new AuthResponseDto
            {
                Token = token,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Perfil = usuario.Perfil.Nome
            };
        }

        public string GenerateJwtToken(Usuario usuario)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(ClaimTypes.Role, usuario.Perfil.Nome)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<Usuario> Register(Usuario usuario, string senha)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Email == usuario.Email))
            {
                throw new Exception("Email já está em uso.");
            }

            usuario.Senha = HashPassword(senha);

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return usuario;
        }

        public async Task TrocarSenha(int usuarioId, TrocaSenhaDto trocaSenhaDto)
        {
            var usuario = await _context.Usuarios.FindAsync(usuarioId);
            if (usuario == null)
            {
                throw new Exception("Usuário não encontrado");
            }

            if (!VerifyPassword(trocaSenhaDto.SenhaAtual, usuario.Senha))
            {
                throw new Exception("Senha atual incorreta");
            }

            if (trocaSenhaDto.NovaSenha != trocaSenhaDto.ConfirmacaoNovaSenha)
            {
                throw new Exception("A nova senha e a confirmação não conferem");
            }

            usuario.Senha = HashPassword(trocaSenhaDto.NovaSenha);
            await _context.SaveChangesAsync();
        }

        public async Task EsqueciSenha(EsqueciSenhaDto esqueciSenhaDto)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == esqueciSenhaDto.Email && u.Ativo);

            if (usuario == null)
            {
                // Por segurança, não informamos se o email existe ou não
                return;
            }

            // Gera um hash único
            var hash = GeneratePasswordResetHash();
            var dataExpiracao = DateTime.UtcNow.AddHours(24);

            // Envia o email
            await EnviarEmailRedefinicaoSenha(usuario.Email, hash);
        }

        public async Task<bool> ValidarHashSenha(ValidarHashSenhaDto validarHashDto)
        {
            return true;
        }

        public async Task RedefinirSenha(RedefinirSenhaDto redefinirSenhaDto)
        {
        }

        private string GeneratePasswordResetHash()
        {
            var randomBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes);
        }

        private async Task EnviarEmailRedefinicaoSenha(string email, string hash)
        {
            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var client = new SmtpClient(smtpSettings["Host"])
            {
                Port = int.Parse(smtpSettings["Port"]),
                Credentials = new NetworkCredential(smtpSettings["Username"], smtpSettings["Password"]),
                EnableSsl = true,
            };

            var frontendUrl = _configuration["FrontendUrl"];
            var resetLink = $"{frontendUrl}/redefinir-senha?hash={hash}";

            var mailMessage = new MailMessage
            {
                From = new MailAddress(smtpSettings["From"]),
                Subject = "Redefinição de Senha",
                Body = $"Para redefinir sua senha, clique no link abaixo:\n\n{resetLink}\n\nEste link expira em 24 horas.",
                IsBodyHtml = false,
            };
            mailMessage.To.Add(email);

            await client.SendMailAsync(mailMessage);
        }
    }
} 