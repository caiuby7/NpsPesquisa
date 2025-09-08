using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NpsPesquisa.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixTurmaDisciplinaGerenciadaNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_disciplinas_instituicoes_InstituicaoId",
                table: "disciplinas");

            migrationBuilder.DropForeignKey(
                name: "FK_turmasdisciplinas_turmasdisciplinas_TurmaDisciplinaGerenciad~",
                table: "turmasdisciplinas");

            migrationBuilder.AlterColumn<int>(
                name: "TurmaDisciplinaGerenciadaId",
                table: "turmasdisciplinas",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "IdTurmaDisciplinaGerenciada",
                table: "turmasdisciplinas",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_disciplinas_instituicoes_InstituicaoId",
                table: "disciplinas",
                column: "InstituicaoId",
                principalTable: "instituicoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_turmasdisciplinas_turmasdisciplinas_TurmaDisciplinaGerenciad~",
                table: "turmasdisciplinas",
                column: "TurmaDisciplinaGerenciadaId",
                principalTable: "turmasdisciplinas",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_disciplinas_instituicoes_InstituicaoId",
                table: "disciplinas");

            migrationBuilder.DropForeignKey(
                name: "FK_turmasdisciplinas_turmasdisciplinas_TurmaDisciplinaGerenciad~",
                table: "turmasdisciplinas");

            migrationBuilder.AlterColumn<int>(
                name: "TurmaDisciplinaGerenciadaId",
                table: "turmasdisciplinas",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "IdTurmaDisciplinaGerenciada",
                table: "turmasdisciplinas",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_disciplinas_instituicoes_InstituicaoId",
                table: "disciplinas",
                column: "InstituicaoId",
                principalTable: "instituicoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_turmasdisciplinas_turmasdisciplinas_TurmaDisciplinaGerenciad~",
                table: "turmasdisciplinas",
                column: "TurmaDisciplinaGerenciadaId",
                principalTable: "turmasdisciplinas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
