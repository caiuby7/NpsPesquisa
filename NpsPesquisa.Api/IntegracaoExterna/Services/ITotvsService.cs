using NpsPesquisa.Api.IntegracaoExterna.Models;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.IntegracaoExterna.Services
{
    /// <summary>
    /// Interface para serviços de integração com TOTVS
    /// </summary>
    public interface ITotvsService
    {
        /// <summary>
        /// Busca todos os alunos do TOTVS
        /// </summary>
        /// <returns>Lista de alunos</returns>
        Task<List<TotvsAluno>> BuscarTodosAlunosAsync();

        /// <summary>
        /// Busca aluno por RA
        /// </summary>
        /// <param name="ra">RA do aluno</param>
        /// <returns>Dados do aluno</returns>
        Task<TotvsAluno?> BuscarAlunoPorRAAsync(string ra);

        /// <summary>
        /// Busca alunos por período letivo
        /// </summary>
        /// <param name="periodoLetivo">Período letivo</param>
        /// <returns>Lista de alunos do período</returns>
        Task<List<TotvsAluno>> BuscarAlunosPorPeriodoAsync(string periodoLetivo);

        /// <summary>
        /// Busca alunos por curso
        /// </summary>
        /// <param name="codigoCurso">Código do curso</param>
        /// <returns>Lista de alunos do curso</returns>
        Task<List<TotvsAluno>> BuscarAlunosPorCursoAsync(string codigoCurso);

        /// <summary>
        /// Busca todos os professores do TOTVS
        /// </summary>
        /// <returns>Lista de professores</returns>
        Task<List<TotvsProfessor>> BuscarTodosProfessoresAsync();

        /// <summary>
        /// Busca professor por login
        /// </summary>
        /// <param name="login">Login do professor</param>
        /// <returns>Dados do professor</returns>
        Task<TotvsProfessor?> BuscarProfessorPorLoginAsync(string login);

        /// <summary>
        /// Busca professores por período letivo
        /// </summary>
        /// <param name="periodoLetivo">Período letivo</param>
        /// <returns>Lista de professores do período</returns>
        Task<List<TotvsProfessor>> BuscarProfessoresPorPeriodoAsync(string periodoLetivo);

        /// <summary>
        /// Busca professores por curso
        /// </summary>
        /// <param name="codigoCurso">Código do curso</param>
        /// <returns>Lista de professores do curso</returns>
        Task<List<TotvsProfessor>> BuscarProfessoresPorCursoAsync(string codigoCurso);

        /// <summary>
        /// Sincroniza dados de alunos do TOTVS com o banco local
        /// </summary>
        /// <param name="periodoLetivo">Período letivo para sincronização</param>
        /// <returns>Número de registros sincronizados</returns>
        Task<int> SincronizarAlunosAsync(string? periodoLetivo = null);

        /// <summary>
        /// Sincroniza dados de professores do TOTVS com o banco local
        /// </summary>
        /// <param name="periodoLetivo">Período letivo para sincronização</param>
        /// <returns>Número de registros sincronizados</returns>
        Task<int> SincronizarProfessoresAsync(string? periodoLetivo = null);

        /// <summary>
        /// Sincroniza dados de instituições do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        Task<int> SincronizarInstituicoesAsync();

        /// <summary>
        /// Sincroniza dados de cursos do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        Task<int> SincronizarCursosAsync();

        /// <summary>
        /// Sincroniza dados de disciplinas do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        Task<int> SincronizarDisciplinasAsync();

        /// <summary>
        /// Sincroniza dados de períodos letivos do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        Task<int> SincronizarPeriodosLetivosAsync();

        /// <summary>
        /// Sincroniza dados de turmas do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        Task<int> SincronizarTurmasAsync();

        /// <summary>
        /// Sincroniza dados de turmas-disciplinas do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        Task<int> SincronizarTurmasDisciplinasAsync();
        Task<int> SincronizarAlunoTurmaDisciplinaAsync();

        /// <summary>
        /// Busca participantes do TOTVS baseado em filtros específicos
        /// </summary>
        /// <param name="periodoLetivo">Período letivo</param>
        /// <param name="cursoId">ID do curso</param>
        /// <param name="turmaId">ID da turma</param>
        /// <param name="disciplinaId">ID da disciplina</param>
        /// <param name="tipoParticipante">Tipo do participante (Aluno/Professor)</param>
        /// <returns>Lista de participantes encontrados</returns>
        Task<List<ParticipanteTotvs>> BuscarParticipantesPorFiltrosAsync(
            string? periodoLetivo = null,
            int? cursoId = null,
            int? turmaId = null,
            int? disciplinaId = null,
            TipoParticipante? tipoParticipante = null);

        /// <summary>
        /// Busca participantes do TOTVS baseado em filtros específicos com tipo de item avaliado
        /// </summary>
        /// <param name="periodoLetivo">Período letivo</param>
        /// <param name="cursoId">ID do curso</param>
        /// <param name="turmaId">ID da turma</param>
        /// <param name="disciplinaId">ID da disciplina</param>
        /// <param name="tipoParticipante">Tipo do participante (Aluno/Professor)</param>
        /// <param name="tipoItemAvaliado">Tipo do item avaliado (TCC, Estagio, etc.)</param>
        /// <returns>Lista de participantes encontrados</returns>
        Task<List<ParticipanteTotvs>> BuscarParticipantesPorFiltrosAsync(
            string? periodoLetivo = null,
            int? cursoId = null,
            int? turmaId = null,
            int? disciplinaId = null,
            TipoParticipante? tipoParticipante = null,
            TipoItemAvaliado? tipoItemAvaliado = null);
    }
}
