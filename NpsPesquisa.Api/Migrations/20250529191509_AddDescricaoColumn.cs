using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NpsPesquisa.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDescricaoColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OpcaoId",
                table: "RespostasQuestoes",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Titulo",
                table: "Questionarios",
                type: "varchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Descricao",
                table: "Questionarios",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "OrdemAleatoria",
                table: "Questionarios",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "Valor",
                table: "OpcoesQuestao",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_RespostasQuestoes_OpcaoId",
                table: "RespostasQuestoes",
                column: "OpcaoId");

            migrationBuilder.AddForeignKey(
                name: "FK_RespostasQuestoes_OpcoesQuestao_OpcaoId",
                table: "RespostasQuestoes",
                column: "OpcaoId",
                principalTable: "OpcoesQuestao",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RespostasQuestoes_OpcoesQuestao_OpcaoId",
                table: "RespostasQuestoes");

            migrationBuilder.DropIndex(
                name: "IX_RespostasQuestoes_OpcaoId",
                table: "RespostasQuestoes");

            migrationBuilder.DropColumn(
                name: "OpcaoId",
                table: "RespostasQuestoes");

            migrationBuilder.DropColumn(
                name: "Descricao",
                table: "Questionarios");

            migrationBuilder.DropColumn(
                name: "OrdemAleatoria",
                table: "Questionarios");

            migrationBuilder.AlterColumn<string>(
                name: "Titulo",
                table: "Questionarios",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(200)",
                oldMaxLength: 200)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

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
        }
    }
}
