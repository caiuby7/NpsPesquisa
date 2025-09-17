using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;

namespace NpsPesquisa.Api
{
    public class AddItemAvaliadoIdColumn
    {
        public static async Task ExecuteAsync()
        {
            var options = new DbContextOptionsBuilder<NpsDbContext>()
                .UseMySql("Server=database-1.c9dpaerguibp.us-east-1.rds.amazonaws.com;Database=ava_inst;User=admin;Password=Ber250819;Connection Timeout=300;Command Timeout=300;Max Pool Size=200;Min Pool Size=10;", 
                    ServerVersion.AutoDetect("Server=database-1.c9dpaerguibp.us-east-1.rds.amazonaws.com;Database=ava_inst;User=admin;Password=Ber250819;Connection Timeout=300;Command Timeout=300;Max Pool Size=200;Min Pool Size=10;"))
                .Options;

            using var context = new NpsDbContext(options);

            try
            {
                Console.WriteLine("Adicionando coluna ItemAvaliadoId...");

                // Verificar se a coluna já existe
                var columnExists = await context.Database.ExecuteSqlRawAsync(@"
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = 'ava_inst' 
                    AND TABLE_NAME = 'respostasquestoes' 
                    AND COLUMN_NAME = 'ItemAvaliadoId'
                ") > 0;

                if (!columnExists)
                {
                    // Adicionar a coluna
                    await context.Database.ExecuteSqlRawAsync(@"
                        ALTER TABLE respostasquestoes 
                        ADD COLUMN ItemAvaliadoId INT NULL 
                        COMMENT 'ID do item específico sendo avaliado (disciplina, turma, etc.)'
                    ");

                    Console.WriteLine("Coluna ItemAvaliadoId adicionada com sucesso!");
                }
                else
                {
                    Console.WriteLine("Coluna ItemAvaliadoId já existe!");
                }

                // Adicionar índice único composto
                try
                {
                    await context.Database.ExecuteSqlRawAsync(@"
                        ALTER TABLE respostasquestoes 
                        ADD UNIQUE INDEX IX_respostasquestoes_RespostaId_QuestaoId_ItemAvaliadoId 
                        (RespostaId, QuestaoId, ItemAvaliadoId)
                    ");

                    Console.WriteLine("Índice único adicionado com sucesso!");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Aviso: Erro ao adicionar índice (pode já existir): {ex.Message}");
                }

                // Verificar estrutura da tabela
                Console.WriteLine("\nEstrutura da tabela respostasquestoes:");
                var columns = await context.Database.ExecuteSqlRawAsync(@"
                    DESCRIBE respostasquestoes
                ");

                Console.WriteLine("Script executado com sucesso!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro: {ex.Message}");
            }
        }
    }
}
