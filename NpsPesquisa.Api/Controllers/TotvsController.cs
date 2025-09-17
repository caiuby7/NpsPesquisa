using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NpsPesquisa.Api.IntegracaoExterna.Models;
using NpsPesquisa.Api.IntegracaoExterna.Services;

namespace NpsPesquisa.Api.Controllers
{
    /// <summary>
    /// Controller para integração com TOTVS
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TotvsController : ControllerBase
    {
        private readonly ITotvsService _totvsService;
        private readonly ILogger<TotvsController> _logger;

        public TotvsController(ITotvsService totvsService, ILogger<TotvsController> logger)
        {
            _totvsService = totvsService;
            _logger = logger;
        }

        #region Alunos

        /// <summary>
        /// Busca todos os alunos do TOTVS
        /// </summary>
        /// <returns>Lista de alunos</returns>
        [HttpGet("alunos")]
        public async Task<ActionResult<List<TotvsAluno>>> BuscarTodosAlunos()
        {
            try
            {
                var alunos = await _totvsService.BuscarTodosAlunosAsync();
                return Ok(alunos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar todos os alunos");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        /// <summary>
        /// Busca aluno por RA
        /// </summary>
        /// <param name="ra">RA do aluno</param>
        /// <returns>Dados do aluno</returns>
        [HttpGet("alunos/{ra}")]
        public async Task<ActionResult<TotvsAluno>> BuscarAlunoPorRA(string ra)
        {
            try
            {
                var aluno = await _totvsService.BuscarAlunoPorRAAsync(ra);
                if (aluno == null)
                {
                    return NotFound($"Aluno com RA {ra} não encontrado");
                }
                return Ok(aluno);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar aluno por RA: {RA}", ra);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        /// <summary>
        /// Busca alunos por período letivo
        /// </summary>
        /// <param name="periodoLetivo">Período letivo</param>
        /// <returns>Lista de alunos do período</returns>
        [HttpGet("alunos/periodo/{periodoLetivo}")]
        public async Task<ActionResult<List<TotvsAluno>>> BuscarAlunosPorPeriodo(string periodoLetivo)
        {
            try
            {
                var alunos = await _totvsService.BuscarAlunosPorPeriodoAsync(periodoLetivo);
                return Ok(alunos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar alunos por período: {PeriodoLetivo}", periodoLetivo);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        /// <summary>
        /// Busca alunos por curso
        /// </summary>
        /// <param name="codigoCurso">Código do curso</param>
        /// <returns>Lista de alunos do curso</returns>
        [HttpGet("alunos/curso/{codigoCurso}")]
        public async Task<ActionResult<List<TotvsAluno>>> BuscarAlunosPorCurso(string codigoCurso)
        {
            try
            {
                var alunos = await _totvsService.BuscarAlunosPorCursoAsync(codigoCurso);
                return Ok(alunos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar alunos por curso: {CodigoCurso}", codigoCurso);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        #endregion

        #region Professores

        /// <summary>
        /// Busca todos os professores do TOTVS
        /// </summary>
        /// <returns>Lista de professores</returns>
        [HttpGet("professores")]
        public async Task<ActionResult<List<TotvsProfessor>>> BuscarTodosProfessores()
        {
            try
            {
                var professores = await _totvsService.BuscarTodosProfessoresAsync();
                return Ok(professores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar todos os professores");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        /// <summary>
        /// Busca professor por login
        /// </summary>
        /// <param name="login">Login do professor</param>
        /// <returns>Dados do professor</returns>
        [HttpGet("professores/{login}")]
        public async Task<ActionResult<TotvsProfessor>> BuscarProfessorPorLogin(string login)
        {
            try
            {
                var professor = await _totvsService.BuscarProfessorPorLoginAsync(login);
                if (professor == null)
                {
                    return NotFound($"Professor com login {login} não encontrado");
                }
                return Ok(professor);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar professor por login: {Login}", login);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        /// <summary>
        /// Busca professores por período letivo
        /// </summary>
        /// <param name="periodoLetivo">Período letivo</param>
        /// <returns>Lista de professores do período</returns>
        [HttpGet("professores/periodo/{periodoLetivo}")]
        public async Task<ActionResult<List<TotvsProfessor>>> BuscarProfessoresPorPeriodo(string periodoLetivo)
        {
            try
            {
                var professores = await _totvsService.BuscarProfessoresPorPeriodoAsync(periodoLetivo);
                return Ok(professores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar professores por período: {PeriodoLetivo}", periodoLetivo);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        /// <summary>
        /// Busca professores por curso
        /// </summary>
        /// <param name="codigoCurso">Código do curso</param>
        /// <returns>Lista de professores do curso</returns>
        [HttpGet("professores/curso/{codigoCurso}")]
        public async Task<ActionResult<List<TotvsProfessor>>> BuscarProfessoresPorCurso(string codigoCurso)
        {
            try
            {
                var professores = await _totvsService.BuscarProfessoresPorCursoAsync(codigoCurso);
                return Ok(professores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar professores por curso: {CodigoCurso}", codigoCurso);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        #endregion

        #region Sincronização

        /// <summary>
        /// Sincroniza todos os alunos do TOTVS com o banco local
        /// </summary>
        /// <param name="periodoLetivo">Período letivo opcional para filtrar</param>
        /// <returns>Número de registros sincronizados</returns>
        [HttpPost("sincronizar/alunos")]
        public async Task<ActionResult<int>> SincronizarAlunos([FromQuery] string? periodoLetivo = null)
        {
            try
            {
                var registrosSincronizados = await _totvsService.SincronizarAlunosAsync(periodoLetivo);
                return Ok(new { 
                    mensagem = "Sincronização de alunos concluída com sucesso",
                    registrosSincronizados = registrosSincronizados
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao sincronizar alunos");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        /// <summary>
        /// Sincroniza todos os professores do TOTVS com o banco local
        /// </summary>
        /// <param name="periodoLetivo">Período letivo opcional para filtrar</param>
        /// <returns>Número de registros sincronizados</returns>
        [HttpPost("sincronizar/professores")]
        public async Task<ActionResult<int>> SincronizarProfessores([FromQuery] string? periodoLetivo = null)
        {
            try
            {
                var registrosSincronizados = await _totvsService.SincronizarProfessoresAsync(periodoLetivo);
                return Ok(new { 
                    mensagem = "Sincronização de professores concluída com sucesso",
                    registrosSincronizados = registrosSincronizados
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao sincronizar professores");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        /// <summary>
        /// Sincroniza todos os dados (alunos e professores) do TOTVS
        /// </summary>
        /// <param name="periodoLetivo">Período letivo opcional para filtrar</param>
        /// <returns>Número de registros sincronizados</returns>
        [HttpPost("sincronizar/todos")]
        public async Task<ActionResult<object>> SincronizarTodos([FromQuery] string? periodoLetivo = null)
        {
            try
            {
                var alunosSincronizados = await _totvsService.SincronizarAlunosAsync(periodoLetivo);
                var professoresSincronizados = await _totvsService.SincronizarProfessoresAsync(periodoLetivo);
                
                return Ok(new { 
                    mensagem = "Sincronização completa concluída com sucesso",
                    alunosSincronizados = alunosSincronizados,
                    professoresSincronizados = professoresSincronizados,
                    totalSincronizados = alunosSincronizados + professoresSincronizados
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao sincronizar todos os dados");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        #endregion

        #region Relatórios

        /// <summary>
        /// Gera relatório de dados sincronizados do TOTVS
        /// </summary>
        /// <param name="periodoLetivo">Período letivo opcional</param>
        /// <returns>Relatório de sincronização</returns>
        [HttpGet("relatorio/sincronizacao")]
        public async Task<ActionResult<object>> GerarRelatorioSincronizacao([FromQuery] string? periodoLetivo = null)
        {
            try
            {
                var alunos = periodoLetivo != null 
                    ? await _totvsService.BuscarAlunosPorPeriodoAsync(periodoLetivo)
                    : await _totvsService.BuscarTodosAlunosAsync();

                var professores = periodoLetivo != null 
                    ? await _totvsService.BuscarProfessoresPorPeriodoAsync(periodoLetivo)
                    : await _totvsService.BuscarTodosProfessoresAsync();

                var relatorio = new
                {
                    periodoLetivo = periodoLetivo ?? "Todos",
                    totalAlunos = alunos.Count,
                    totalProfessores = professores.Count,
                    totalRegistros = alunos.Count + professores.Count,
                    dataGeracao = DateTime.Now,
                    alunosPorCurso = alunos.GroupBy(a => a.CURSO_DO_ALUNO)
                        .Select(g => new { curso = g.Key, quantidade = g.Count() })
                        .OrderByDescending(x => x.quantidade)
                        .Take(10),
                    professoresPorCurso = professores.GroupBy(p => p.CURSO)
                        .Select(g => new { curso = g.Key, quantidade = g.Count() })
                        .OrderByDescending(x => x.quantidade)
                        .Take(10)
                };

                return Ok(relatorio);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar relatório de sincronização");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        #endregion
    }
}
