using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NpsPesquisa.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingAlunoFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailInstitucional",
                table: "Alunos",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "EmailPessoal",
                table: "Alunos",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Fone",
                table: "Alunos",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Matricula",
                table: "Alunos",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "NivelEnsino",
                table: "Alunos",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PeriodoLetivo",
                table: "Alunos",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "StatusNoPeriodoLetivo",
                table: "Alunos",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Turno",
                table: "Alunos",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailInstitucional",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "EmailPessoal",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "Fone",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "Matricula",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "NivelEnsino",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "PeriodoLetivo",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "StatusNoPeriodoLetivo",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "Turno",
                table: "Alunos");
        }
    }
} 