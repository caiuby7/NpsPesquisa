using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NpsPesquisa.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDataInicioDataFimToQuestionario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Texto",
                table: "RespostasQuestoes",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Texto",
                table: "Respostas",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Valor",
                table: "Respostas",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataFim",
                table: "Questionarios",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataInicio",
                table: "Questionarios",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Texto",
                table: "RespostasQuestoes");

            migrationBuilder.DropColumn(
                name: "Texto",
                table: "Respostas");

            migrationBuilder.DropColumn(
                name: "Valor",
                table: "Respostas");

            migrationBuilder.DropColumn(
                name: "DataFim",
                table: "Questionarios");

            migrationBuilder.DropColumn(
                name: "DataInicio",
                table: "Questionarios");
        }
    }
}
