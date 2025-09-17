using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NpsPesquisa.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixRespostaQuestaoIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Verificar se o índice existe antes de tentar criá-lo
            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS IX_respostasquestoes_RespostaId 
                ON respostasquestoes(RespostaId);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Não remover o índice pois ele é necessário para a chave estrangeira
            // migrationBuilder.DropIndex(
            //     name: "IX_respostasquestoes_RespostaId",
            //     table: "respostasquestoes");
        }
    }
}
