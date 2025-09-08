using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NpsPesquisa.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddQuestaoCondicionalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCondicional",
                table: "questoes",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AtivaCondicao",
                table: "opcoesquestao",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "QuestaoCondicionalId",
                table: "opcoesquestao",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_opcoesquestao_QuestaoCondicionalId",
                table: "opcoesquestao",
                column: "QuestaoCondicionalId");

            migrationBuilder.AddForeignKey(
                name: "FK_opcoesquestao_questoes_QuestaoCondicionalId",
                table: "opcoesquestao",
                column: "QuestaoCondicionalId",
                principalTable: "questoes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_opcoesquestao_questoes_QuestaoCondicionalId",
                table: "opcoesquestao");

            migrationBuilder.DropIndex(
                name: "IX_opcoesquestao_QuestaoCondicionalId",
                table: "opcoesquestao");

            migrationBuilder.DropColumn(
                name: "IsCondicional",
                table: "questoes");

            migrationBuilder.DropColumn(
                name: "AtivaCondicao",
                table: "opcoesquestao");

            migrationBuilder.DropColumn(
                name: "QuestaoCondicionalId",
                table: "opcoesquestao");
        }
    }
}
