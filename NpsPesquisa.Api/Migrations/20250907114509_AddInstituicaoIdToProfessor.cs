using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NpsPesquisa.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddInstituicaoIdToProfessor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "InstituicaoId",
                table: "professores",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_professores_InstituicaoId",
                table: "professores",
                column: "InstituicaoId");

            migrationBuilder.AddForeignKey(
                name: "FK_professores_instituicoes_InstituicaoId",
                table: "professores",
                column: "InstituicaoId",
                principalTable: "instituicoes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_professores_instituicoes_InstituicaoId",
                table: "professores");

            migrationBuilder.DropIndex(
                name: "IX_professores_InstituicaoId",
                table: "professores");

            migrationBuilder.DropColumn(
                name: "InstituicaoId",
                table: "professores");
        }
    }
}
