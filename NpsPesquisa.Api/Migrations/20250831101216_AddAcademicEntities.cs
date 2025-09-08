using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NpsPesquisa.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAcademicEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ano",
                table: "turmasdisciplinas");

            migrationBuilder.DropColumn(
                name: "Semestre",
                table: "turmasdisciplinas");

            migrationBuilder.DropColumn(
                name: "Ano",
                table: "turmas");

            migrationBuilder.DropColumn(
                name: "DataCriacao",
                table: "turmas");

            migrationBuilder.DropColumn(
                name: "Periodo",
                table: "turmas");

            migrationBuilder.DropColumn(
                name: "CargaHoraria",
                table: "disciplinas");

            migrationBuilder.DropColumn(
                name: "DataCriacao",
                table: "disciplinas");

            migrationBuilder.DropColumn(
                name: "CargaHorariaTotal",
                table: "cursos");

            migrationBuilder.DropColumn(
                name: "CreditosTotal",
                table: "cursos");

            migrationBuilder.DropColumn(
                name: "EmailInstitucional",
                table: "alunos");

            migrationBuilder.RenameColumn(
                name: "Semestre",
                table: "turmas",
                newName: "Turno");

            migrationBuilder.RenameColumn(
                name: "Creditos",
                table: "disciplinas",
                newName: "CursoId");

            migrationBuilder.RenameColumn(
                name: "DuracaoSemestres",
                table: "cursos",
                newName: "InstituicaoId");

            migrationBuilder.RenameColumn(
                name: "DataCriacao",
                table: "cursos",
                newName: "DataCadastro");

            migrationBuilder.RenameColumn(
                name: "PeriodoLetivo",
                table: "alunos",
                newName: "TurmaIntegracaoId");

            migrationBuilder.RenameColumn(
                name: "NivelEnsino",
                table: "alunos",
                newName: "PeriodoLetivoIntegracaoId");

            migrationBuilder.RenameColumn(
                name: "Fone",
                table: "alunos",
                newName: "Telefone");

            migrationBuilder.RenameColumn(
                name: "Filial",
                table: "alunos",
                newName: "IntegracaoId");

            migrationBuilder.AddColumn<bool>(
                name: "Gerenciada",
                table: "turmasdisciplinas",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "IdTurmaDisciplinaGerenciada",
                table: "turmasdisciplinas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "IntegracaoId",
                table: "turmasdisciplinas",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "PeriodoLetivoId",
                table: "turmasdisciplinas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TurmaDisciplinaGerenciadaId",
                table: "turmasdisciplinas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "IntegracaoId",
                table: "turmas",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "PeriodoLetivoId",
                table: "turmas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "questionarios",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CursoIntegracaoId",
                table: "professores",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "DisciplinaIntegracaoId",
                table: "professores",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "InstituicaoIntegracaoId",
                table: "professores",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "IntegracaoId",
                table: "professores",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Login",
                table: "professores",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PeriodoLetivoIntegracaoId",
                table: "professores",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "Sexo",
                table: "professores",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TipoProfessor",
                table: "professores",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TurmaIntegracaoId",
                table: "professores",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataConvite",
                table: "participantesquestionarios",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DataResposta",
                table: "participantesquestionarios",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "participantesquestionarios",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Semestre",
                table: "participantes",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "CoordenadorId",
                table: "itensavaliadosquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CursoId",
                table: "itensavaliadosquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisciplinaId",
                table: "itensavaliadosquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProfessorId",
                table: "itensavaliadosquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TurmaDisciplinaId",
                table: "itensavaliadosquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TurmaId",
                table: "itensavaliadosquestionarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InstituicaoId",
                table: "disciplinas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "idInstituicao",
                table: "disciplinas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "cursos",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(500)",
                oldMaxLength: 500,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "cursos",
                keyColumn: "Codigo",
                keyValue: null,
                column: "Codigo",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "cursos",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "CodigoFilial",
                table: "cursos",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "IntegracaoId",
                table: "cursos",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "Modalidade",
                table: "cursos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TipoCurso",
                table: "cursos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "Turno",
                table: "alunos",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(50)",
                oldMaxLength: 50,
                oldNullable: true)
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Cpf",
                table: "alunos",
                type: "varchar(14)",
                maxLength: 14,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "CursoIntegracaoId",
                table: "alunos",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataIngressoCurso",
                table: "alunos",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataMatricula",
                table: "alunos",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataNascimento",
                table: "alunos",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Fase",
                table: "alunos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "alunos",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Habilitacao",
                table: "alunos",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "InstituicaoId",
                table: "alunos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "InstituicaoIntegracaoId",
                table: "alunos",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "PeriodoLetivoId",
                table: "alunos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Sexo",
                table: "alunos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TipoMatricula",
                table: "alunos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TurmaAtiva",
                table: "alunos",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "AlunoTurmaDisciplina",
                columns: table => new
                {
                    AlunosAlunoId = table.Column<int>(type: "int", nullable: false),
                    TurmasDisciplinasId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlunoTurmaDisciplina", x => new { x.AlunosAlunoId, x.TurmasDisciplinasId });
                    table.ForeignKey(
                        name: "FK_AlunoTurmaDisciplina_alunos_AlunosAlunoId",
                        column: x => x.AlunosAlunoId,
                        principalTable: "alunos",
                        principalColumn: "AlunoId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AlunoTurmaDisciplina_turmasdisciplinas_TurmasDisciplinasId",
                        column: x => x.TurmasDisciplinasId,
                        principalTable: "turmasdisciplinas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "instituicoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Nome = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Descricao = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IntegracaoId = table.Column<int>(type: "int", nullable: false),
                    Ativo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_instituicoes", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "periodosletivos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Nome = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Codigo = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TipoCurso = table.Column<int>(type: "int", nullable: false),
                    Ativo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_periodosletivos", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_turmasdisciplinas_PeriodoLetivoId",
                table: "turmasdisciplinas",
                column: "PeriodoLetivoId");

            migrationBuilder.CreateIndex(
                name: "IX_turmasdisciplinas_TurmaDisciplinaGerenciadaId",
                table: "turmasdisciplinas",
                column: "TurmaDisciplinaGerenciadaId");

            migrationBuilder.CreateIndex(
                name: "IX_turmas_PeriodoLetivoId",
                table: "turmas",
                column: "PeriodoLetivoId");

            migrationBuilder.CreateIndex(
                name: "IX_itensavaliadosquestionarios_CoordenadorId",
                table: "itensavaliadosquestionarios",
                column: "CoordenadorId");

            migrationBuilder.CreateIndex(
                name: "IX_itensavaliadosquestionarios_CursoId",
                table: "itensavaliadosquestionarios",
                column: "CursoId");

            migrationBuilder.CreateIndex(
                name: "IX_itensavaliadosquestionarios_DisciplinaId",
                table: "itensavaliadosquestionarios",
                column: "DisciplinaId");

            migrationBuilder.CreateIndex(
                name: "IX_itensavaliadosquestionarios_ProfessorId",
                table: "itensavaliadosquestionarios",
                column: "ProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_itensavaliadosquestionarios_TurmaDisciplinaId",
                table: "itensavaliadosquestionarios",
                column: "TurmaDisciplinaId");

            migrationBuilder.CreateIndex(
                name: "IX_itensavaliadosquestionarios_TurmaId",
                table: "itensavaliadosquestionarios",
                column: "TurmaId");

            migrationBuilder.CreateIndex(
                name: "IX_disciplinas_CursoId",
                table: "disciplinas",
                column: "CursoId");

            migrationBuilder.CreateIndex(
                name: "IX_disciplinas_InstituicaoId",
                table: "disciplinas",
                column: "InstituicaoId");

            migrationBuilder.CreateIndex(
                name: "IX_cursos_InstituicaoId",
                table: "cursos",
                column: "InstituicaoId");

            migrationBuilder.CreateIndex(
                name: "IX_alunos_InstituicaoId",
                table: "alunos",
                column: "InstituicaoId");

            migrationBuilder.CreateIndex(
                name: "IX_alunos_PeriodoLetivoId",
                table: "alunos",
                column: "PeriodoLetivoId");

            migrationBuilder.CreateIndex(
                name: "IX_AlunoTurmaDisciplina_TurmasDisciplinasId",
                table: "AlunoTurmaDisciplina",
                column: "TurmasDisciplinasId");

            migrationBuilder.AddForeignKey(
                name: "FK_alunos_instituicoes_InstituicaoId",
                table: "alunos",
                column: "InstituicaoId",
                principalTable: "instituicoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_alunos_periodosletivos_PeriodoLetivoId",
                table: "alunos",
                column: "PeriodoLetivoId",
                principalTable: "periodosletivos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_cursos_instituicoes_InstituicaoId",
                table: "cursos",
                column: "InstituicaoId",
                principalTable: "instituicoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_disciplinas_cursos_CursoId",
                table: "disciplinas",
                column: "CursoId",
                principalTable: "cursos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_disciplinas_instituicoes_InstituicaoId",
                table: "disciplinas",
                column: "InstituicaoId",
                principalTable: "instituicoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_itensavaliadosquestionarios_coordenadores_CoordenadorId",
                table: "itensavaliadosquestionarios",
                column: "CoordenadorId",
                principalTable: "coordenadores",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_itensavaliadosquestionarios_cursos_CursoId",
                table: "itensavaliadosquestionarios",
                column: "CursoId",
                principalTable: "cursos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_itensavaliadosquestionarios_disciplinas_DisciplinaId",
                table: "itensavaliadosquestionarios",
                column: "DisciplinaId",
                principalTable: "disciplinas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_itensavaliadosquestionarios_professores_ProfessorId",
                table: "itensavaliadosquestionarios",
                column: "ProfessorId",
                principalTable: "professores",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_itensavaliadosquestionarios_turmas_TurmaId",
                table: "itensavaliadosquestionarios",
                column: "TurmaId",
                principalTable: "turmas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_itensavaliadosquestionarios_turmasdisciplinas_TurmaDisciplin~",
                table: "itensavaliadosquestionarios",
                column: "TurmaDisciplinaId",
                principalTable: "turmasdisciplinas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_turmas_periodosletivos_PeriodoLetivoId",
                table: "turmas",
                column: "PeriodoLetivoId",
                principalTable: "periodosletivos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_turmasdisciplinas_periodosletivos_PeriodoLetivoId",
                table: "turmasdisciplinas",
                column: "PeriodoLetivoId",
                principalTable: "periodosletivos",
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_alunos_instituicoes_InstituicaoId",
                table: "alunos");

            migrationBuilder.DropForeignKey(
                name: "FK_alunos_periodosletivos_PeriodoLetivoId",
                table: "alunos");

            migrationBuilder.DropForeignKey(
                name: "FK_cursos_instituicoes_InstituicaoId",
                table: "cursos");

            migrationBuilder.DropForeignKey(
                name: "FK_disciplinas_cursos_CursoId",
                table: "disciplinas");

            migrationBuilder.DropForeignKey(
                name: "FK_disciplinas_instituicoes_InstituicaoId",
                table: "disciplinas");

            migrationBuilder.DropForeignKey(
                name: "FK_itensavaliadosquestionarios_coordenadores_CoordenadorId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropForeignKey(
                name: "FK_itensavaliadosquestionarios_cursos_CursoId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropForeignKey(
                name: "FK_itensavaliadosquestionarios_disciplinas_DisciplinaId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropForeignKey(
                name: "FK_itensavaliadosquestionarios_professores_ProfessorId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropForeignKey(
                name: "FK_itensavaliadosquestionarios_turmas_TurmaId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropForeignKey(
                name: "FK_itensavaliadosquestionarios_turmasdisciplinas_TurmaDisciplin~",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropForeignKey(
                name: "FK_turmas_periodosletivos_PeriodoLetivoId",
                table: "turmas");

            migrationBuilder.DropForeignKey(
                name: "FK_turmasdisciplinas_periodosletivos_PeriodoLetivoId",
                table: "turmasdisciplinas");

            migrationBuilder.DropForeignKey(
                name: "FK_turmasdisciplinas_turmasdisciplinas_TurmaDisciplinaGerenciad~",
                table: "turmasdisciplinas");

            migrationBuilder.DropTable(
                name: "AlunoTurmaDisciplina");

            migrationBuilder.DropTable(
                name: "instituicoes");

            migrationBuilder.DropTable(
                name: "periodosletivos");

            migrationBuilder.DropIndex(
                name: "IX_turmasdisciplinas_PeriodoLetivoId",
                table: "turmasdisciplinas");

            migrationBuilder.DropIndex(
                name: "IX_turmasdisciplinas_TurmaDisciplinaGerenciadaId",
                table: "turmasdisciplinas");

            migrationBuilder.DropIndex(
                name: "IX_turmas_PeriodoLetivoId",
                table: "turmas");

            migrationBuilder.DropIndex(
                name: "IX_itensavaliadosquestionarios_CoordenadorId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropIndex(
                name: "IX_itensavaliadosquestionarios_CursoId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropIndex(
                name: "IX_itensavaliadosquestionarios_DisciplinaId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropIndex(
                name: "IX_itensavaliadosquestionarios_ProfessorId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropIndex(
                name: "IX_itensavaliadosquestionarios_TurmaDisciplinaId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropIndex(
                name: "IX_itensavaliadosquestionarios_TurmaId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropIndex(
                name: "IX_disciplinas_CursoId",
                table: "disciplinas");

            migrationBuilder.DropIndex(
                name: "IX_disciplinas_InstituicaoId",
                table: "disciplinas");

            migrationBuilder.DropIndex(
                name: "IX_cursos_InstituicaoId",
                table: "cursos");

            migrationBuilder.DropIndex(
                name: "IX_alunos_InstituicaoId",
                table: "alunos");

            migrationBuilder.DropIndex(
                name: "IX_alunos_PeriodoLetivoId",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "Gerenciada",
                table: "turmasdisciplinas");

            migrationBuilder.DropColumn(
                name: "IdTurmaDisciplinaGerenciada",
                table: "turmasdisciplinas");

            migrationBuilder.DropColumn(
                name: "IntegracaoId",
                table: "turmasdisciplinas");

            migrationBuilder.DropColumn(
                name: "PeriodoLetivoId",
                table: "turmasdisciplinas");

            migrationBuilder.DropColumn(
                name: "TurmaDisciplinaGerenciadaId",
                table: "turmasdisciplinas");

            migrationBuilder.DropColumn(
                name: "IntegracaoId",
                table: "turmas");

            migrationBuilder.DropColumn(
                name: "PeriodoLetivoId",
                table: "turmas");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "questionarios");

            migrationBuilder.DropColumn(
                name: "CursoIntegracaoId",
                table: "professores");

            migrationBuilder.DropColumn(
                name: "DisciplinaIntegracaoId",
                table: "professores");

            migrationBuilder.DropColumn(
                name: "InstituicaoIntegracaoId",
                table: "professores");

            migrationBuilder.DropColumn(
                name: "IntegracaoId",
                table: "professores");

            migrationBuilder.DropColumn(
                name: "Login",
                table: "professores");

            migrationBuilder.DropColumn(
                name: "PeriodoLetivoIntegracaoId",
                table: "professores");

            migrationBuilder.DropColumn(
                name: "Sexo",
                table: "professores");

            migrationBuilder.DropColumn(
                name: "TipoProfessor",
                table: "professores");

            migrationBuilder.DropColumn(
                name: "TurmaIntegracaoId",
                table: "professores");

            migrationBuilder.DropColumn(
                name: "DataConvite",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "DataResposta",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "participantesquestionarios");

            migrationBuilder.DropColumn(
                name: "CoordenadorId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropColumn(
                name: "CursoId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropColumn(
                name: "DisciplinaId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropColumn(
                name: "ProfessorId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropColumn(
                name: "TurmaDisciplinaId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropColumn(
                name: "TurmaId",
                table: "itensavaliadosquestionarios");

            migrationBuilder.DropColumn(
                name: "InstituicaoId",
                table: "disciplinas");

            migrationBuilder.DropColumn(
                name: "idInstituicao",
                table: "disciplinas");

            migrationBuilder.DropColumn(
                name: "CodigoFilial",
                table: "cursos");

            migrationBuilder.DropColumn(
                name: "IntegracaoId",
                table: "cursos");

            migrationBuilder.DropColumn(
                name: "Modalidade",
                table: "cursos");

            migrationBuilder.DropColumn(
                name: "TipoCurso",
                table: "cursos");

            migrationBuilder.DropColumn(
                name: "Cpf",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "CursoIntegracaoId",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "DataIngressoCurso",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "DataMatricula",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "DataNascimento",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "Fase",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "Habilitacao",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "InstituicaoId",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "InstituicaoIntegracaoId",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "PeriodoLetivoId",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "Sexo",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "TipoMatricula",
                table: "alunos");

            migrationBuilder.DropColumn(
                name: "TurmaAtiva",
                table: "alunos");

            migrationBuilder.RenameColumn(
                name: "Turno",
                table: "turmas",
                newName: "Semestre");

            migrationBuilder.RenameColumn(
                name: "CursoId",
                table: "disciplinas",
                newName: "Creditos");

            migrationBuilder.RenameColumn(
                name: "InstituicaoId",
                table: "cursos",
                newName: "DuracaoSemestres");

            migrationBuilder.RenameColumn(
                name: "DataCadastro",
                table: "cursos",
                newName: "DataCriacao");

            migrationBuilder.RenameColumn(
                name: "TurmaIntegracaoId",
                table: "alunos",
                newName: "PeriodoLetivo");

            migrationBuilder.RenameColumn(
                name: "Telefone",
                table: "alunos",
                newName: "Fone");

            migrationBuilder.RenameColumn(
                name: "PeriodoLetivoIntegracaoId",
                table: "alunos",
                newName: "NivelEnsino");

            migrationBuilder.RenameColumn(
                name: "IntegracaoId",
                table: "alunos",
                newName: "Filial");

            migrationBuilder.AddColumn<int>(
                name: "Ano",
                table: "turmasdisciplinas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Semestre",
                table: "turmasdisciplinas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Ano",
                table: "turmas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCriacao",
                table: "turmas",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "Periodo",
                table: "turmas",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Semestre",
                table: "participantes",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "CargaHoraria",
                table: "disciplinas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCriacao",
                table: "disciplinas",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "cursos",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "cursos",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "CargaHorariaTotal",
                table: "cursos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreditosTotal",
                table: "cursos",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Turno",
                table: "alunos",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "EmailInstitucional",
                table: "alunos",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
