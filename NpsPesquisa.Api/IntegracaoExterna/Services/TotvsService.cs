using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.IntegracaoExterna.Models;
using NpsPesquisa.Api.Models;
using Oracle.ManagedDataAccess.Client;

namespace NpsPesquisa.Api.IntegracaoExterna.Services
{
    /// <summary>
    /// Serviço para integração com TOTVS
    /// </summary>
    public class TotvsService : ITotvsService
    {
        private readonly NpsDbContext _context;
        private readonly ILogger<TotvsService> _logger;
        private readonly IConfiguration _configuration;

        public TotvsService(NpsDbContext context, ILogger<TotvsService> logger, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        #region Alunos

        public async Task<List<TotvsAluno>> BuscarTodosAlunosAsync()
        {
            var alunos = new List<TotvsAluno>();
            var query = "SELECT PERIODO_LETIVO, NIVEL_ENSINO, CODFILIAL, FILIAL_NOME, CODIGO_PESSOA, RA, NOME, CPF, NASCIMENTO_ALUNO, EMAIL, EMAIL_PESSOAL, SEXO, DT_NASC, COD_STATUS_NA_DISCIPLINA, STATUS_NA_DISCIPLINA, TIPO_MATRICULA, DATA_MATRICULA, IDTURMADISC, CODIGO_DISCIPLINA, CODTURMA, COD_CURSO_DA_TURMA, CURSO_DA_TURMA, FASE, NOME_DISCIPLINA, TIPO_TURMA, STATUS_NO_PERIODO_LETIVO, COD_CURSO_DO_ALUNO, CURSO_DO_ALUNO, FILIAL, GRADE_DO_ALUNO, HABILITACAO_DO_ALUNO, INGRESSO_NO_CURSO, TURNO_POLO, TURMA_ATIVA FROM V_ALUNOS";

            try
            {
                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    alunos.Add(MapAlunoFromReader(reader));
                }
            }
            catch (OracleException oracleEx)
            {
                _logger.LogError(oracleEx, "Erro Oracle ao buscar alunos do TOTVS. Código: {Code}, Mensagem: {Message}", 
                    oracleEx.Number, oracleEx.Message);
                
                // Retry para erros de conectividade
                if (oracleEx.Number == 12541 || oracleEx.Number == 12535 || oracleEx.Number == 12170)
                {
                    _logger.LogWarning("Tentando reconectar ao Oracle TOTVS...");
                    await Task.Delay(2000); // Aguardar 2 segundos antes de tentar novamente
                    throw new InvalidOperationException("Serviço TOTVS temporariamente indisponível. Tente novamente em alguns instantes.", oracleEx);
                }
                
                throw;
            }
            catch (System.Net.Sockets.SocketException socketEx)
            {
                _logger.LogError(socketEx, "Erro de conectividade ao tentar conectar ao Oracle TOTVS. SocketError: {SocketError}", 
                    socketEx.SocketErrorCode);
                throw new InvalidOperationException("Não foi possível conectar ao servidor TOTVS. Verifique a conectividade de rede.", socketEx);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao buscar alunos do TOTVS");
                throw;
            }

            return alunos;
        }

        public async Task<TotvsAluno?> BuscarAlunoPorRAAsync(string ra)
        {
            var query = "SELECT PERIODO_LETIVO, NIVEL_ENSINO, CODFILIAL, FILIAL_NOME, CODIGO_PESSOA, RA, NOME, CPF, NASCIMENTO_ALUNO, EMAIL, EMAIL_PESSOAL, SEXO, DT_NASC, COD_STATUS_NA_DISCIPLINA, STATUS_NA_DISCIPLINA, TIPO_MATRICULA, DATA_MATRICULA, IDTURMADISC, CODIGO_DISCIPLINA, CODTURMA, COD_CURSO_DA_TURMA, CURSO_DA_TURMA, FASE, NOME_DISCIPLINA, TIPO_TURMA, STATUS_NO_PERIODO_LETIVO, COD_CURSO_DO_ALUNO, CURSO_DO_ALUNO, FILIAL, GRADE_DO_ALUNO, HABILITACAO_DO_ALUNO, INGRESSO_NO_CURSO, TURNO_POLO, TURMA_ATIVA FROM V_ALUNOS WHERE RA = :ra";

            try
            {
                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                command.Parameters.Add(new OracleParameter(":ra", ra));
                using var reader = await command.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    return MapAlunoFromReader(reader);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar aluno por RA: {RA}", ra);
                throw;
            }

            return null;
        }

        public async Task<List<TotvsAluno>> BuscarAlunosPorPeriodoAsync(string periodoLetivo)
        {
            var alunos = new List<TotvsAluno>();
            var query = "SELECT PERIODO_LETIVO, NIVEL_ENSINO, CODFILIAL, FILIAL_NOME, CODIGO_PESSOA, RA, NOME, CPF, NASCIMENTO_ALUNO, EMAIL, EMAIL_PESSOAL, SEXO, DT_NASC, COD_STATUS_NA_DISCIPLINA, STATUS_NA_DISCIPLINA, TIPO_MATRICULA, DATA_MATRICULA, IDTURMADISC, CODIGO_DISCIPLINA, CODTURMA, COD_CURSO_DA_TURMA, CURSO_DA_TURMA, FASE, NOME_DISCIPLINA, TIPO_TURMA, STATUS_NO_PERIODO_LETIVO, COD_CURSO_DO_ALUNO, CURSO_DO_ALUNO, FILIAL, GRADE_DO_ALUNO, HABILITACAO_DO_ALUNO, INGRESSO_NO_CURSO, TURNO_POLO, TURMA_ATIVA FROM V_ALUNOS WHERE PERIODO_LETIVO = :periodoLetivo";

            try
            {
                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                command.Parameters.Add(new OracleParameter(":periodoLetivo", periodoLetivo));
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    alunos.Add(MapAlunoFromReader(reader));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar alunos por período: {PeriodoLetivo}", periodoLetivo);
                throw;
            }

            return alunos;
        }

        public async Task<List<TotvsAluno>> BuscarAlunosPorCursoAsync(string codigoCurso)
        {
            var alunos = new List<TotvsAluno>();
            var query = "SELECT PERIODO_LETIVO, NIVEL_ENSINO, CODFILIAL, FILIAL_NOME, CODIGO_PESSOA, RA, NOME, CPF, NASCIMENTO_ALUNO, EMAIL, EMAIL_PESSOAL, SEXO, DT_NASC, COD_STATUS_NA_DISCIPLINA, STATUS_NA_DISCIPLINA, TIPO_MATRICULA, DATA_MATRICULA, IDTURMADISC, CODIGO_DISCIPLINA, CODTURMA, COD_CURSO_DA_TURMA, CURSO_DA_TURMA, FASE, NOME_DISCIPLINA, TIPO_TURMA, STATUS_NO_PERIODO_LETIVO, COD_CURSO_DO_ALUNO, CURSO_DO_ALUNO, FILIAL, GRADE_DO_ALUNO, HABILITACAO_DO_ALUNO, INGRESSO_NO_CURSO, TURNO_POLO, TURMA_ATIVA FROM V_ALUNOS WHERE COD_CURSO_DO_ALUNO = :codigoCurso";

            try
            {
                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                command.Parameters.Add(new OracleParameter(":codigoCurso", codigoCurso));
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    alunos.Add(MapAlunoFromReader(reader));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar alunos por curso: {CodigoCurso}", codigoCurso);
                throw;
            }

            return alunos;
        }

        #endregion

        #region Professores

        public async Task<List<TotvsProfessor>> BuscarTodosProfessoresAsync()
        {
            var professores = new List<TotvsProfessor>();
            var query = "SELECT PERIODO_LETIVO, COD_FILIAL, FILIAL_NOME, NIVEL_ENSINO, COD_CURSO, HAB, MATRIZ, CURSO, COD_TURMA, TURMA_GERENCIAL, IDTURMADISC, IDTURMADISCGERENCIADA, COD_DISC, DISCIPLINA, TURNO_POLO, SEXO, PROFESSOR, TIPO_PROF_TURMA, TURMA_ATIVA, TIPO_TURMA, LOGIN, EMAIL, COORDENADORATUAL, PROF_ATIVO FROM V_PROFESSORES";

            try
            {
                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    professores.Add(MapProfessorFromReader(reader));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar professores do TOTVS");
                throw;
            }

            return professores;
        }

        public async Task<TotvsProfessor?> BuscarProfessorPorLoginAsync(string login)
        {
            var query = "SELECT PERIODO_LETIVO, COD_FILIAL, FILIAL_NOME, NIVEL_ENSINO, COD_CURSO, HAB, MATRIZ, CURSO, COD_TURMA, TURMA_GERENCIAL, IDTURMADISC, IDTURMADISCGERENCIADA, COD_DISC, DISCIPLINA, TURNO_POLO, SEXO, PROFESSOR, TIPO_PROF_TURMA, TURMA_ATIVA, TIPO_TURMA, LOGIN, EMAIL, COORDENADORATUAL, PROF_ATIVO FROM V_PROFESSORES WHERE LOGIN = :login";

            try
            {
                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                command.Parameters.Add(new OracleParameter(":login", login));
                using var reader = await command.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    return MapProfessorFromReader(reader);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar professor por login: {Login}", login);
                throw;
            }

            return null;
        }

        public async Task<List<TotvsProfessor>> BuscarProfessoresPorPeriodoAsync(string periodoLetivo)
        {
            var professores = new List<TotvsProfessor>();
            var query = "SELECT PERIODO_LETIVO, COD_FILIAL, FILIAL_NOME, NIVEL_ENSINO, COD_CURSO, HAB, MATRIZ, CURSO, COD_TURMA, TURMA_GERENCIAL, IDTURMADISC, IDTURMADISCGERENCIADA, COD_DISC, DISCIPLINA, TURNO_POLO, SEXO, PROFESSOR, TIPO_PROF_TURMA, TURMA_ATIVA, TIPO_TURMA, LOGIN, EMAIL, COORDENADORATUAL, PROF_ATIVO FROM V_PROFESSORES WHERE PERIODO_LETIVO = :periodoLetivo";

            try
            {
                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                command.Parameters.Add(new OracleParameter(":periodoLetivo", periodoLetivo));
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    professores.Add(MapProfessorFromReader(reader));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar professores por período: {PeriodoLetivo}", periodoLetivo);
                throw;
            }

            return professores;
        }

        public async Task<List<TotvsProfessor>> BuscarProfessoresPorCursoAsync(string codigoCurso)
        {
            var professores = new List<TotvsProfessor>();
            var query = "SELECT PERIODO_LETIVO, COD_FILIAL, FILIAL_NOME, NIVEL_ENSINO, COD_CURSO, HAB, MATRIZ, CURSO, COD_TURMA, TURMA_GERENCIAL, IDTURMADISC, IDTURMADISCGERENCIADA, COD_DISC, DISCIPLINA, TURNO_POLO, SEXO, PROFESSOR, TIPO_PROF_TURMA, TURMA_ATIVA, TIPO_TURMA, LOGIN, EMAIL, COORDENADORATUAL, PROF_ATIVO FROM V_PROFESSORES WHERE COD_CURSO = :codigoCurso";

            try
            {
                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                command.Parameters.Add(new OracleParameter(":codigoCurso", codigoCurso));
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    professores.Add(MapProfessorFromReader(reader));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar professores por curso: {CodigoCurso}", codigoCurso);
                throw;
            }

            return professores;
        }

        #endregion

        #region Sincronização

        public async Task<int> SincronizarAlunosAsync(string? periodoLetivo = null)
        {
            var alunosTotvs = periodoLetivo != null 
                ? await BuscarAlunosPorPeriodoAsync(periodoLetivo)
                : await BuscarTodosAlunosAsync();

            // Agrupar por RA para evitar duplicatas de aluno
            var alunosAgrupados = alunosTotvs
                .Where(a => !string.IsNullOrEmpty(a.RA)) // Filtrar alunos com RA válido
                .GroupBy(a => a.RA)
                .Select(g => new {
                    Aluno = g.First(), // Dados únicos do aluno
                    TurmasDisciplinas = g.ToList() // Todas as turmas-disciplinas
                });

            var registrosSincronizados = 0;

            foreach (var grupo in alunosAgrupados)
            {
                try
                {
                    // Buscar ou criar instituição
                    var instituicao = await BuscarOuCriarInstituicaoAsync(grupo.Aluno.FILIAL_NOME, grupo.Aluno.CODFILIAL);

                    // Buscar ou criar curso
                    var curso = await BuscarOuCriarCursoAsync(grupo.Aluno.CURSO_DO_ALUNO, grupo.Aluno.COD_CURSO_DO_ALUNO, instituicao.Id);

                    // Buscar ou criar período letivo
                    var periodoLetivos = await BuscarOuCriarPeriodoLetivoAsync(grupo.Aluno.PERIODO_LETIVO);

                    // Buscar ou criar aluno (uma vez só)
                    var aluno = await BuscarOuCriarAlunoAsync(grupo.Aluno, curso.Id, instituicao.Id, periodoLetivos.Id);

                    // Processar cada turma-disciplina do aluno
                    foreach (var turmaDisciplinaTotvs in grupo.TurmasDisciplinas)
                    {
                        // Buscar ou criar disciplina
                        var disciplina = await BuscarOuCriarDisciplinaAsync(turmaDisciplinaTotvs.NOME_DISCIPLINA, turmaDisciplinaTotvs.CODIGO_DISCIPLINA, instituicao.Id);

                        // Buscar ou criar turma
                        var turma = await BuscarOuCriarTurmaAsync(turmaDisciplinaTotvs.CODTURMA, curso.Id);

                        // Buscar ou criar professor (se houver)
                        var professor = await BuscarOuCriarProfessorPorDisciplinaAsync(turmaDisciplinaTotvs, instituicao.Id);

                        // Buscar ou criar turma-disciplina
                        var turmaDisciplina = await BuscarOuCriarTurmaDisciplinaAsync(turmaDisciplinaTotvs, turma.Id, disciplina.Id, professor.Id, periodoLetivos.Id);

                        // Associar aluno com turma-disciplina (se não estiver associado)
                        await AssociarAlunoComTurmaDisciplinaAsync(aluno.Id, turmaDisciplina.Id);
                    }

                    // Buscar ou criar participante
                    await BuscarOuCriarParticipanteAsync(grupo.Aluno, aluno.Id);

                    registrosSincronizados++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao sincronizar aluno RA: {RA}", grupo.Aluno.RA);
                }
            }

            return registrosSincronizados;
        }

        public async Task<int> SincronizarProfessoresAsync(string? periodoLetivo = null)
        {
            var professoresTotvs = periodoLetivo != null 
                ? await BuscarProfessoresPorPeriodoAsync(periodoLetivo)
                : await BuscarTodosProfessoresAsync();

            var registrosSincronizados = 0;

            foreach (var professorTotvs in professoresTotvs)
            {
                try
                {
                    // Buscar ou criar instituição
                    var instituicao = await BuscarOuCriarInstituicaoAsync(professorTotvs.FILIAL_NOME, professorTotvs.COD_FILIAL);

                    // Buscar ou criar professor
                    var professor = await BuscarOuCriarProfessorAsync(professorTotvs, instituicao.Id);

                    // Buscar ou criar participante
                    await BuscarOuCriarParticipanteProfessorAsync(professorTotvs, professor.Id);

                    registrosSincronizados++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao sincronizar professor Login: {Login}", professorTotvs.LOGIN);
                }
            }

            return registrosSincronizados;
        }

        #endregion

        #region Métodos Auxiliares para Mapeamento de IDs

        /// <summary>
        /// Busca o ID da instituição na base MySQL local pelo nome
        /// </summary>
        private async Task<int?> BuscarInstituicaoIdPorNomeAsync(string nomeInstituicao)
        {
            if (string.IsNullOrEmpty(nomeInstituicao))
                return null;

            var instituicao = await _context.Instituicoes
                .FirstOrDefaultAsync(i => i.Nome == nomeInstituicao);
            
            return instituicao?.Id;
        }

        /// <summary>
        /// Busca o ID do curso na base MySQL local pelo nome
        /// </summary>
        private async Task<int?> BuscarCursoIdPorNomeAsync(string nomeCurso)
        {
            if (string.IsNullOrEmpty(nomeCurso))
                return null;

            var curso = await _context.Cursos
                .FirstOrDefaultAsync(c => c.Nome == nomeCurso);
            
            return curso?.Id;
        }

        /// <summary>
        /// Busca o ID da turma na base MySQL local pelo nome
        /// </summary>
        private async Task<int?> BuscarTurmaIdPorNomeAsync(string nomeTurma)
        {
            if (string.IsNullOrEmpty(nomeTurma))
                return null;

            var turma = await _context.Turmas
                .FirstOrDefaultAsync(t => t.Nome == nomeTurma);
            
            return turma?.Id;
        }

        /// <summary>
        /// Busca o ID da disciplina na base MySQL local pelo nome
        /// </summary>
        private async Task<int?> BuscarDisciplinaIdPorNomeAsync(string nomeDisciplina)
        {
            if (string.IsNullOrEmpty(nomeDisciplina))
                return null;

            var disciplina = await _context.Disciplinas
                .FirstOrDefaultAsync(d => d.Nome == nomeDisciplina);
            
            return disciplina?.Id;
        }

        /// <summary>
        /// Busca o ID do período letivo na base MySQL local pelo nome
        /// </summary>
        private async Task<int?> BuscarPeriodoLetivoIdPorNomeAsync(string nomePeriodoLetivo)
        {
            if (string.IsNullOrEmpty(nomePeriodoLetivo))
                return null;

            var periodoLetivo = await _context.PeriodosLetivos
                .FirstOrDefaultAsync(p => p.Nome == nomePeriodoLetivo);
            
            return periodoLetivo?.Id;
        }

        /// <summary>
        /// Busca o ID da TurmaDisciplina na base MySQL local pelos IDs de turma e disciplina
        /// </summary>
        private async Task<int?> BuscarTurmaDisciplinaIdAsync(int? turmaId, int? disciplinaId)
        {
            if (!turmaId.HasValue || !disciplinaId.HasValue)
                return null;

            var turmaDisciplina = await _context.TurmasDisciplinas
                .FirstOrDefaultAsync(td => td.TurmaId == turmaId.Value && td.DisciplinaId == disciplinaId.Value);
            
            return turmaDisciplina?.Id;
        }

        /// <summary>
        /// Mapeia os IDs das entidades relacionadas para um ParticipanteTotvs
        /// </summary>
        private async Task MapearIdsEntidadesAsync(ParticipanteTotvs participante)
        {
            // Mapear InstituicaoId
            if (!string.IsNullOrEmpty(participante.InstituicaoNome))
            {
                participante.InstituicaoId = await BuscarInstituicaoIdPorNomeAsync(participante.InstituicaoNome);
            }

            // Mapear CursoId
            if (!string.IsNullOrEmpty(participante.CursoNome))
            {
                participante.CursoId = await BuscarCursoIdPorNomeAsync(participante.CursoNome);
            }

            // Mapear TurmaId
            if (!string.IsNullOrEmpty(participante.TurmaNome))
            {
                participante.TurmaId = await BuscarTurmaIdPorNomeAsync(participante.TurmaNome);
            }

            // Mapear DisciplinaId
            if (!string.IsNullOrEmpty(participante.DisciplinaNome))
            {
                participante.DisciplinaId = await BuscarDisciplinaIdPorNomeAsync(participante.DisciplinaNome);
            }

            // Mapear PeriodoLetivoId
            if (!string.IsNullOrEmpty(participante.PeriodoLetivoNome))
            {
                participante.PeriodoLetivoId = await BuscarPeriodoLetivoIdPorNomeAsync(participante.PeriodoLetivoNome);
            }

            // Mapear TurmaDisciplinaId se temos tanto TurmaId quanto DisciplinaId
            if (participante.TurmaId.HasValue && participante.DisciplinaId.HasValue)
            {
                participante.TurmaDisciplinaId = await BuscarTurmaDisciplinaIdAsync(participante.TurmaId, participante.DisciplinaId);
            }
        }

        #endregion

        #region Métodos Auxiliares

        private static TotvsAluno MapAlunoFromReader(OracleDataReader reader)
        {
            return new TotvsAluno
            {
                PERIODO_LETIVO = reader["PERIODO_LETIVO"]?.ToString() ?? string.Empty,
                NIVEL_ENSINO = reader["NIVEL_ENSINO"]?.ToString() ?? string.Empty,
                CODFILIAL = reader["CODFILIAL"]?.ToString() ?? string.Empty,
                FILIAL_NOME = reader["FILIAL_NOME"]?.ToString() ?? string.Empty,
                CODIGO_PESSOA = reader["CODIGO_PESSOA"]?.ToString() ?? string.Empty,
                RA = reader["RA"]?.ToString() ?? string.Empty,
                NOME = reader["NOME"]?.ToString() ?? string.Empty,
                CPF = reader["CPF"]?.ToString() ?? string.Empty,
                NASCIMENTO_ALUNO = reader["NASCIMENTO_ALUNO"] as DateTime?,
                EMAIL = reader["EMAIL"]?.ToString() ?? string.Empty,
                EMAIL_PESSOAL = reader["EMAIL_PESSOAL"]?.ToString() ?? string.Empty,
                SEXO = reader["SEXO"]?.ToString() ?? string.Empty,
                DT_NASC = reader["DT_NASC"] as DateTime?,
                COD_STATUS_NA_DISCIPLINA = reader["COD_STATUS_NA_DISCIPLINA"]?.ToString() ?? string.Empty,
                STATUS_NA_DISCIPLINA = reader["STATUS_NA_DISCIPLINA"]?.ToString() ?? string.Empty,
                TIPO_MATRICULA = reader["TIPO_MATRICULA"]?.ToString() ?? string.Empty,
                DATA_MATRICULA = reader["DATA_MATRICULA"] as DateTime?,
                IDTURMADISC = reader["IDTURMADISC"]?.ToString() ?? string.Empty,
                CODIGO_DISCIPLINA = reader["CODIGO_DISCIPLINA"]?.ToString() ?? string.Empty,
                CODTURMA = reader["CODTURMA"]?.ToString() ?? string.Empty,
                COD_CURSO_DA_TURMA = reader["COD_CURSO_DA_TURMA"]?.ToString() ?? string.Empty,
                CURSO_DA_TURMA = reader["CURSO_DA_TURMA"]?.ToString() ?? string.Empty,
                FASE = reader["FASE"]?.ToString() ?? string.Empty,
                NOME_DISCIPLINA = reader["NOME_DISCIPLINA"]?.ToString() ?? string.Empty,
                TIPO_TURMA = reader["TIPO_TURMA"]?.ToString() ?? string.Empty,
                STATUS_NO_PERIODO_LETIVO = reader["STATUS_NO_PERIODO_LETIVO"]?.ToString() ?? string.Empty,
                COD_CURSO_DO_ALUNO = reader["COD_CURSO_DO_ALUNO"]?.ToString() ?? string.Empty,
                CURSO_DO_ALUNO = reader["CURSO_DO_ALUNO"]?.ToString() ?? string.Empty,
                FILIAL = reader["FILIAL"]?.ToString() ?? string.Empty,
                GRADE_DO_ALUNO = reader["GRADE_DO_ALUNO"]?.ToString() ?? string.Empty,
                HABILITACAO_DO_ALUNO = reader["HABILITACAO_DO_ALUNO"]?.ToString() ?? string.Empty,
                INGRESSO_NO_CURSO = reader["INGRESSO_NO_CURSO"] as DateTime?,
                TURNO_POLO = reader["TURNO_POLO"]?.ToString() ?? string.Empty,
                TURMA_ATIVA = reader["TURMA_ATIVA"]?.ToString() ?? string.Empty
            };
        }

        private static TotvsProfessor MapProfessorFromReader(OracleDataReader reader)
        {
            return new TotvsProfessor
            {
                PERIODO_LETIVO = reader["PERIODO_LETIVO"]?.ToString() ?? string.Empty,
                COD_FILIAL = reader["COD_FILIAL"]?.ToString() ?? string.Empty,
                FILIAL_NOME = reader["FILIAL_NOME"]?.ToString() ?? string.Empty,
                NIVEL_ENSINO = reader["NIVEL_ENSINO"]?.ToString() ?? string.Empty,
                COD_CURSO = reader["COD_CURSO"]?.ToString() ?? string.Empty,
                HAB = reader["HAB"]?.ToString() ?? string.Empty,
                MATRIZ = reader["MATRIZ"]?.ToString() ?? string.Empty,
                CURSO = reader["CURSO"]?.ToString() ?? string.Empty,
                COD_TURMA = reader["COD_TURMA"]?.ToString() ?? string.Empty,
                TURMA_GERENCIAL = reader["TURMA_GERENCIAL"]?.ToString() ?? string.Empty,
                IDTURMADISC = reader["IDTURMADISC"]?.ToString() ?? string.Empty,
                IDTURMADISCGERENCIADA = reader["IDTURMADISCGERENCIADA"]?.ToString() ?? string.Empty,
                COD_DISC = reader["COD_DISC"]?.ToString() ?? string.Empty,
                DISCIPLINA = reader["DISCIPLINA"]?.ToString() ?? string.Empty,
                TURNO_POLO = reader["TURNO_POLO"]?.ToString() ?? string.Empty,
                SEXO = reader["SEXO"]?.ToString() ?? string.Empty,
                PROFESSOR = reader["PROFESSOR"]?.ToString() ?? string.Empty,
                TIPO_PROF_TURMA = reader["TIPO_PROF_TURMA"]?.ToString() ?? string.Empty,
                TURMA_ATIVA = reader["TURMA_ATIVA"]?.ToString() ?? string.Empty,
                TIPO_TURMA = reader["TIPO_TURMA"]?.ToString() ?? string.Empty,
                LOGIN = reader["LOGIN"]?.ToString() ?? string.Empty,
                EMAIL = reader["EMAIL"]?.ToString() ?? string.Empty,
                COORDENADORATUAL = reader["COORDENADORATUAL"]?.ToString() ?? string.Empty,
                PROF_ATIVO = reader["PROF_ATIVO"]?.ToString() ?? string.Empty
            };
        }

        private async Task<Instituicao> BuscarOuCriarInstituicaoAsync(string nome, string codigo)
        {
            var instituicao = await _context.Instituicoes
                .FirstOrDefaultAsync(i => i.Codigo == codigo);

            if (instituicao == null)
            {
                instituicao = new Instituicao
                {
                    Nome = nome,
                    Codigo = codigo,
                    Ativo = true
                };
                _context.Instituicoes.Add(instituicao);
                await _context.SaveChangesAsync();
            }

            return instituicao;
        }

        private async Task<Curso> BuscarOuCriarCursoAsync(string nome, string codigo, int instituicaoId)
        {
            var curso = await _context.Cursos
                .FirstOrDefaultAsync(c => c.Codigo == codigo);

            if (curso == null)
            {
                curso = new Curso
                {
                    Nome = nome,
                    Codigo = codigo,
                    InstituicaoId = instituicaoId,
                    Ativo = true
                };
                _context.Cursos.Add(curso);
                await _context.SaveChangesAsync();
            }

            return curso;
        }

        private async Task<Turma> BuscarOuCriarTurmaAsync(string codigo, int cursoId)
        {
            var turma = await _context.Turmas
                .FirstOrDefaultAsync(t => t.Codigo == codigo);

            if (turma == null)
            {
                turma = new Turma
                {
                    Nome = codigo, // Usar código como nome se não houver nome específico
                    Codigo = codigo,
                    CursoId = cursoId,
                    Ativo = true
                };
                _context.Turmas.Add(turma);
                await _context.SaveChangesAsync();
            }

            return turma;
        }

        private async Task<Aluno> BuscarOuCriarAlunoAsync(TotvsAluno alunoTotvs, int cursoId, int instituicaoId, int periodoLetivoId)
        {
            var aluno = await _context.Alunos
                .FirstOrDefaultAsync(a => a.IntegracaoId == alunoTotvs.CODIGO_PESSOA);

            if (aluno == null)
            {
                aluno = new Aluno
                {
                    Matricula = alunoTotvs.RA,
                    Nome = alunoTotvs.NOME,
                    Email = !string.IsNullOrEmpty(alunoTotvs.EMAIL) ? alunoTotvs.EMAIL : alunoTotvs.EMAIL_PESSOAL,
                    EmailPessoal = alunoTotvs.EMAIL_PESSOAL,
                    Cpf = alunoTotvs.CPF,
                    DataNascimento = alunoTotvs.DT_NASC ?? alunoTotvs.NASCIMENTO_ALUNO,
                    Sexo = ObterSexoDoTotvs(alunoTotvs.SEXO),
                    CursoId = cursoId,
                    InstituicaoId = instituicaoId,
                    PeriodoLetivoId = periodoLetivoId,
                    Fase = int.TryParse(alunoTotvs.FASE, out var fase) ? fase : null,
                    Grade = alunoTotvs.GRADE_DO_ALUNO,
                    Habilitacao = alunoTotvs.HABILITACAO_DO_ALUNO,
                    DataIngressoCurso = alunoTotvs.INGRESSO_NO_CURSO,
                    DataMatricula = alunoTotvs.DATA_MATRICULA,
                    StatusNoPeriodoLetivo = alunoTotvs.STATUS_NO_PERIODO_LETIVO,
                    TurmaAtiva = alunoTotvs.TURMA_ATIVA == "S",
                    IntegracaoId = alunoTotvs.CODIGO_PESSOA,
                    CursoIntegracaoId = alunoTotvs.COD_CURSO_DO_ALUNO,
                    TurmaIntegracaoId = alunoTotvs.CODTURMA,
                    PeriodoLetivoIntegracaoId = alunoTotvs.PERIODO_LETIVO,
                    InstituicaoIntegracaoId = alunoTotvs.CODFILIAL,
                    Ativo = true,
                    DataCadastro = DateTime.UtcNow
                };
                _context.Alunos.Add(aluno);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Atualizar dados se necessário
                bool atualizado = false;
                
                if (aluno.Nome != alunoTotvs.NOME)
                {
                    aluno.Nome = alunoTotvs.NOME;
                    atualizado = true;
                }
                
                var novoEmail = !string.IsNullOrEmpty(alunoTotvs.EMAIL) ? alunoTotvs.EMAIL : alunoTotvs.EMAIL_PESSOAL;
                if (aluno.Email != novoEmail)
                {
                    aluno.Email = novoEmail;
                    atualizado = true;
                }
                
                if (aluno.EmailPessoal != alunoTotvs.EMAIL_PESSOAL)
                {
                    aluno.EmailPessoal = alunoTotvs.EMAIL_PESSOAL;
                    atualizado = true;
                }
                
                if (aluno.Cpf != alunoTotvs.CPF)
                {
                    aluno.Cpf = alunoTotvs.CPF;
                    atualizado = true;
                }
                
                var novaDataNascimento = alunoTotvs.DT_NASC ?? alunoTotvs.NASCIMENTO_ALUNO;
                if (aluno.DataNascimento != novaDataNascimento)
                {
                    aluno.DataNascimento = novaDataNascimento;
                    atualizado = true;
                }
                
                var novoSexo = ObterSexoDoTotvs(alunoTotvs.SEXO);
                if (aluno.Sexo != novoSexo)
                {
                    aluno.Sexo = novoSexo;
                    atualizado = true;
                }
                
                var novaFase = int.TryParse(alunoTotvs.FASE, out var fase) ? (int?)fase : null;
                if (aluno.Fase != novaFase)
                {
                    aluno.Fase = novaFase;
                    atualizado = true;
                }
                
                if (aluno.Grade != alunoTotvs.GRADE_DO_ALUNO)
                {
                    aluno.Grade = alunoTotvs.GRADE_DO_ALUNO;
                    atualizado = true;
                }
                
                if (aluno.Habilitacao != alunoTotvs.HABILITACAO_DO_ALUNO)
                {
                    aluno.Habilitacao = alunoTotvs.HABILITACAO_DO_ALUNO;
                    atualizado = true;
                }
                
                if (aluno.DataIngressoCurso != alunoTotvs.INGRESSO_NO_CURSO)
                {
                    aluno.DataIngressoCurso = alunoTotvs.INGRESSO_NO_CURSO;
                    atualizado = true;
                }
                
                if (aluno.DataMatricula != alunoTotvs.DATA_MATRICULA)
                {
                    aluno.DataMatricula = alunoTotvs.DATA_MATRICULA;
                    atualizado = true;
                }
                
                if (aluno.StatusNoPeriodoLetivo != alunoTotvs.STATUS_NO_PERIODO_LETIVO)
                {
                    aluno.StatusNoPeriodoLetivo = alunoTotvs.STATUS_NO_PERIODO_LETIVO;
                    atualizado = true;
                }
                
                if (aluno.TurmaAtiva != (alunoTotvs.TURMA_ATIVA == "S"))
                {
                    aluno.TurmaAtiva = alunoTotvs.TURMA_ATIVA == "S";
                    atualizado = true;
                }
                
                if (atualizado)
                {
                    aluno.DataAtualizacao = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }

            return aluno;
        }

        private async Task<Professor> BuscarOuCriarProfessorAsync(TotvsProfessor professorTotvs, int instituicaoId)
        {
            var professor = await _context.Professores
                .FirstOrDefaultAsync(p => p.IntegracaoId == professorTotvs.LOGIN);

            if (professor == null)
            {
                professor = new Professor
                {
                    Nome = professorTotvs.PROFESSOR,
                    Email = professorTotvs.EMAIL,
                    Login = professorTotvs.LOGIN,
                    Sexo = ObterSexoDoTotvs(professorTotvs.SEXO),
                    InstituicaoId = instituicaoId,
                    IntegracaoId = professorTotvs.LOGIN,
                    CursoIntegracaoId = professorTotvs.COD_CURSO,
                    TurmaIntegracaoId = professorTotvs.COD_TURMA,
                    PeriodoLetivoIntegracaoId = professorTotvs.PERIODO_LETIVO,
                    InstituicaoIntegracaoId = professorTotvs.COD_FILIAL,
                    DisciplinaIntegracaoId = professorTotvs.COD_DISC,
                    Ativo = professorTotvs.PROF_ATIVO == "S",
                    DataCadastro = DateTime.UtcNow
                };
                _context.Professores.Add(professor);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Atualizar dados se necessário
                bool atualizado = false;
                
                if (professor.Nome != professorTotvs.PROFESSOR)
                {
                    professor.Nome = professorTotvs.PROFESSOR;
                    atualizado = true;
                }
                
                if (professor.Email != professorTotvs.EMAIL)
                {
                    professor.Email = professorTotvs.EMAIL;
                    atualizado = true;
                }
                
                var novoSexo = ObterSexoDoTotvs(professorTotvs.SEXO);
                if (professor.Sexo != novoSexo)
                {
                    professor.Sexo = novoSexo;
                    atualizado = true;
                }
                
                if (professor.Ativo != (professorTotvs.PROF_ATIVO == "S"))
                {
                    professor.Ativo = professorTotvs.PROF_ATIVO == "S";
                    atualizado = true;
                }
                
                if (atualizado)
                {
                    professor.DataAtualizacao = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }

            return professor;
        }

        private async Task<Participante> BuscarOuCriarParticipanteAsync(TotvsAluno alunoTotvs, int alunoId)
        {
            var participante = await _context.Participantes
                .FirstOrDefaultAsync(p => p.AlunoId == alunoId);

            if (participante == null)
            {
                participante = new Participante
                {
                    Nome = alunoTotvs.NOME,
                    Email = !string.IsNullOrEmpty(alunoTotvs.EMAIL) ? alunoTotvs.EMAIL : alunoTotvs.EMAIL_PESSOAL,
                    AlunoId = alunoId,
                    Ativo = true
                };
                _context.Participantes.Add(participante);
                await _context.SaveChangesAsync();
            }

            return participante;
        }

        private async Task<Participante> BuscarOuCriarParticipanteProfessorAsync(TotvsProfessor professorTotvs, int professorId)
        {
            var participante = await _context.Participantes
                .FirstOrDefaultAsync(p => p.ProfessorId == professorId);

            if (participante == null)
            {
                participante = new Participante
                {
                    Nome = professorTotvs.PROFESSOR,
                    Email = professorTotvs.EMAIL,
                    ProfessorId = professorId,
                    Ativo = professorTotvs.PROF_ATIVO == "S"
                };
                _context.Participantes.Add(participante);
                await _context.SaveChangesAsync();
            }

            return participante;
        }

        private async Task<PeriodoLetivo> BuscarOuCriarPeriodoLetivoAsync(string periodoLetivo)
        {
            var periodo = await _context.PeriodosLetivos
                .FirstOrDefaultAsync(p => p.Nome == periodoLetivo);

            if (periodo == null)
            {
                periodo = new PeriodoLetivo
                {
                    Nome = periodoLetivo,
                    Ativo = true
                };
                _context.PeriodosLetivos.Add(periodo);
                await _context.SaveChangesAsync();
            }

            return periodo;
        }

        private async Task<Disciplina> BuscarOuCriarDisciplinaAsync(string nome, string codigo, int instituicaoId)
        {
            var disciplina = await _context.Disciplinas
                .FirstOrDefaultAsync(d => d.Codigo == codigo);

            if (disciplina == null)
            {
                disciplina = new Disciplina
                {
                    Nome = nome,
                    Codigo = codigo,
                    InstituicaoId = instituicaoId,
                    Ativo = true
                };
                _context.Disciplinas.Add(disciplina);
                await _context.SaveChangesAsync();
            }

            return disciplina;
        }

        private async Task<Professor> BuscarOuCriarProfessorPorDisciplinaAsync(TotvsAluno turmaDisciplinaTotvs, int instituicaoId)
        {
            // Para alunos, não temos professor específico, então retornamos null ou um professor padrão
            // Isso pode ser ajustado conforme a lógica de negócio
            return null;
        }

        private async Task<TurmaDisciplina> BuscarOuCriarTurmaDisciplinaAsync(TotvsAluno turmaDisciplinaTotvs, int turmaId, int disciplinaId, int? professorId, int periodoLetivoId)
        {
            var turmaDisciplina = await _context.TurmaDisciplinas
                .FirstOrDefaultAsync(td => td.TurmaId == turmaId && td.DisciplinaId == disciplinaId && td.PeriodoLetivoId == periodoLetivoId);

            if (turmaDisciplina == null)
            {
                turmaDisciplina = new TurmaDisciplina
                {
                    TurmaId = turmaId,
                    DisciplinaId = disciplinaId,
                    ProfessorId = professorId ?? 1, // Professor padrão se não houver
                    PeriodoLetivoId = periodoLetivoId,
                    IntegracaoId = turmaDisciplinaTotvs.IDTURMADISC,
                    Ativo = true
                };
                _context.TurmaDisciplinas.Add(turmaDisciplina);
                await _context.SaveChangesAsync();
            }

            return turmaDisciplina;
        }

        private async Task AssociarAlunoComTurmaDisciplinaAsync(int alunoId, int turmaDisciplinaId)
        {
            // Verificar se a associação já existe na tabela AlunoTurmaDisciplina
            var associacaoExistente = await _context.Database
                .ExecuteSqlRawAsync("SELECT COUNT(*) FROM AlunoTurmaDisciplina WHERE AlunosAlunoId = {0} AND TurmasDisciplinasId = {1}", 
                    alunoId, turmaDisciplinaId);

            if (associacaoExistente == 0)
            {
                // Criar a associação na tabela AlunoTurmaDisciplina
                await _context.Database.ExecuteSqlRawAsync(
                    "INSERT INTO AlunoTurmaDisciplina (AlunosAlunoId, TurmasDisciplinasId) VALUES ({0}, {1})",
                    alunoId, turmaDisciplinaId);
            }
        }

        #endregion

        #region Busca por Filtros

        public async Task<List<ParticipanteTotvs>> BuscarParticipantesPorFiltrosAsync(
            string? periodoLetivo = null,
            int? cursoId = null,
            int? turmaId = null,
            int? disciplinaId = null,
            TipoParticipante? tipoParticipante = null)
        {
            var participantes = new List<ParticipanteTotvs>();

            try
            {
                // Buscar alunos se solicitado
                if (tipoParticipante == null || tipoParticipante == TipoParticipante.Aluno)
                {
                    var alunos = await BuscarAlunosComFiltrosAsync(periodoLetivo, cursoId, turmaId, disciplinaId);
                    participantes.AddRange(alunos);
                }

                // Buscar professores se solicitado
                if (tipoParticipante == null || tipoParticipante == TipoParticipante.Professor)
                {
                    var professores = await BuscarProfessoresComFiltrosAsync(periodoLetivo, cursoId, turmaId, disciplinaId);
                    participantes.AddRange(professores);
                }

                return participantes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar participantes por filtros");
                throw;
            }
        }

        public async Task<List<ParticipanteTotvs>> BuscarParticipantesPorFiltrosAsync(
            string? periodoLetivo = null,
            int? cursoId = null,
            int? turmaId = null,
            int? disciplinaId = null,
            TipoParticipante? tipoParticipante = null,
            TipoItemAvaliado? tipoItemAvaliado = null)
        {
            var participantes = new List<ParticipanteTotvs>();

            try
            {
                // Determinar qual view usar baseado no tipo de item avaliado
                bool buscarApenasEstagios = tipoItemAvaliado.HasValue && 
                    (tipoItemAvaliado == TipoItemAvaliado.TCC || 
                     tipoItemAvaliado == TipoItemAvaliado.Estagio || 
                     tipoItemAvaliado == TipoItemAvaliado.ProjetoExtensionista);
                
                bool buscarApenasRegulares = tipoItemAvaliado.HasValue && 
                    tipoItemAvaliado == TipoItemAvaliado.Disciplina;

                // Buscar alunos se solicitado
                if (tipoParticipante == null || tipoParticipante == TipoParticipante.Aluno)
                {
                    var alunos = await BuscarAlunosComFiltrosAsync(periodoLetivo, cursoId, turmaId, disciplinaId, buscarApenasEstagios, buscarApenasRegulares);
                    participantes.AddRange(alunos);
                }

                // Buscar professores se solicitado
                if (tipoParticipante == null || tipoParticipante == TipoParticipante.Professor)
                {
                    var professores = await BuscarProfessoresComFiltrosAsync(periodoLetivo, cursoId, turmaId, disciplinaId, buscarApenasEstagios, buscarApenasRegulares);
                    participantes.AddRange(professores);
                }

                return participantes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar participantes por filtros");
                throw;
            }
        }

        private async Task<List<ParticipanteTotvs>> BuscarAlunosComFiltrosAsync(
            string? periodoLetivo = null,
            int? cursoId = null,
            int? turmaId = null,
            int? disciplinaId = null,
            bool buscarApenasEstagios = false,
            bool buscarApenasRegulares = false)
        {
            var participantes = new List<ParticipanteTotvs>();
            
            // Query principal para V_ALUNOS
            var queryPrincipal = @"
                SELECT DISTINCT
                    a.PERIODO_LETIVO,
                    a.RA,
                    a.NOME,
                    a.EMAIL,
                    a.COD_CURSO_DO_ALUNO,
                    a.CURSO_DO_ALUNO,
                    a.CODFILIAL,
                    a.FILIAL_NOME,
                    a.IDTURMADISC,
                    a.CODIGO_DISCIPLINA,
                    a.NOME_DISCIPLINA,
                    a.CODTURMA,
                    a.CURSO_DA_TURMA,
                    a.FASE,
                    'REGULAR' as TIPO_DISCIPLINA
                FROM V_ALUNOS a
                WHERE a.TURMA_ATIVA = 'S'";

            // Query para V_ALUNOS_ESTAGIOS (TCC, Estágios, PACs)
            var queryEstagios = @"
                SELECT DISTINCT
                    ae.PERIODO_LETIVO,
                    ae.RA,
                    ae.NOME,
                    ae.EMAIL,
                    ae.COD_CURSO_DO_ALUNO,
                    ae.CURSO_DO_ALUNO,
                    ae.CODFILIAL,
                    ae.FILIAL_NOME,
                    ae.IDTURMADISC,
                    ae.CODIGO_DISCIPLINA,
                    ae.NOME_DISCIPLINA,
                    ae.CODTURMA,
                    ae.CURSO_DA_TURMA,
                    ae.FASE,
                    'ESTAGIO' as TIPO_DISCIPLINA
                FROM V_ALUNOS_ESTAGIOS ae
                WHERE ae.TURMA_ATIVA = 'S'";

            // Escolher qual query usar baseado no parâmetro
            string query;
            if (buscarApenasEstagios)
            {
                // Buscar apenas nas views de estágio (TCC, Estágios, PACs)
                query = queryEstagios;
            }
            else if (buscarApenasRegulares)
            {
                // Buscar apenas nas views regulares (Disciplinas)
                query = queryPrincipal;
            }
            else
            {
                // Buscar em ambas as views (regulares + especiais)
                query = $"({queryPrincipal}) UNION ALL ({queryEstagios})";
            }

            var parameters = new List<OracleParameter>();

            // Aplicar filtros na query escolhida
            var whereClause = "";

            if (!string.IsNullOrEmpty(periodoLetivo))
            {
                whereClause += " AND PERIODO_LETIVO = :periodoLetivo";
                parameters.Add(new OracleParameter("periodoLetivo", periodoLetivo));
            }

            if (cursoId.HasValue)
            {
                // Buscar curso pelo ID local e mapear para código TOTVS
                var curso = await _context.Cursos.FindAsync(cursoId.Value);
                if (curso != null && !string.IsNullOrEmpty(curso.Codigo))
                {
                    whereClause += " AND COD_CURSO_DO_ALUNO = :codigoCurso";
                    parameters.Add(new OracleParameter("codigoCurso", curso.Codigo));
                }
            }

            if (turmaId.HasValue)
            {
                // Buscar turma pelo ID local e mapear para código TOTVS
                var turma = await _context.Turmas.FindAsync(turmaId.Value);
                if (turma != null && !string.IsNullOrEmpty(turma.Codigo))
                {
                    whereClause += " AND CODTURMA = :codigoTurma";
                    parameters.Add(new OracleParameter("codigoTurma", turma.Codigo));
                }
            }

            if (disciplinaId.HasValue)
            {
                // Buscar disciplina pelo ID local e mapear para código TOTVS
                var disciplina = await _context.Disciplinas.FindAsync(disciplinaId.Value);
                if (disciplina != null && !string.IsNullOrEmpty(disciplina.Codigo))
                {
                    whereClause += " AND CODIGO_DISCIPLINA = :codigoDisciplina";
                    parameters.Add(new OracleParameter("codigoDisciplina", disciplina.Codigo));
                }
            }

            // Aplicar WHERE na query combinada
            if (!string.IsNullOrEmpty(whereClause))
            {
                query = $"SELECT * FROM ({query}) WHERE 1=1 {whereClause}";
            }

            try
            {
                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                foreach (var param in parameters)
                {
                    command.Parameters.Add(param);
                }

                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var tipoDisciplina = reader["TIPO_DISCIPLINA"]?.ToString() ?? "REGULAR";
                    var disciplinaNome = reader["NOME_DISCIPLINA"]?.ToString() ?? "";
                    
                    // Identificar tipo de disciplina baseado no nome
                    string tipoItemAvaliado = "Disciplina"; // Padrão
                    if (tipoDisciplina == "ESTAGIO")
                    {
                        // Verificar se é TCC, Estágio ou PAC baseado no nome da disciplina
                        if (disciplinaNome.ToUpper().Contains("TCC") || 
                            disciplinaNome.ToUpper().Contains("TRABALHO DE CONCLUSÃO"))
                        {
                            tipoItemAvaliado = "TCC";
                        }
                        else if (disciplinaNome.ToUpper().Contains("ESTÁGIO") || 
                                 disciplinaNome.ToUpper().Contains("ESTAGIO"))
                        {
                            tipoItemAvaliado = "Estagio";
                        }
                        else if (disciplinaNome.ToUpper().Contains("PAC"))
                        {
                            tipoItemAvaliado = "ProjetoExtensionista"; // PAC é um tipo de projeto extensionista
                        }
                        else
                        {
                            tipoItemAvaliado = "Estagio"; // Padrão para disciplinas de estágio
                        }
                    }

                    var participante = new ParticipanteTotvs
                    {
                        Nome = reader["NOME"]?.ToString() ?? "",
                        Email = reader["EMAIL"]?.ToString() ?? "",
                        Tipo = TipoParticipante.Aluno,
                        RA = reader["RA"]?.ToString(),
                        CursoNome = reader["CURSO_DO_ALUNO"]?.ToString(),
                        InstituicaoNome = reader["FILIAL_NOME"]?.ToString(),
                        PeriodoLetivoNome = reader["PERIODO_LETIVO"]?.ToString(),
                        DisciplinaNome = disciplinaNome,
                        TurmaNome = reader["CURSO_DA_TURMA"]?.ToString(),
                        TipoItemAvaliado = tipoItemAvaliado
                    };

                    // Mapear IDs das entidades relacionadas na base MySQL local
                    await MapearIdsEntidadesAsync(participante);

                    // Mapear IDs locais se possível (sobrescrever se já foram mapeados)
                    if (cursoId.HasValue)
                        participante.CursoId = cursoId.Value;
                    if (turmaId.HasValue)
                        participante.TurmaId = turmaId.Value;
                    if (disciplinaId.HasValue)
                        participante.DisciplinaId = disciplinaId.Value;

                    participantes.Add(participante);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar alunos com filtros");
                throw;
            }

            return participantes;
        }

        private async Task<List<ParticipanteTotvs>> BuscarProfessoresComFiltrosAsync(
            string? periodoLetivo = null,
            int? cursoId = null,
            int? turmaId = null,
            int? disciplinaId = null,
            bool buscarApenasEstagios = false,
            bool buscarApenasRegulares = false)
        {
            var participantes = new List<ParticipanteTotvs>();
            
            // Query principal para V_PROFESSORES
            var queryPrincipal = @"
                SELECT DISTINCT
                    p.PERIODO_LETIVO,
                    p.LOGIN,
                    p.PROFESSOR,
                    p.EMAIL,
                    p.COD_FILIAL,
                    p.FILIAL_NOME,
                    p.IDTURMADISC,
                    p.COD_DISC,
                    p.DISCIPLINA,
                    p.COD_TURMA,
                    p.TURMA_GERENCIAL,
                    'REGULAR' as TIPO_DISCIPLINA
                FROM V_PROFESSORES p
                 WHERE 1=1 ";

            // Query para V_PROFESSORES_ESTAGIOS (TCC, Estágios, PACs)
            var queryEstagios = @"
                SELECT DISTINCT
                    pe.PERIODO_LETIVO,
                    pe.LOGIN,
                    pe.PROFESSOR,
                    pe.EMAIL,
                    pe.COD_FILIAL,
                    pe.FILIAL_NOME,
                    pe.IDTURMADISC,
                    pe.COD_DISC,
                    pe.DISCIPLINA,
                    pe.COD_TURMA,
                    pe.TURMA_GERENCIAL,
                    'ESTAGIO' as TIPO_DISCIPLINA
                FROM V_PROFESSORES_ESTAGIOS pe
                 WHERE 1=1 ";

            // Escolher qual query usar baseado no parâmetro
            string query;
            if (buscarApenasEstagios)
            {
                // Buscar apenas nas views de estágio (TCC, Estágios, PACs)
                query = queryEstagios;
            }
            else if (buscarApenasRegulares)
            {
                // Buscar apenas nas views regulares (Disciplinas)
                query = queryPrincipal;
            }
            else
            {
                // Buscar em ambas as views (regulares + especiais)
                query = $"({queryPrincipal}) UNION ALL ({queryEstagios})";
            }

            var parameters = new List<OracleParameter>();

            // Aplicar filtros na query escolhida
            var whereClause = "";

            if (!string.IsNullOrEmpty(periodoLetivo))
            {
                whereClause += " AND PERIODO_LETIVO = :periodoLetivo";
                parameters.Add(new OracleParameter("periodoLetivo", periodoLetivo));
            }

            if (cursoId.HasValue)
            {
                // Buscar curso pelo ID local e mapear para código TOTVS
                var curso = await _context.Cursos.FindAsync(cursoId.Value);
                if (curso != null && !string.IsNullOrEmpty(curso.Codigo))
                {
                    whereClause += " AND COD_CURSO = :codigoCurso";
                    parameters.Add(new OracleParameter("codigoCurso", curso.Codigo));
                }
            }

            if (turmaId.HasValue)
            {
                // Buscar turma pelo ID local e mapear para código TOTVS
                var turma = await _context.Turmas.FindAsync(turmaId.Value);
                if (turma != null && !string.IsNullOrEmpty(turma.Codigo))
                {
                    whereClause += " AND COD_TURMA = :codigoTurma";
                    parameters.Add(new OracleParameter("codigoTurma", turma.Codigo));
                }
            }

            if (disciplinaId.HasValue)
            {
                // Buscar disciplina pelo ID local e mapear para código TOTVS
                var disciplina = await _context.Disciplinas.FindAsync(disciplinaId.Value);
                if (disciplina != null && !string.IsNullOrEmpty(disciplina.Codigo))
                {
                    whereClause += " AND COD_DISC = :codigoDisciplina";
                    parameters.Add(new OracleParameter("codigoDisciplina", disciplina.Codigo));
                }
            }

            // Aplicar WHERE na query escolhida
            if (!string.IsNullOrEmpty(whereClause))
            {
                query = $"SELECT * FROM ({query}) WHERE 1=1 {whereClause}";
            }

            try
            {
                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                foreach (var param in parameters)
                {
                    command.Parameters.Add(param);
                }

                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var tipoDisciplina = reader["TIPO_DISCIPLINA"]?.ToString() ?? "REGULAR";
                    var disciplinaNome = reader["DISCIPLINA"]?.ToString() ?? "";
                    
                    // Identificar tipo de disciplina baseado no nome
                    string tipoItemAvaliado = "Disciplina"; // Padrão
                    if (tipoDisciplina == "ESTAGIO")
                    {
                        // Verificar se é TCC, Estágio ou PAC baseado no nome da disciplina
                        if (disciplinaNome.ToUpper().Contains("TCC") || 
                            disciplinaNome.ToUpper().Contains("TRABALHO DE CONCLUSÃO"))
                        {
                            tipoItemAvaliado = "TCC";
                        }
                        else if (disciplinaNome.ToUpper().Contains("ESTÁGIO") || 
                                 disciplinaNome.ToUpper().Contains("ESTAGIO"))
                        {
                            tipoItemAvaliado = "Estagio";
                        }
                        else if (disciplinaNome.ToUpper().Contains("PAC"))
                        {
                            tipoItemAvaliado = "ProjetoExtensionista"; // PAC é um tipo de projeto extensionista
                        }
                        else
                        {
                            tipoItemAvaliado = "Estagio"; // Padrão para disciplinas de estágio
                        }
                    }

                    var participante = new ParticipanteTotvs
                    {
                        Nome = reader["PROFESSOR"]?.ToString() ?? "",
                        Email = reader["EMAIL"]?.ToString() ?? "",
                        Tipo = TipoParticipante.Professor,
                        Login = reader["LOGIN"]?.ToString(),
                        InstituicaoNome = reader["FILIAL_NOME"]?.ToString(),
                        PeriodoLetivoNome = reader["PERIODO_LETIVO"]?.ToString(),
                        DisciplinaNome = disciplinaNome,
                        TurmaNome = reader["TURMA_GERENCIAL"]?.ToString(),
                        TipoItemAvaliado = tipoItemAvaliado
                    };

                    // Mapear IDs das entidades relacionadas na base MySQL local
                    await MapearIdsEntidadesAsync(participante);

                    // Mapear IDs locais se possível (sobrescrever se já foram mapeados)
                    if (cursoId.HasValue)
                        participante.CursoId = cursoId.Value;
                    if (turmaId.HasValue)
                        participante.TurmaId = turmaId.Value;
                    if (disciplinaId.HasValue)
                        participante.DisciplinaId = disciplinaId.Value;

                    participantes.Add(participante);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar professores com filtros");
                throw;
            }

            // Agrupar por LOGIN para evitar duplicatas de professor
            var professoresAgrupados = participantes
                .Where(p => !string.IsNullOrEmpty(p.Login)) // Filtrar professores com login válido
                .GroupBy(p => p.Login)
                .Select(g => new {
                    Professor = g.First(), // Dados únicos do professor
                    Disciplinas = g.ToList() // Todas as disciplinas
                })
                .ToList();

            // Retornar apenas os professores únicos (sem duplicatas)
            return professoresAgrupados.Select(p => p.Professor).ToList();
        }

        /// <summary>
        /// Sincroniza dados de instituições do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        public async Task<int> SincronizarInstituicoesAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de instituições...");

                var query = @"
                    SELECT DISTINCT
                        pe.COD_FILIAL,
                        pe.FILIAL_NOME
                    FROM V_PROFESSORES pe
                    WHERE pe.COD_FILIAL IS NOT NULL 
                    AND pe.FILIAL_NOME IS NOT NULL
                    ORDER BY pe.COD_FILIAL";

                var instituicoesTotvs = new List<(string Codigo, string Nome)>();

                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var codigo = reader["COD_FILIAL"]?.ToString() ?? "";
                    var nome = reader["FILIAL_NOME"]?.ToString() ?? "";
                    
                    if (!string.IsNullOrEmpty(codigo) && !string.IsNullOrEmpty(nome))
                    {
                        instituicoesTotvs.Add((codigo, nome));
                    }
                }

                var registrosSincronizados = 0;

                foreach (var (codigo, nome) in instituicoesTotvs)
                {
                    try
                    {
                        // Verificar se a instituição já existe pelo IntegracaoId (código do TOTVS)
                        var instituicaoExistente = await _context.Instituicoes
                            .FirstOrDefaultAsync(i => i.IntegracaoId == int.Parse(codigo));

                        if (instituicaoExistente == null)
                        {
                            // Criar nova instituição
                            var novaInstituicao = new Instituicao
                            {
                                Codigo = codigo, // Campo Codigo para compatibilidade
                                IntegracaoId = int.TryParse(codigo, out var codigoInt) ? codigoInt : 0, // Campo IntegracaoId com o código do TOTVS
                                Nome = nome,
                                Ativo = true,
                                DataCadastro = DateTime.UtcNow
                            };

                            _context.Instituicoes.Add(novaInstituicao);
                            registrosSincronizados++;
                            
                            _logger.LogDebug("Nova instituição criada: {Codigo} - {Nome}", codigo, nome);
                        }
                        else
                        {
                            // Atualizar nome se necessário
                            if (instituicaoExistente.Nome != nome)
                            {
                                instituicaoExistente.Nome = nome;
                                instituicaoExistente.DataAtualizacao = DateTime.UtcNow;
                                registrosSincronizados++;
                                
                                _logger.LogDebug("Instituição atualizada: {Codigo} - {Nome}", codigo, nome);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao processar instituição {Codigo} - {Nome}", codigo, nome);
                    }
                }

                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Sincronização de instituições concluída: {Registros} registros processados", 
                    registrosSincronizados);

                return registrosSincronizados;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de instituições");
                throw;
            }
        }

        /// <summary>
        /// Sincroniza dados de cursos do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        public async Task<int> SincronizarCursosAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de cursos...");

                var query = @"
                    SELECT DISTINCT
                        pe.COD_FILIAL,
                        pe.COD_CURSO,
                        pe.CURSO
                    FROM V_PROFESSORES pe
                    WHERE pe.COD_FILIAL IS NOT NULL 
                    AND pe.COD_CURSO IS NOT NULL
                    AND pe.CURSO IS NOT NULL
                    ORDER BY pe.COD_FILIAL, pe.COD_CURSO";

                var cursosTotvs = new List<(string CodigoFilial, string CodigoCurso, string NomeCurso)>();

                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var codigoFilial = reader["COD_FILIAL"]?.ToString() ?? "";
                    var codigoCurso = reader["COD_CURSO"]?.ToString() ?? "";
                    var nomeCurso = reader["CURSO"]?.ToString() ?? "";
                    
                    if (!string.IsNullOrEmpty(codigoFilial) && !string.IsNullOrEmpty(codigoCurso) && !string.IsNullOrEmpty(nomeCurso))
                    {
                        cursosTotvs.Add((codigoFilial, codigoCurso, nomeCurso));
                    }
                }

                var registrosSincronizados = 0;

                foreach (var (codigoFilial, codigoCurso, nomeCurso) in cursosTotvs)
                {
                    try
                    {
                        // Buscar a instituição correspondente pelo IntegracaoId (codigoFilial do curso)
                        var instituicao = await _context.Instituicoes
                            .FirstOrDefaultAsync(i => i.IntegracaoId == int.Parse(codigoFilial));

                        if (instituicao == null)
                        {
                            _logger.LogWarning("Instituição não encontrada para o IntegracaoId {CodigoFilial}, pulando curso {CodigoCurso}", 
                                codigoFilial, codigoCurso);
                            continue;
                        }

                        // Verificar se o curso já existe pelo IntegracaoId e CodigoFilial
                        var cursoExistente = await _context.Cursos
                            .Where(c => c.IntegracaoId == codigoCurso && c.CodigoFilial == codigoFilial)
                            .FirstOrDefaultAsync();

                        if (cursoExistente == null)
                        {
                            // Criar novo curso
                            var novoCurso = new Curso
                            {
                                Codigo = codigoCurso, // Campo Codigo para compatibilidade
                                IntegracaoId = codigoCurso, // Campo IntegracaoId com o código do TOTVS
                                CodigoFilial = codigoFilial, // Código da filial
                                Nome = nomeCurso,
                                InstituicaoId = instituicao.Id,
                                Ativo = true,
                                DataCadastro = DateTime.UtcNow
                            };

                            _context.Cursos.Add(novoCurso);
                            registrosSincronizados++;
                            
                            _logger.LogDebug("Novo curso criado: {Codigo} - {Nome} (Instituição: {Instituicao})", 
                                codigoCurso, nomeCurso, instituicao.Nome);
                        }
                        else
                        {
                            // Atualizar nome se necessário
                            if (cursoExistente.Nome != nomeCurso)
                            {
                                cursoExistente.Nome = nomeCurso;
                                cursoExistente.DataAtualizacao = DateTime.UtcNow;
                                registrosSincronizados++;
                                
                                _logger.LogDebug("Curso atualizado: {Codigo} - {Nome} (Instituição: {Instituicao})", 
                                    codigoCurso, nomeCurso, instituicao.Nome);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao processar curso {Codigo} - {Nome} (Instituição: {Instituicao})", 
                            codigoCurso, nomeCurso, codigoFilial);
                    }
                }

                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Sincronização de cursos concluída: {Registros} registros processados", 
                    registrosSincronizados);

                return registrosSincronizados;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de cursos");
                throw;
            }
        }

        /// <summary>
        /// Sincroniza dados de disciplinas do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        public async Task<int> SincronizarDisciplinasAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de disciplinas...");

                var query = @"
                    SELECT DISTINCT
                        pe.CODFILIAL,
                        pe.CODIGO_DISCIPLINA,
                        pe.NOME_DISCIPLINA
                    FROM V_ALUNOS pe
                    WHERE pe.CODFILIAL IS NOT NULL 
                    AND pe.CODIGO_DISCIPLINA IS NOT NULL
                    AND pe.NOME_DISCIPLINA IS NOT NULL
                    ORDER BY pe.CODFILIAL, pe.CODIGO_DISCIPLINA";

                var disciplinasTotvs = new List<(string CodigoFilial, string CodigoDisciplina, string NomeDisciplina)>();

                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var codigoFilial = reader["CODFILIAL"]?.ToString() ?? "";
                    var codigoDisciplina = reader["CODIGO_DISCIPLINA"]?.ToString() ?? "";
                    var nomeDisciplina = reader["NOME_DISCIPLINA"]?.ToString() ?? "";
                    
                    if (!string.IsNullOrEmpty(codigoFilial) && !string.IsNullOrEmpty(codigoDisciplina) && !string.IsNullOrEmpty(nomeDisciplina))
                    {
                        disciplinasTotvs.Add((codigoFilial, codigoDisciplina, nomeDisciplina));
                    }
                }

                var registrosSincronizados = 0;

                foreach (var (codigoFilial, codigoDisciplina, nomeDisciplina) in disciplinasTotvs)
                {
                    try
                    {
                        // Buscar a instituição correspondente pelo IntegracaoId (codigoFilial da disciplina)
                        var instituicao = await _context.Instituicoes
                            .FirstOrDefaultAsync(i => i.IntegracaoId == int.Parse(codigoFilial));

                        if (instituicao == null)
                        {
                            _logger.LogWarning("Instituição não encontrada para o IntegracaoId {CodigoFilial}, pulando disciplina {CodigoDisciplina}", 
                                codigoFilial, codigoDisciplina);
                            continue;
                        }

                        // Verificar se a disciplina já existe pelo Codigo e InstituicaoId
                        var disciplinaExistente = await _context.Disciplinas
                            .FirstOrDefaultAsync(d => d.Codigo == codigoDisciplina && d.InstituicaoId == instituicao.Id);

                        if (disciplinaExistente == null)
                        {
                            // Criar nova disciplina
                            var novaDisciplina = new Disciplina
                            {
                                Codigo = codigoDisciplina,
                                Nome = nomeDisciplina,
                                InstituicaoId = instituicao.Id,
                                Ativo = true
                            };

                            _context.Disciplinas.Add(novaDisciplina);
                            registrosSincronizados++;
                            
                            _logger.LogDebug("Nova disciplina criada: {Codigo} - {Nome} (Instituição: {Instituicao})", 
                                codigoDisciplina, nomeDisciplina, instituicao.Nome);
                        }
                        else
                        {
                            // Atualizar nome se necessário
                            if (disciplinaExistente.Nome != nomeDisciplina)
                            {
                                disciplinaExistente.Nome = nomeDisciplina;
                                // Disciplina atualizada
                                registrosSincronizados++;
                                
                                _logger.LogDebug("Disciplina atualizada: {Codigo} - {Nome} (Instituição: {Instituicao})", 
                                    codigoDisciplina, nomeDisciplina, instituicao.Nome);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao processar disciplina {Codigo} - {Nome} (Instituição: {Instituicao})", 
                            codigoDisciplina, nomeDisciplina, codigoFilial);
                    }
                }

                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Sincronização de disciplinas concluída: {Registros} registros processados", 
                    registrosSincronizados);

                return registrosSincronizados;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de disciplinas");
                throw;
            }
        }

        /// <summary>
        /// Sincroniza dados de períodos letivos do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        public async Task<int> SincronizarPeriodosLetivosAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de períodos letivos...");

                // Query para buscar períodos letivos únicos das views de alunos e professores
                var query = @"
                    SELECT DISTINCT
                        PERIODO_LETIVO
                    FROM (
                        SELECT PERIODO_LETIVO FROM V_ALUNOS WHERE PERIODO_LETIVO IS NOT NULL
                        UNION
                        SELECT PERIODO_LETIVO FROM V_PROFESSORES WHERE PERIODO_LETIVO IS NOT NULL
                        UNION
                        SELECT PERIODO_LETIVO FROM V_PROFESSORES_ESTAGIOS WHERE PERIODO_LETIVO IS NOT NULL
                    )
                    ORDER BY PERIODO_LETIVO";

                var periodosTotvs = new List<string>();

                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var periodoLetivo = reader["PERIODO_LETIVO"]?.ToString() ?? "";
                    
                    if (!string.IsNullOrEmpty(periodoLetivo))
                    {
                        periodosTotvs.Add(periodoLetivo);
                    }
                }

                var registrosSincronizados = 0;

                foreach (var periodoLetivo in periodosTotvs)
                {
                    try
                    {
                        // Verificar se o período letivo já existe pelo Codigo
                        var periodoExistente = await _context.PeriodosLetivos
                            .FirstOrDefaultAsync(p => p.Codigo == periodoLetivo);

                        if (periodoExistente == null)
                        {
                            // Criar novo período letivo
                            var novoPeriodo = new PeriodoLetivo
                            {
                                Codigo = periodoLetivo,
                                Nome = periodoLetivo,
                                Ativo = true,
                                DataCadastro = DateTime.UtcNow
                            };

                            _context.PeriodosLetivos.Add(novoPeriodo);
                            registrosSincronizados++;
                            
                            _logger.LogDebug("Novo período letivo criado: {Periodo}", periodoLetivo);
                        }
                        else
                        {
                            // Ativar período se estiver inativo
                            if (!periodoExistente.Ativo)
                            {
                                periodoExistente.Ativo = true;
                                periodoExistente.DataAtualizacao = DateTime.UtcNow;
                                registrosSincronizados++;
                                
                                _logger.LogDebug("Período letivo reativado: {Periodo}", periodoLetivo);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao processar período letivo {Periodo}", periodoLetivo);
                    }
                }

                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Sincronização de períodos letivos concluída: {Registros} registros processados", 
                    registrosSincronizados);

                return registrosSincronizados;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de períodos letivos");
                throw;
            }
        }

        /// <summary>
        /// Sincroniza dados de turmas do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        public async Task<int> SincronizarTurmasAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de turmas...");

                // Query para buscar turmas únicas das views (alunos e professores)
                var query = @"
                    SELECT DISTINCT
                        pe.CODFILIAL,
                        pe.CODTURMA,
                        pe.CURSO_DA_TURMA,
                        pe.COD_CURSO_DO_ALUNO,
                        pe.TIPO_TURMA,
                        pe.TURNO_POLO,
                        pe.PERIODO_LETIVO
                    FROM V_ALUNOS pe
                    WHERE pe.CODFILIAL IS NOT NULL 
                    AND pe.CODTURMA IS NOT NULL
                    AND pe.CURSO_DA_TURMA IS NOT NULL
                    AND pe.COD_CURSO_DO_ALUNO IS NOT NULL
                    AND pe.PERIODO_LETIVO IS NOT NULL
                    UNION
                    SELECT DISTINCT
                        pf.COD_FILIAL,
                        pf.COD_TURMA,
                        pf.CURSO,
                        pf.COD_CURSO,
                        pf.TIPO_TURMA,
                        pf.TURNO_POLO,
                        pf.PERIODO_LETIVO
                    FROM V_PROFESSORES pf
                    WHERE pf.COD_FILIAL IS NOT NULL 
                    AND pf.COD_TURMA IS NOT NULL
                    AND pf.CURSO IS NOT NULL
                    AND pf.COD_CURSO IS NOT NULL
                    AND pf.PERIODO_LETIVO IS NOT NULL
                    ORDER BY CODFILIAL, CODTURMA";

                var turmasTotvs = new List<(string CodigoFilial, string CodigoTurma, string NomeTurma, string CodigoCurso, string TipoTurma, string Turno, string PeriodoLetivo)>();

                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var codigoFilial = reader["CODFILIAL"]?.ToString() ?? "";
                    var codigoTurma = reader["CODTURMA"]?.ToString() ?? "";
                    var nomeTurma = reader["CODTURMA"]?.ToString() ?? "";
                    var codigoCurso = reader["COD_CURSO_DO_ALUNO"]?.ToString() ?? "";
                    var tipoTurma = reader["TIPO_TURMA"]?.ToString() ?? "";
                    var turno = reader["TURNO_POLO"]?.ToString() ?? "";
                    var periodoLetivo = reader["PERIODO_LETIVO"]?.ToString() ?? "";
                    
                    if (!string.IsNullOrEmpty(codigoFilial) && !string.IsNullOrEmpty(codigoTurma) && 
                        !string.IsNullOrEmpty(nomeTurma) && !string.IsNullOrEmpty(codigoCurso) && !string.IsNullOrEmpty(periodoLetivo))
                    {
                        turmasTotvs.Add((codigoFilial, codigoTurma, nomeTurma, codigoCurso, tipoTurma, turno, periodoLetivo));
                    }
                }

                var registrosSincronizados = 0;

                foreach (var (codigoFilial, codigoTurma, nomeTurma, codigoCurso, tipoTurma, turno, periodoLetivo) in turmasTotvs)
                {
                    try
                    {
                        // Buscar a instituição correspondente pelo IntegracaoId (codigoFilial da turma)
                        var instituicao = await _context.Instituicoes
                            .FirstOrDefaultAsync(i => i.IntegracaoId == int.Parse(codigoFilial));

                        if (instituicao == null)
                        {
                            _logger.LogWarning("Instituição não encontrada para o IntegracaoId {CodigoFilial}, pulando turma {CodigoTurma}", 
                                codigoFilial, codigoTurma);
                            continue;
                        }

                        // Buscar o período letivo correspondente
                        var periodo = await _context.PeriodosLetivos
                            .FirstOrDefaultAsync(p => p.Nome == periodoLetivo);

                        if (periodo == null)
                        {
                            _logger.LogWarning("Período letivo não encontrado para {PeriodoLetivo}, pulando turma {CodigoTurma}", 
                                periodoLetivo, codigoTurma);
                            continue;
                        }

                        // Buscar o curso correspondente
                        var curso = await _context.Cursos
                            .FirstOrDefaultAsync(c => c.IntegracaoId == codigoCurso && c.CodigoFilial == codigoFilial);
                        
                        if (curso == null)
                        {
                            _logger.LogWarning("Curso não encontrado para COD_CURSO: {CodigoCurso} na filial: {CodigoFilial}", codigoCurso, codigoFilial);
                            continue;
                        }

                        // Verificar se a turma já existe pelo IntegracaoId e InstituicaoId
                        var turmaExistente = await _context.Turmas
                            .FirstOrDefaultAsync(t => t.IntegracaoId == codigoTurma);

                        if (turmaExistente == null)
                        {
                            // Criar nova turma
                            var novaTurma = new Turma
                            {
                                Codigo = codigoTurma,
                                IntegracaoId = codigoTurma,
                                Nome = nomeTurma,
                                Descricao = $"{tipoTurma} - {turno}",
                                Turno = int.TryParse(turno, out var turnoInt) ? turnoInt : null,
                                CursoId = curso.Id, // Usar o ID do curso encontrado
                                PeriodoLetivoId = periodo.Id,
                                Ativo = true
                            };

                            _context.Turmas.Add(novaTurma);
                            await _context.SaveChangesAsync();
                            registrosSincronizados++;
                            
                            _logger.LogDebug("Nova turma criada: {CodigoTurma} - {NomeTurma} (Instituição: {Instituicao}, Período: {Periodo})", 
                                codigoTurma, nomeTurma, instituicao.Nome, periodoLetivo);
                        }
                        else
                        {
                            // Atualizar dados da turma se necessário
                            bool atualizado = false;
                            
                            if (turmaExistente.Nome != nomeTurma)
                            {
                                turmaExistente.Nome = nomeTurma;
                                atualizado = true;
                            }
                            
                            var novaDescricao = $"{tipoTurma} - {turno}";
                            if (turmaExistente.Descricao != novaDescricao)
                            {
                                turmaExistente.Descricao = novaDescricao;
                                atualizado = true;
                            }
                            
                        var novoTurno = int.TryParse(turno, out var turnoInt) ? (int?)turnoInt : null;
                        if (turmaExistente.Turno != novoTurno)
                        {
                            turmaExistente.Turno = novoTurno;
                                atualizado = true;
                            }
                            
                            if (atualizado)
                            {
                                registrosSincronizados++;
                                _logger.LogDebug("Turma atualizada: {CodigoTurma} - {NomeTurma} (Instituição: {Instituicao}, Período: {Periodo})", 
                                    codigoTurma, nomeTurma, instituicao.Nome, periodoLetivo);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao processar turma {CodigoTurma} - {NomeTurma} (Instituição: {Instituicao}, Período: {Periodo})", 
                            codigoTurma, nomeTurma, codigoFilial, periodoLetivo);
                    }
                }

               
                
                _logger.LogInformation("Sincronização de turmas concluída: {Registros} registros processados", 
                    registrosSincronizados);

                return registrosSincronizados;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de turmas");
                throw;
            }
        }

        /// <summary>
        /// Sincroniza dados de turmas-disciplinas do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        public async Task<int> SincronizarTurmasDisciplinasAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de turmas-disciplinas...");

                // Query para buscar turmas-disciplinas únicas das views (alunos e professores)
                // Incluindo lógica para turmas gerenciadas
                var query = @"
                    SELECT DISTINCT
                        a.CODFILIAL,
                        a.CODTURMA,
                        a.CODIGO_DISCIPLINA,
                        a.NOME_DISCIPLINA,
                        a.CODTURMA as NOME_TURMA,
                        a.PERIODO_LETIVO,
                        a.IDTURMADISC,
                        NULL as IDTURMADISCGERENCIADA,
                        1 as IS_ALUNO,
                        NULL as LOGIN_PROFESSOR,
                        NULL as NOME_PROFESSOR,
                        NULL as EMAIL_PROFESSOR,
                        NULL as SEXO_PROFESSOR,
                        NULL as PROF_ATIVO
                    FROM V_ALUNOS a
                    WHERE a.CODFILIAL IS NOT NULL 
                    AND a.CODTURMA IS NOT NULL
                    AND a.CODIGO_DISCIPLINA IS NOT NULL
                    AND a.NOME_DISCIPLINA IS NOT NULL
                    AND a.PERIODO_LETIVO IS NOT NULL
                    UNION
                    SELECT DISTINCT
                        p.COD_FILIAL as CODFILIAL,
                        p.COD_TURMA as CODTURMA,
                        p.COD_DISC as CODIGO_DISCIPLINA,
                        p.DISCIPLINA as NOME_DISCIPLINA,
                        p.CURSO as NOME_TURMA,
                        p.PERIODO_LETIVO,
                        p.IDTURMADISC,
                        p.IDTURMADISCGERENCIADA,
                        0 as IS_ALUNO,
                        p.LOGIN as LOGIN_PROFESSOR,
                        p.PROFESSOR as NOME_PROFESSOR,
                        p.EMAIL as EMAIL_PROFESSOR,
                        p.SEXO as SEXO_PROFESSOR,
                        p.PROF_ATIVO
                    FROM V_PROFESSORES p
                    WHERE p.COD_FILIAL IS NOT NULL 
                    AND p.COD_TURMA IS NOT NULL
                    AND p.COD_DISC IS NOT NULL
                    AND p.DISCIPLINA IS NOT NULL
                    AND p.PERIODO_LETIVO IS NOT NULL
                    ORDER BY CODFILIAL, CODTURMA, CODIGO_DISCIPLINA";

                var turmasDisciplinasTotvs = new List<(string CodigoFilial, string CodigoTurma, string CodigoDisciplina, string NomeDisciplina, string NomeTurma, string PeriodoLetivo, string IdTurmaDisc, string IdTurmaDiscGerenciada, bool IsAluno, string LoginProfessor, string NomeProfessor, string EmailProfessor, string SexoProfessor, string ProfAtivo)>();

                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var codigoFilial = reader["CODFILIAL"]?.ToString() ?? "";
                    var codigoTurma = reader["CODTURMA"]?.ToString() ?? "";
                    var codigoDisciplina = reader["CODIGO_DISCIPLINA"]?.ToString() ?? "";
                    var nomeDisciplina = reader["NOME_DISCIPLINA"]?.ToString() ?? "";
                    var nomeTurma = reader["NOME_TURMA"]?.ToString() ?? "";
                    var periodoLetivo = reader["PERIODO_LETIVO"]?.ToString() ?? "";
                    var idTurmaDisc = reader["IDTURMADISC"]?.ToString() ?? "";
                    var idTurmaDiscGerenciada = reader["IDTURMADISCGERENCIADA"]?.ToString() ?? "";
                    var isAluno = reader["IS_ALUNO"]?.ToString() == "1";
                    var loginProfessor = reader["LOGIN_PROFESSOR"]?.ToString() ?? "";
                    var nomeProfessor = reader["NOME_PROFESSOR"]?.ToString() ?? "";
                    var emailProfessor = reader["EMAIL_PROFESSOR"]?.ToString() ?? "";
                    var sexoProfessor = reader["SEXO_PROFESSOR"]?.ToString() ?? "";
                    var profAtivo = reader["PROF_ATIVO"]?.ToString() ?? "";
                    
                    if (!string.IsNullOrEmpty(codigoFilial) && !string.IsNullOrEmpty(codigoTurma) && 
                        !string.IsNullOrEmpty(codigoDisciplina) && !string.IsNullOrEmpty(nomeDisciplina) &&
                        !string.IsNullOrEmpty(periodoLetivo))
                    {
                        turmasDisciplinasTotvs.Add((codigoFilial, codigoTurma, codigoDisciplina, nomeDisciplina, nomeTurma, periodoLetivo, idTurmaDisc, idTurmaDiscGerenciada, isAluno, loginProfessor, nomeProfessor, emailProfessor, sexoProfessor, profAtivo));
                    }
                }

                var registrosSincronizados = 0;

                // FASE 1: Processar turmas-disciplinas NÃO gerenciadas primeiro (originais)
                var turmasNaoGerenciadas = turmasDisciplinasTotvs.Where(t => string.IsNullOrEmpty(t.IdTurmaDiscGerenciada)).ToList();
                
                _logger.LogInformation("Processando {Count} turmas-disciplinas não gerenciadas (originais)...", turmasNaoGerenciadas.Count);

                foreach (var (codigoFilial, codigoTurma, codigoDisciplina, nomeDisciplina, nomeTurma, periodoLetivo, idTurmaDisc, idTurmaDiscGerenciada, isAluno, loginProfessor, nomeProfessor, emailProfessor, sexoProfessor, profAtivo) in turmasNaoGerenciadas)
                {
                    try
                    {
                        // Buscar a instituição correspondente pelo IntegracaoId
                        var instituicao = await _context.Instituicoes
                            .FirstOrDefaultAsync(i => i.IntegracaoId == int.Parse(codigoFilial));

                        if (instituicao == null)
                        {
                            _logger.LogWarning("Instituição não encontrada para o código {CodigoFilial}, pulando turma-disciplina {CodigoTurma}-{CodigoDisciplina}", 
                                codigoFilial, codigoTurma, codigoDisciplina);
                            continue;
                        }

                        // Buscar o período letivo correspondente
                        var periodo = await _context.PeriodosLetivos
                            .FirstOrDefaultAsync(p => p.Nome == periodoLetivo);

                        if (periodo == null)
                        {
                            _logger.LogWarning("Período letivo não encontrado para {PeriodoLetivo}, pulando turma-disciplina {CodigoTurma}-{CodigoDisciplina}", 
                                periodoLetivo, codigoTurma, codigoDisciplina);
                            continue;
                        }

                        // Buscar a disciplina correspondente
                        var disciplina = await _context.Disciplinas
                            .FirstOrDefaultAsync(d => d.Codigo == codigoDisciplina && d.InstituicaoId == instituicao.Id);

                        if (disciplina == null)
                        {
                            _logger.LogWarning("Disciplina não encontrada para o código {CodigoDisciplina} na instituição {Instituicao}, pulando turma-disciplina {CodigoTurma}-{CodigoDisciplina}", 
                                codigoDisciplina, instituicao.Nome, codigoTurma, codigoDisciplina);
                            continue;
                        }

                        // Buscar a turma correspondente
                        var turma = await _context.Turmas
                            .FirstOrDefaultAsync(t => t.IntegracaoId == codigoTurma);

                        if (turma == null)
                        {
                            _logger.LogWarning("Turma não encontrada: {CodigoTurma}", codigoTurma);
                            continue;
                        }

                        // Verificar se a turma-disciplina já existe
                        var turmaDisciplinaExistente = await _context.TurmasDisciplinas
                            .FirstOrDefaultAsync(td => td.TurmaId == turma.Id && td.DisciplinaId == disciplina.Id);

                        if (turmaDisciplinaExistente == null)
                        {
                            // Buscar o professor real baseado nos dados da query
                            Professor? professor = null;
                            
                            if (!string.IsNullOrEmpty(loginProfessor))
                            {
                                // Buscar professor existente pelo LOGIN
                                professor = await _context.Professores
                                    .FirstOrDefaultAsync(p => p.IntegracaoId == loginProfessor);
                                
                                // Se não existe, criar o professor com dados do TOTVS
                                if (professor == null)
                                {
                                    professor = new Professor
                                    {
                                        Nome = nomeProfessor ?? "Professor",
                                        Email = emailProfessor ?? "",
                                        Login = loginProfessor,
                                        Sexo = ObterSexoDoTotvs(sexoProfessor),
                                        InstituicaoId = instituicao.Id,
                                        IntegracaoId = loginProfessor,
                                        Ativo = profAtivo == "S",
                                        DataCadastro = DateTime.UtcNow
                                    };
                                    _context.Professores.Add(professor);
                                    await _context.SaveChangesAsync();
                                    
                                    _logger.LogDebug("Professor criado: {Nome} (LOGIN: {Login})", nomeProfessor, loginProfessor);
                                }
                            }
                            else
                            {
                                // Se não tem LOGIN (dados de V_ALUNOS), buscar professor por IDTURMADISC na view V_PROFESSORES
                                var queryProfessor = @"
                                    SELECT DISTINCT p.LOGIN, p.PROFESSOR, p.EMAIL, p.SEXO, p.PROF_ATIVO
                                    FROM V_PROFESSORES p
                                    WHERE p.IDTURMADISC = :idTurmaDisc
                                    AND p.COD_FILIAL = :codigoFilial
                                    AND p.COD_DISC = :codigoDisciplina
                                    AND ROWNUM = 1";

                                using var commandProfessor = new OracleCommand(queryProfessor, connection);
                                commandProfessor.Parameters.Add(new OracleParameter("idTurmaDisc", idTurmaDisc));
                                commandProfessor.Parameters.Add(new OracleParameter("codigoFilial", codigoFilial));
                                commandProfessor.Parameters.Add(new OracleParameter("codigoDisciplina", codigoDisciplina));
                                
                                using var readerProfessor = await commandProfessor.ExecuteReaderAsync();
                                if (await readerProfessor.ReadAsync())
                                {
                                    var loginProfEncontrado = readerProfessor["LOGIN"]?.ToString();
                                    if (!string.IsNullOrEmpty(loginProfEncontrado))
                                    {
                                        professor = await _context.Professores
                                            .FirstOrDefaultAsync(p => p.IntegracaoId == loginProfEncontrado);
                                        
                                        // Se não existe, criar o professor
                                        if (professor == null)
                                        {
                                            professor = new Professor
                                            {
                                                Nome = readerProfessor["PROFESSOR"]?.ToString() ?? "Professor",
                                                Email = readerProfessor["EMAIL"]?.ToString() ?? "",
                                                Login = loginProfEncontrado,
                                                Sexo = ObterSexoDoTotvs(readerProfessor["SEXO"]?.ToString()),
                                                InstituicaoId = instituicao.Id,
                                                IntegracaoId = loginProfEncontrado,
                                                Ativo = readerProfessor["PROF_ATIVO"]?.ToString() == "S",
                                                DataCadastro = DateTime.UtcNow
                                            };
                                            _context.Professores.Add(professor);
                                            await _context.SaveChangesAsync();
                                            
                                            _logger.LogDebug("Professor encontrado e criado: {Nome} (LOGIN: {Login})", readerProfessor["PROFESSOR"], loginProfEncontrado);
                                        }
                                    }
                                }
                            }

                            // Se ainda não encontrou professor, criar um padrão
                            if (professor == null)
                            {
                                professor = new Professor
                                {
                                    Nome = "Professor Padrão",
                                    Email = "professor.padrao@instituicao.com",
                                    Login = "PROF_PADRAO",
                                    InstituicaoId = instituicao.Id,
                                    IntegracaoId = "PROF_PADRAO",
                                    Ativo = true,
                                    DataCadastro = DateTime.UtcNow
                                };
                                _context.Professores.Add(professor);
                                await _context.SaveChangesAsync();
                                
                                _logger.LogWarning("Professor padrão criado para turma-disciplina {CodigoTurma}-{CodigoDisciplina}", codigoTurma, codigoDisciplina);
                            }

                            // Criar nova turma-disciplina (não gerenciada)
                            var novaTurmaDisciplina = new TurmaDisciplina
                            {
                                TurmaId = turma.Id,
                                DisciplinaId = disciplina.Id,
                                ProfessorId = professor.Id, // Usar professor real ou padrão
                                PeriodoLetivoId = periodo.Id,
                                Ativo = true,
                                DataCriacao = DateTime.UtcNow,
                                Gerenciada = false, // Não é gerenciada (original)
                                IntegracaoId = idTurmaDisc // ID do TOTVS para referência
                            };

                            _context.TurmasDisciplinas.Add(novaTurmaDisciplina);
                            await _context.SaveChangesAsync();
                            registrosSincronizados++;
                            
                            _logger.LogDebug("Nova turma-disciplina criada: {CodigoTurma}-{CodigoDisciplina} (Instituição: {Instituicao}, Período: {Periodo})", 
                                codigoTurma, codigoDisciplina, instituicao.Nome, periodoLetivo);
                        }
                        else
                        {
                            // Turma-disciplina já existe, não precisa atualizar
                            _logger.LogDebug("Turma-disciplina já existe: {CodigoTurma}-{CodigoDisciplina}", codigoTurma, codigoDisciplina);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao processar turma-disciplina {CodigoTurma}-{CodigoDisciplina} (Instituição: {Instituicao}, Período: {Periodo})", 
                            codigoTurma, codigoDisciplina, codigoFilial, periodoLetivo);
                    }
                }

                // FASE 2: Processar turmas-disciplinas GERENCIADAS (que dependem das originais)
                var turmasGerenciadas = turmasDisciplinasTotvs.Where(t => !string.IsNullOrEmpty(t.IdTurmaDiscGerenciada)).ToList();
                
                _logger.LogInformation("Processando {Count} turmas-disciplinas gerenciadas...", turmasGerenciadas.Count);

                foreach (var (codigoFilial, codigoTurma, codigoDisciplina, nomeDisciplina, nomeTurma, periodoLetivo, idTurmaDisc, idTurmaDiscGerenciada, isAluno, loginProfessor, nomeProfessor, emailProfessor, sexoProfessor, profAtivo) in turmasGerenciadas)
                {
                    try
                    {
                        // Buscar a instituição correspondente pelo IntegracaoId
                        var instituicao = await _context.Instituicoes
                            .FirstOrDefaultAsync(i => i.IntegracaoId == int.Parse(codigoFilial));
                        
                        if (instituicao == null)
                        {
                            _logger.LogWarning("Instituição não encontrada para CODFILIAL: {CodigoFilial}", codigoFilial);
                            continue;
                        }

                        // Buscar o período letivo
                        var periodo = await _context.PeriodosLetivos
                            .FirstOrDefaultAsync(p => p.Nome == periodoLetivo);
                        
                        if (periodo == null)
                        {
                            _logger.LogWarning("Período letivo não encontrado para {PeriodoLetivo}, pulando turma-disciplina {CodigoTurma}-{CodigoDisciplina}", 
                                periodoLetivo, codigoTurma, codigoDisciplina);
                            continue;
                        }

                        // Buscar a disciplina
                        var disciplina = await _context.Disciplinas
                            .FirstOrDefaultAsync(d => d.Codigo == codigoDisciplina && d.InstituicaoId == instituicao.Id);
                        
                        if (disciplina == null)
                        {
                            _logger.LogWarning("Disciplina não encontrada: {CodigoDisciplina} na instituição {InstituicaoId}", codigoDisciplina, instituicao.Id);
                            continue;
                        }

                        // Buscar a turma
                        var turma = await _context.Turmas
                            .FirstOrDefaultAsync(t => t.IntegracaoId == codigoTurma);
                        
                        if (turma == null)
                        {
                            _logger.LogWarning("Turma não encontrada: {CodigoTurma}", codigoTurma);
                            continue;
                        }

                        // Buscar a turma-disciplina ORIGINAL (não gerenciada) pelo IDTURMADISCGERENCIADA
                        var turmaDisciplinaOriginal = await _context.TurmasDisciplinas
                            .FirstOrDefaultAsync(td => td.IntegracaoId == idTurmaDiscGerenciada && td.Gerenciada == false);
                        
                        if (turmaDisciplinaOriginal == null)
                        {
                            _logger.LogWarning("Turma-disciplina original não encontrada para IDTURMADISCGERENCIADA: {IdTurmaDiscGerenciada}", idTurmaDiscGerenciada);
                            continue;
                        }

                        // Verificar se a turma-disciplina gerenciada já existe
                        var turmaDisciplinaGerenciadaExistente = await _context.TurmasDisciplinas
                            .FirstOrDefaultAsync(td => td.TurmaId == turma.Id && td.DisciplinaId == disciplina.Id && td.Gerenciada == true);

                        if (turmaDisciplinaGerenciadaExistente == null)
                        {
                            // Usar o mesmo professor da turma-disciplina original
                            var professor = await _context.Professores
                                .FirstOrDefaultAsync(p => p.Id == turmaDisciplinaOriginal.ProfessorId);
                            
                            // Se não encontrou o professor da turma original, usar o professor da query atual
                            if (professor == null && !string.IsNullOrEmpty(loginProfessor))
                            {
                                professor = await _context.Professores
                                    .FirstOrDefaultAsync(p => p.IntegracaoId == loginProfessor);
                                
                                // Se não existe, criar o professor
                                if (professor == null)
                                {
                                    professor = new Professor
                                    {
                                        Nome = nomeProfessor ?? "Professor",
                                        Email = emailProfessor ?? "",
                                        Login = loginProfessor,
                                        Sexo = ObterSexoDoTotvs(sexoProfessor),
                                        InstituicaoId = instituicao.Id,
                                        IntegracaoId = loginProfessor,
                                        Ativo = profAtivo == "S",
                                        DataCadastro = DateTime.UtcNow
                                    };
                                    _context.Professores.Add(professor);
                                    await _context.SaveChangesAsync();
                                }
                            }
                            
                            // Se ainda não encontrou, usar professor padrão
                            if (professor == null)
                            {
                                professor = await _context.Professores
                                    .Where(p => p.InstituicaoId == instituicao.Id)
                                    .FirstOrDefaultAsync();
                                
                                if (professor == null)
                                {
                                    professor = new Professor
                                    {
                                        Nome = "Professor Padrão",
                                        Email = "professor.padrao@instituicao.com",
                                        Login = "PROF_PADRAO",
                                        InstituicaoId = instituicao.Id,
                                        IntegracaoId = "PROF_PADRAO",
                                        Ativo = true,
                                        DataCadastro = DateTime.UtcNow
                                    };
                                    _context.Professores.Add(professor);
                                    await _context.SaveChangesAsync();
                                }
                            }

                            // Criar nova turma-disciplina GERENCIADA
                            var novaTurmaDisciplinaGerenciada = new TurmaDisciplina
                            {
                                TurmaId = turma.Id,
                                DisciplinaId = disciplina.Id,
                                ProfessorId = professor.Id, // Usar professor real
                                PeriodoLetivoId = periodo.Id,
                                Ativo = true,
                                DataCriacao = DateTime.UtcNow,
                                Gerenciada = true, // É gerenciada
                                IdTurmaDisciplinaGerenciada = turmaDisciplinaOriginal.Id, // Referencia a turma original
                                IntegracaoId = idTurmaDisc // ID do TOTVS para referência
                            };

                            _context.TurmasDisciplinas.Add(novaTurmaDisciplinaGerenciada);
                            await _context.SaveChangesAsync();
                            registrosSincronizados++;
                            
                            _logger.LogDebug("Nova turma-disciplina GERENCIADA criada: {CodigoTurma}-{CodigoDisciplina} (Instituição: {Instituicao}, Período: {Periodo}) -> Original: {IdOriginal}", 
                                codigoTurma, codigoDisciplina, instituicao.Nome, periodoLetivo, turmaDisciplinaOriginal.Id);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao processar turma-disciplina gerenciada {CodigoTurma}-{CodigoDisciplina} (Instituição: {CodigoFilial})", 
                            codigoTurma, codigoDisciplina, codigoFilial);
                    }
                }
                
                _logger.LogInformation("Sincronização de turmas-disciplinas concluída: {Registros} registros processados ({NaoGerenciadas} não gerenciadas + {Gerenciadas} gerenciadas)", 
                    registrosSincronizados, turmasNaoGerenciadas.Count, turmasGerenciadas.Count);

                return registrosSincronizados;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de turmas-disciplinas");
                throw;
            }
        }

        /// <summary>
        /// Sincroniza associações aluno-turma-disciplina do TOTVS com o banco local
        /// </summary>
        /// <returns>Número de registros sincronizados</returns>
        public async Task<int> SincronizarAlunoTurmaDisciplinaAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de associações aluno-turma-disciplina...");

                var query = @"
                    SELECT DISTINCT
                        pe.CODIGO_PESSOA,
                        pe.CODFILIAL,
                        pe.COD_TURMA,
                        pe.CODIGO_DISCIPLINA,
                        pe.PERIODO_LETIVO
                    FROM V_ALUNOS pe
                    WHERE pe.CODIGO_PESSOA IS NOT NULL 
                    AND pe.CODFILIAL IS NOT NULL
                    AND pe.COD_TURMA IS NOT NULL
                    AND pe.CODIGO_DISCIPLINA IS NOT NULL
                    AND pe.PERIODO_LETIVO IS NOT NULL
                    ORDER BY pe.CODIGO_PESSOA, pe.COD_TURMA, pe.CODIGO_DISCIPLINA";

                var associacoesTotvs = new List<(string CodigoPessoa, string CodigoFilial, string CodigoTurma, string CodigoDisciplina, string PeriodoLetivo)>();

                using var connection = new OracleConnection(Conexao.GetConnectionString(_configuration));
                await connection.OpenAsync();

                using var command = new OracleCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var codigoPessoa = reader["CODIGO_PESSOA"]?.ToString() ?? "";
                    var codigoFilial = reader["CODFILIAL"]?.ToString() ?? "";
                    var codigoTurma = reader["COD_TURMA"]?.ToString() ?? "";
                    var codigoDisciplina = reader["CODIGO_DISCIPLINA"]?.ToString() ?? "";
                    var periodoLetivo = reader["PERIODO_LETIVO"]?.ToString() ?? "";
                    
                    if (!string.IsNullOrEmpty(codigoPessoa) && !string.IsNullOrEmpty(codigoFilial) && 
                        !string.IsNullOrEmpty(codigoTurma) && !string.IsNullOrEmpty(codigoDisciplina) &&
                        !string.IsNullOrEmpty(periodoLetivo))
                    {
                        associacoesTotvs.Add((codigoPessoa, codigoFilial, codigoTurma, codigoDisciplina, periodoLetivo));
                    }
                }

                var registrosSincronizados = 0;

                foreach (var (codigoPessoa, codigoFilial, codigoTurma, codigoDisciplina, periodoLetivo) in associacoesTotvs)
                {
                    try
                    {
                        // Buscar o aluno pelo IntegracaoId
                        var aluno = await _context.Alunos
                            .FirstOrDefaultAsync(a => a.IntegracaoId == codigoPessoa);

                        if (aluno == null)
                        {
                            _logger.LogWarning("Aluno não encontrado para CODIGO_PESSOA: {CodigoPessoa}", codigoPessoa);
                            continue;
                        }

                        // Buscar a instituição correspondente
                        var instituicao = await _context.Instituicoes
                            .FirstOrDefaultAsync(i => i.IntegracaoId == int.Parse(codigoFilial));

                        if (instituicao == null)
                        {
                            _logger.LogWarning("Instituição não encontrada para CODFILIAL: {CodigoFilial}", codigoFilial);
                            continue;
                        }

                        // Buscar o período letivo correspondente
                        var periodo = await _context.PeriodosLetivos
                            .FirstOrDefaultAsync(p => p.Nome == periodoLetivo);

                        if (periodo == null)
                        {
                            _logger.LogWarning("Período letivo não encontrado: {PeriodoLetivo}", periodoLetivo);
                            continue;
                        }

                        // Buscar a disciplina correspondente
                        var disciplina = await _context.Disciplinas
                            .FirstOrDefaultAsync(d => d.Codigo == codigoDisciplina && d.InstituicaoId == instituicao.Id);

                        if (disciplina == null)
                        {
                            _logger.LogWarning("Disciplina não encontrada: {CodigoDisciplina} na instituição {InstituicaoId}", codigoDisciplina, instituicao.Id);
                            continue;
                        }

                        // Buscar a turma correspondente
                        var turma = await _context.Turmas
                            .FirstOrDefaultAsync(t => t.IntegracaoId == codigoTurma);

                        if (turma == null)
                        {
                            _logger.LogWarning("Turma não encontrada: {CodigoTurma}", codigoTurma);
                            continue;
                        }

                        // Buscar a turma-disciplina correspondente
                        var turmaDisciplina = await _context.TurmasDisciplinas
                            .FirstOrDefaultAsync(td => td.TurmaId == turma.Id && td.DisciplinaId == disciplina.Id);

                        if (turmaDisciplina == null)
                        {
                            _logger.LogWarning("Turma-disciplina não encontrada: {CodigoTurma}-{CodigoDisciplina}", codigoTurma, codigoDisciplina);
                            continue;
                        }

                        // Verificar se a associação já existe na tabela AlunoTurmaDisciplina
                        var associacaoExistente = await _context.Database
                            .ExecuteSqlRawAsync("SELECT COUNT(*) FROM AlunoTurmaDisciplina WHERE AlunosAlunoId = {0} AND TurmasDisciplinasId = {1}", 
                                aluno.AlunoId, turmaDisciplina.Id);

                        if (associacaoExistente == 0)
                        {
                            // Criar a associação na tabela AlunoTurmaDisciplina
                            await _context.Database.ExecuteSqlRawAsync(
                                "INSERT INTO AlunoTurmaDisciplina (AlunosAlunoId, TurmasDisciplinasId) VALUES ({0}, {1})",
                                aluno.AlunoId, turmaDisciplina.Id);
                            
                            registrosSincronizados++;
                            _logger.LogDebug("Associação criada: Aluno {AlunoId} - TurmaDisciplina {TurmaDisciplinaId}", 
                                aluno.AlunoId, turmaDisciplina.Id);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao processar associação aluno-turma-disciplina {CodigoPessoa}-{CodigoTurma}-{CodigoDisciplina}", 
                            codigoPessoa, codigoTurma, codigoDisciplina);
                    }
                }

                _logger.LogInformation("Sincronização de associações aluno-turma-disciplina concluída. Registros processados: {RegistrosSincronizados}", registrosSincronizados);

                return registrosSincronizados;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de associações aluno-turma-disciplina");
                throw;
            }
        }

        /// <summary>
        /// Converte o valor de sexo do TOTVS para o enum Sexo
        /// </summary>
        /// <param name="sexoTotvs">Valor do sexo do TOTVS ("M", "F" ou outro)</param>
        /// <returns>Enum Sexo correspondente ou null</returns>
        private static Sexo? ObterSexoDoTotvs(string? sexoTotvs)
        {
            if (string.IsNullOrEmpty(sexoTotvs))
                return null;

            return sexoTotvs.ToUpper() switch
            {
                "M" => Sexo.Masculino,
                "F" => Sexo.Feminino,
                _ => null
            };
        }

        #endregion
    }
}
