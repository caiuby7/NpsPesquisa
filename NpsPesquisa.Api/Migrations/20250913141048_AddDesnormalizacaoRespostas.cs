using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NpsPesquisa.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDesnormalizacaoRespostas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CursoId",
                table: "respostas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisciplinaId",
                table: "respostas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InstituicaoId",
                table: "respostas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProfessorId",
                table: "respostas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TurmaId",
                table: "respostas",
                type: "int",
                nullable: true);


            migrationBuilder.CreateIndex(
                name: "IX_respostas_CursoId",
                table: "respostas",
                column: "CursoId");

            migrationBuilder.CreateIndex(
                name: "IX_respostas_DisciplinaId",
                table: "respostas",
                column: "DisciplinaId");

            migrationBuilder.CreateIndex(
                name: "IX_respostas_InstituicaoId",
                table: "respostas",
                column: "InstituicaoId");

            migrationBuilder.CreateIndex(
                name: "IX_respostas_ProfessorId",
                table: "respostas",
                column: "ProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_respostas_TipoItemAvaliado",
                table: "respostas",
                column: "TipoItemAvaliado");

            migrationBuilder.CreateIndex(
                name: "IX_respostas_TurmaId",
                table: "respostas",
                column: "TurmaId");

            migrationBuilder.AddForeignKey(
                name: "FK_respostas_cursos_CursoId",
                table: "respostas",
                column: "CursoId",
                principalTable: "cursos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_respostas_disciplinas_DisciplinaId",
                table: "respostas",
                column: "DisciplinaId",
                principalTable: "disciplinas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_respostas_instituicoes_InstituicaoId",
                table: "respostas",
                column: "InstituicaoId",
                principalTable: "instituicoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_respostas_professores_ProfessorId",
                table: "respostas",
                column: "ProfessorId",
                principalTable: "professores",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_respostas_turmas_TurmaId",
                table: "respostas",
                column: "TurmaId",
                principalTable: "turmas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_respostas_cursos_CursoId",
                table: "respostas");

            migrationBuilder.DropForeignKey(
                name: "FK_respostas_disciplinas_DisciplinaId",
                table: "respostas");

            migrationBuilder.DropForeignKey(
                name: "FK_respostas_instituicoes_InstituicaoId",
                table: "respostas");

            migrationBuilder.DropForeignKey(
                name: "FK_respostas_professores_ProfessorId",
                table: "respostas");

            migrationBuilder.DropForeignKey(
                name: "FK_respostas_turmas_TurmaId",
                table: "respostas");

            migrationBuilder.DropIndex(
                name: "IX_respostasquestoes_RespostaId_QuestaoId_ItemAvaliadoId",
                table: "respostasquestoes");

            migrationBuilder.DropIndex(
                name: "IX_respostas_CursoId",
                table: "respostas");

            migrationBuilder.DropIndex(
                name: "IX_respostas_DisciplinaId",
                table: "respostas");

            migrationBuilder.DropIndex(
                name: "IX_respostas_InstituicaoId",
                table: "respostas");

            migrationBuilder.DropIndex(
                name: "IX_respostas_ProfessorId",
                table: "respostas");

            migrationBuilder.DropIndex(
                name: "IX_respostas_TipoItemAvaliado",
                table: "respostas");

            migrationBuilder.DropIndex(
                name: "IX_respostas_TurmaId",
                table: "respostas");

            migrationBuilder.DropColumn(
                name: "ItemAvaliadoId",
                table: "respostasquestoes");

            migrationBuilder.DropColumn(
                name: "CursoId",
                table: "respostas");

            migrationBuilder.DropColumn(
                name: "DisciplinaId",
                table: "respostas");

            migrationBuilder.DropColumn(
                name: "InstituicaoId",
                table: "respostas");

            migrationBuilder.DropColumn(
                name: "ProfessorId",
                table: "respostas");

            migrationBuilder.DropColumn(
                name: "TurmaId",
                table: "respostas");

            migrationBuilder.CreateIndex(
                name: "IX_respostasquestoes_RespostaId",
                table: "respostasquestoes",
                column: "RespostaId");
        }
    }
}
