using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Models;
using NpsPesquisa.Api.Services;
using System.Security.Cryptography;
using System.Text;

namespace NpsPesquisa.Api.Data
{
    public static class DbInitializer
    {
        private static string HashPassword(string password)
        {
            using (var md5 = MD5.Create())
            {
                var inputBytes = Encoding.UTF8.GetBytes(password);
                var hashBytes = md5.ComputeHash(inputBytes);
                return Convert.ToBase64String(hashBytes);
            }
        }

        public static async Task Initialize(NpsDbContext context, IAuthService authService)
        {
            // Garante que o banco de dados está criado
            // Migrações automáticas desabilitadas para evitar conflitos
            try
            {
                // Tenta usar EnsureCreated primeiro (mais seguro)
                await context.Database.EnsureCreatedAsync();
            }
            catch (Exception ex)
            {
                // Se EnsureCreated falhar, tenta Migrate como fallback
                Console.WriteLine($"EnsureCreated falhou, tentando Migrate: {ex.Message}");
                try
                {
                    await context.Database.MigrateAsync();
                }
                catch (Exception migrateEx)
                {
                    Console.WriteLine($"Migrate também falhou: {migrateEx.Message}");
                    throw new InvalidOperationException("Não foi possível inicializar o banco de dados. Verifique as configurações de conexão.", migrateEx);
                }
            }

            // Adiciona perfis padrão se não existirem
            if (!context.Perfis.Any())
            {
                var perfis = new List<Perfil>
                {
                    new Perfil { Nome = "Administrador", Descricao = "Acesso total ao sistema" },
                    new Perfil { Nome = "Coordenacao", Descricao = "Acesso à gestão de questionários e alunos" },
                    new Perfil { Nome = "Participante", Descricao = "Acesso apenas para responder questionários" }
                };

                await context.Perfis.AddRangeAsync(perfis);
                await context.SaveChangesAsync();
            }

            // Deleta o usuário admin se existir
            var adminExistente = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "admin@nps.com");
            if (adminExistente != null)
            {
                context.Usuarios.Remove(adminExistente);
                await context.SaveChangesAsync();
            }

            // Cria novo usuário administrador
            var adminPerfil = await context.Perfis.FirstOrDefaultAsync(p => p.Nome == "Administrador");
            if (adminPerfil != null)
            {
                var adminUser = new Usuario
                {
                    Nome = "Administrador",
                    Email = "admin@nps.com",
                    PerfilId = adminPerfil.Id,
                    Ativo = true,
                    DataCriacao = DateTime.UtcNow,
                    Senha = HashPassword("Admin@123")
                };
                context.Usuarios.Add(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
} 