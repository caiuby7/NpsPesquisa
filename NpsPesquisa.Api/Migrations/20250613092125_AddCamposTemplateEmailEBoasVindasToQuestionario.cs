using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NpsPesquisa.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCamposTemplateEmailEBoasVindasToQuestionario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TemplateEmailConvite",
                table: "Questionarios",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "TemplateEmailLembrete",
                table: "Questionarios",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "TextoBoasVindas",
                table: "Questionarios",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TemplateEmailConvite",
                table: "Questionarios");

            migrationBuilder.DropColumn(
                name: "TemplateEmailLembrete",
                table: "Questionarios");

            migrationBuilder.DropColumn(
                name: "TextoBoasVindas",
                table: "Questionarios");
        }
    }
}
