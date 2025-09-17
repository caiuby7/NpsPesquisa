using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NpsPesquisa.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRAColumnToAlunos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // NÃO remover o índice IX_respostasquestoes_RespostaId
            // pois ele é necessário para a chave estrangeira FK_respostasquestoes_respostas_RespostaId
            // migrationBuilder.DropIndex(
            //     name: "IX_respostasquestoes_RespostaId",
            //     table: "respostasquestoes");

            // A coluna Matricula permanece no banco de dados
            // A propriedade RA no modelo C# é [NotMapped] e retorna o valor de Matricula

            migrationBuilder.AddColumn<string>(
                name: "Codigo",
                table: "turmas",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "CursoId",
                table: "respostasquestoes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisciplinaId",
                table: "respostasquestoes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InstituicaoId",
                table: "respostasquestoes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ItemAvaliadoId",
                table: "respostasquestoes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProfessorId",
                table: "respostasquestoes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TurmaId",
                table: "respostasquestoes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CursoId",
                table: "participantesquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisciplinaId",
                table: "participantesquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InstituicaoId",
                table: "participantesquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ItemAvaliadoId",
                table: "participantesquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NomeItemEspecifico",
                table: "participantesquestionarios",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "PeriodoLetivoId",
                table: "participantesquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProfessorId",
                table: "participantesquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TipoItemAvaliado",
                table: "participantesquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TurmaId",
                table: "participantesquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Codigo",
                table: "instituicoes",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_respostasquestoes_CursoId",
                table: "respostasquestoes",
                column: "CursoId");

            migrationBuilder.CreateIndex(
                name: "IX_respostasquestoes_DisciplinaId",
                table: "respostasquestoes",
                column: "DisciplinaId");

            migrationBuilder.CreateIndex(
                name: "IX_respostasquestoes_InstituicaoId",
                table: "respostasquestoes",
                column: "InstituicaoId");

            migrationBuilder.CreateIndex(
                name: "IX_respostasquestoes_ItemAvaliadoId",
                table: "respostasquestoes",
                column: "ItemAvaliadoId");

            migrationBuilder.CreateIndex(
                name: "IX_respostasquestoes_ProfessorId",
                table: "respostasquestoes",
                column: "ProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_respostasquestoes_RespostaId_QuestaoId_ItemAvaliadoId",
                table: "respostasquestoes",
                columns: new[] { "RespostaId", "QuestaoId", "ItemAvaliadoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_respostasquestoes_TurmaId",
                table: "respostasquestoes",
                column: "TurmaId");

            migrationBuilder.CreateIndex(
                name: "IX_participantesquestionarios_CursoId",
                table: "participantesquestionarios",
                column: "CursoId");

            migrationBuilder.CreateIndex(
                name: "IX_participantesquestionarios_DisciplinaId",
                table: "participantesquestionarios",
                column: "DisciplinaId");

            migrationBuilder.CreateIndex(
                name: "IX_participantesquestionarios_InstituicaoId",
                table: "participantesquestionarios",
                column: "InstituicaoId");

            migrationBuilder.CreateIndex(
                name: "IX_participantesquestionarios_PeriodoLetivoId",
                table: "participantesquestionarios",
                column: "PeriodoLetivoId");

            migrationBuilder.CreateIndex(
                name: "IX_participantesquestionarios_ProfessorId",
                table: "participantesquestionarios",
                column: "ProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_participantesquestionarios_TurmaId",
                table: "participantesquestionarios",
                column: "TurmaId");

            migrationBuilder.AddForeignKey(
                name: "FK_participantesquestionarios_cursos_CursoId",
                table: "participantesquestionarios",
                column: "CursoId",
                principalTable: "cursos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_participantesquestionarios_disciplinas_DisciplinaId",
                table: "participantesquestionarios",
                column: "DisciplinaId",
                principalTable: "disciplinas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_participantesquestionarios_instituicoes_InstituicaoId",
                table: "participantesquestionarios",
                column: "InstituicaoId",
                principalTable: "instituicoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_participantesquestionarios_periodosletivos_PeriodoLetivoId",
                table: "participantesquestionarios",
                column: "PeriodoLetivoId",
                principalTable: "periodosletivos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_participantesquestionarios_professores_ProfessorId",
                table: "participantesquestionarios",
                column: "ProfessorId",
                principalTable: "professores",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_participantesquestionarios_turmas_TurmaId",
                table: "participantesquestionarios",
                column: "TurmaId",
                principalTable: "turmas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_respostasquestoes_cursos_CursoId",
                table: "respostasquestoes",
                column: "CursoId",
                principalTable: "cursos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_respostasquestoes_disciplinas_DisciplinaId",
                table: "respostasquestoes",
                column: "DisciplinaId",
                principalTable: "disciplinas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_respostasquestoes_instituicoes_InstituicaoId",
                table: "respostasquestoes",
                column: "InstituicaoId",
                principalTable: "instituicoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_respostasquestoes_professores_ProfessorId",
                table: "respostasquestoes",
                column: "ProfessorId",
                principalTable: "professores",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_respostasquestoes_turmas_TurmaId",
                table: "respostasquestoes",
                column: "TurmaId",
                principalTable: "turmas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_participantesquestionarios_cursos_CursoId",
                table: "participantesquestionarios");

            migrationBuilder.DropForeignKey(
                name: "FK_participantesquestionarios_disciplinas_DisciplinaId",
                table: "participantesquestionarios");

            migrationBuilder.DropForeignKey(
                name: "FK_participantesquestionarios_instituicoes_InstituicaoId",
                table: "participantesquestionarios");

            migrationBuilder.DropForeignKey(
                name: "FK_participantesquestionarios_periodosletivos_PeriodoLetivoId",
                table: "participantesquestionarios");

            migrationBuilder.DropForeignKey(
                name: "FK_participantesquestionarios_professores_ProfessorId",
                table: "participantesquestionarios");

            migrationBuilder.DropForeignKey(
                name: "FK_participantesquestionarios_turmas_TurmaId",
                table: "participantesquestionarios");

            migrationBuilder.DropForeignKey(
                name: "FK_respostasquestoes_cursos_CursoId",
                table: "respostasquestoes");

            migrationBuilder.DropForeignKey(
                name: "FK_respostasquestoes_disciplinas_DisciplinaId",
                table: "respostasquestoes");

            migrationBuilder.DropForeignKey(
                name: "FK_respostasquestoes_instituicoes_InstituicaoId",
                table: "respostasquestoes");

            migrationBuilder.DropForeignKey(
                name: "FK_respostasquestoes_professores_ProfessorId",
                table: "respostasquestoes");

            migrationBuilder.DropForeignKey(
                name: "FK_respostasquestoes_turmas_TurmaId",
                table: "respostasquestoes");

            migrationBuilder.DropIndex(
                name: "IX_respostasquestoes_CursoId",
                table: "respostasquestoes");

            migrationBuilder.DropIndex(
                name: "IX_respostasquestoes_DisciplinaId",
                table: "respostasquestoes");

            migrationBuilder.DropIndex(
                name: "IX_respostasquestoes_InstituicaoId",
                table: "respostasquestoes");

            migrationBuilder.DropIndex(
                name: "IX_respostasquestoes_ItemAvaliadoId",
                table: "respostasquestoes");

            migrationBuilder.DropIndex(
                name: "IX_respostasquestoes_ProfessorId",
                table: "respostasquestoes");

            migrationBuilder.DropIndex(
                name: "IX_respostasquestoes_RespostaId_QuestaoId_ItemAvaliadoId",
                table: "respostasquestoes");

            migrationBuilder.DropIndex(
                name: "IX_respostasquestoes_TurmaId",
                table: "respostasquestoes");

            migrationBuilder.DropIndex(
                name: "IX_participantesquestionarios_CursoId",
                table: "participantesquestionarios");

            migrationBuilder.DropIndex(
                name: "IX_participantesquestionarios_DisciplinaId",
                table: "participantesquestionarios");

            migrationBuilder.DropIndex(
                name: "IX_participantesquestionarios_InstituicaoId",
                table: "participantesquestionarios");

            migrationBuilder.DropIndex(
                name: "IX_participantesquestionarios_PeriodoLetivoId",
                table: "participantesquestionarios");

            migrationBuilder.DropIndex(
                name: "IX_participantesquestionarios_ProfessorId",
                table: "participantesquestionarios");

            migrationBuilder.DropIndex(
                name: "IX_participantesquestionarios_TurmaId",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "turmas");

            migrationBuilder.DropColumn(
                name: "CursoId",
                table: "respostasquestoes");

            migrationBuilder.DropColumn(
                name: "DisciplinaId",
                table: "respostasquestoes");

            migrationBuilder.DropColumn(
                name: "InstituicaoId",
                table: "respostasquestoes");

            migrationBuilder.DropColumn(
                name: "ItemAvaliadoId",
                table: "respostasquestoes");

            migrationBuilder.DropColumn(
                name: "ProfessorId",
                table: "respostasquestoes");

            migrationBuilder.DropColumn(
                name: "TurmaId",
                table: "respostasquestoes");

            migrationBuilder.DropColumn(
                name: "CursoId",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "DisciplinaId",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "InstituicaoId",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "ItemAvaliadoId",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "NomeItemEspecifico",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "PeriodoLetivoId",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "ProfessorId",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "TipoItemAvaliado",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "TurmaId",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "instituicoes");

            // A coluna Matricula permanece no banco de dados
            // Não é necessário alterar a estrutura da tabela alunos

            // O índice IX_respostasquestoes_RespostaId já existe e não foi removido
            // portanto não precisa ser recriado
            // migrationBuilder.CreateIndex(
            //     name: "IX_respostasquestoes_RespostaId",
            //     table: "respostasquestoes",
            //     column: "RespostaId");
        }
    }
}
