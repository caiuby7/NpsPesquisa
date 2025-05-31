using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NpsPesquisa.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEhColunaToOpcoesQuestao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OpcoesQuestoes_Questoes_QuestaoId",
                table: "OpcoesQuestoes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OpcoesQuestoes",
                table: "OpcoesQuestoes");

            migrationBuilder.RenameTable(
                name: "OpcoesQuestoes",
                newName: "OpcoesQuestao");

            migrationBuilder.RenameIndex(
                name: "IX_OpcoesQuestoes_QuestaoId",
                table: "OpcoesQuestao",
                newName: "IX_OpcoesQuestao_QuestaoId");

            migrationBuilder.UpdateData(
                table: "OpcoesQuestao",
                keyColumn: "Valor",
                keyValue: null,
                column: "Valor",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "Valor",
                table: "OpcoesQuestao",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "Ordem",
                table: "OpcoesQuestao",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EhColuna",
                table: "OpcoesQuestao",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Peso",
                table: "OpcoesQuestao",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_OpcoesQuestao",
                table: "OpcoesQuestao",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OpcoesQuestao_Questoes_QuestaoId",
                table: "OpcoesQuestao",
                column: "QuestaoId",
                principalTable: "Questoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OpcoesQuestao_Questoes_QuestaoId",
                table: "OpcoesQuestao");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OpcoesQuestao",
                table: "OpcoesQuestao");

            migrationBuilder.DropColumn(
                name: "EhColuna",
                table: "OpcoesQuestao");

            migrationBuilder.DropColumn(
                name: "Peso",
                table: "OpcoesQuestao");

            migrationBuilder.RenameTable(
                name: "OpcoesQuestao",
                newName: "OpcoesQuestoes");

            migrationBuilder.RenameIndex(
                name: "IX_OpcoesQuestao_QuestaoId",
                table: "OpcoesQuestoes",
                newName: "IX_OpcoesQuestoes_QuestaoId");

            migrationBuilder.AlterColumn<string>(
                name: "Valor",
                table: "OpcoesQuestoes",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "Ordem",
                table: "OpcoesQuestoes",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddPrimaryKey(
                name: "PK_OpcoesQuestoes",
                table: "OpcoesQuestoes",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OpcoesQuestoes_Questoes_QuestaoId",
                table: "OpcoesQuestoes",
                column: "QuestaoId",
                principalTable: "Questoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
