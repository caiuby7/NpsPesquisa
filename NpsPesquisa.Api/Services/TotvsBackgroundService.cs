using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.IntegracaoExterna.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NpsPesquisa.Api.Services
{
    /// <summary>
    /// Serviço de background para sincronização automática com TOTVS
    /// </summary>
    public class TotvsBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TotvsBackgroundService> _logger;
        private readonly IConfiguration _configuration;

        public TotvsBackgroundService(
            IServiceProvider serviceProvider, 
            ILogger<TotvsBackgroundService> logger,
            IConfiguration configuration)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Aguardar 30 segundos na inicialização
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var totvsService = scope.ServiceProvider.GetRequiredService<ITotvsService>();
                    var context = scope.ServiceProvider.GetRequiredService<NpsDbContext>();

                    _logger.LogInformation("Iniciando sincronização automática com TOTVS...");

                    // Sincronizar instituições primeiro
                    await SincronizarInstituicoesAsync(totvsService, context);
                    
                    // Sincronizar períodos letivos
                    await SincronizarPeriodosLetivosAsync(totvsService, context);
                    
                    // Sincronizar cursos
                    await SincronizarCursosAsync(totvsService, context);
                    
                    // Sincronizar disciplinas
                    await SincronizarDisciplinasAsync(totvsService, context);
                    
                    // Sincronizar turmas
                    await SincronizarTurmasAsync(totvsService, context);
                    
                    // Sincronizar turmas-disciplinas
                    await SincronizarTurmasDisciplinasAsync(totvsService, context);
                    await SincronizarAlunoTurmaDisciplinaAsync(totvsService, context);

                    // Verificar se há questionários ativos que precisam de dados atualizados
                    var questionariosAtivos = await context.Questionarios
                        .Where(q => q.DataInicio <= DateTime.UtcNow && q.DataFim >= DateTime.UtcNow)
                        .CountAsync();

                    if (questionariosAtivos > 0)
                    {
                        // Sincronizar apenas o período letivo atual
                        var periodoAtual = await ObterPeriodoLetivoAtual(context);
                        
                        if (!string.IsNullOrEmpty(periodoAtual))
                        {
                            _logger.LogInformation("Sincronizando dados do período letivo: {PeriodoLetivo}", periodoAtual);
                            
                            var alunosSincronizados = await totvsService.SincronizarAlunosAsync(periodoAtual);
                            var professoresSincronizados = await totvsService.SincronizarProfessoresAsync(periodoAtual);
                            
                            _logger.LogInformation(
                                "Sincronização TOTVS concluída - Alunos: {Alunos}, Professores: {Professores}", 
                                alunosSincronizados, 
                                professoresSincronizados);
                        }
                        else
                        {
                            _logger.LogWarning("Período letivo atual não identificado, pulando sincronização");
                        }
                    }
                    else
                    {
                        _logger.LogInformation("Nenhum questionário ativo encontrado, pulando sincronização");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro durante sincronização automática com TOTVS");
                }

                // Aguardar 6 horas antes da próxima sincronização
                await Task.Delay(TimeSpan.FromHours(6), stoppingToken);
            }
        }

        /// <summary>
        /// Sincroniza instituições do TOTVS
        /// </summary>
        private async Task SincronizarInstituicoesAsync(ITotvsService totvsService, NpsDbContext context)
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de instituições...");
                
                var instituicoesSincronizadas = await totvsService.SincronizarInstituicoesAsync();
                
                _logger.LogInformation("Sincronização de instituições concluída: {Instituicoes} instituições processadas", 
                    instituicoesSincronizadas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de instituições");
            }
        }

        /// <summary>
        /// Sincroniza períodos letivos do TOTVS
        /// </summary>
        private async Task SincronizarPeriodosLetivosAsync(ITotvsService totvsService, NpsDbContext context)
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de períodos letivos...");
                
                var periodosSincronizados = await totvsService.SincronizarPeriodosLetivosAsync();
                
                _logger.LogInformation("Sincronização de períodos letivos concluída: {Periodos} períodos processados", 
                    periodosSincronizados);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de períodos letivos");
            }
        }

        /// <summary>
        /// Sincroniza cursos do TOTVS
        /// </summary>
        private async Task SincronizarCursosAsync(ITotvsService totvsService, NpsDbContext context)
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de cursos...");
                
                var cursosSincronizados = await totvsService.SincronizarCursosAsync();
                
                _logger.LogInformation("Sincronização de cursos concluída: {Cursos} cursos processados", 
                    cursosSincronizados);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de cursos");
            }
        }

        /// <summary>
        /// Sincroniza disciplinas do TOTVS
        /// </summary>
        private async Task SincronizarDisciplinasAsync(ITotvsService totvsService, NpsDbContext context)
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de disciplinas...");
                
                var disciplinasSincronizadas = await totvsService.SincronizarDisciplinasAsync();
                
                _logger.LogInformation("Sincronização de disciplinas concluída: {Disciplinas} disciplinas processadas", 
                    disciplinasSincronizadas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de disciplinas");
            }
        }

        /// <summary>
        /// Sincroniza turmas do TOTVS
        /// </summary>
        private async Task SincronizarTurmasAsync(ITotvsService totvsService, NpsDbContext context)
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de turmas...");
                
                var turmasSincronizadas = await totvsService.SincronizarTurmasAsync();
                
                _logger.LogInformation("Sincronização de turmas concluída: {Turmas} turmas processadas", 
                    turmasSincronizadas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de turmas");
            }
        }

        /// <summary>
        /// Sincroniza turmas-disciplinas do TOTVS
        /// </summary>
        private async Task SincronizarTurmasDisciplinasAsync(ITotvsService totvsService, NpsDbContext context)
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de turmas-disciplinas...");
                
                var turmasDisciplinasSincronizadas = await totvsService.SincronizarTurmasDisciplinasAsync();
                
                _logger.LogInformation("Sincronização de turmas-disciplinas concluída: {TurmasDisciplinas} turmas-disciplinas processadas", 
                    turmasDisciplinasSincronizadas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de turmas-disciplinas");
            }
        }

        /// <summary>
        /// Sincroniza associações aluno-turma-disciplina do TOTVS
        /// </summary>
        private async Task SincronizarAlunoTurmaDisciplinaAsync(ITotvsService totvsService, NpsDbContext context)
        {
            try
            {
                _logger.LogInformation("Iniciando sincronização de associações aluno-turma-disciplina...");
                
                var associacoesSincronizadas = await totvsService.SincronizarAlunoTurmaDisciplinaAsync();
                
                _logger.LogInformation("Sincronização de associações aluno-turma-disciplina concluída: {Associacoes} associações processadas", 
                    associacoesSincronizadas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante sincronização de associações aluno-turma-disciplina");
            }
        }

        /// <summary>
        /// Obtém o período letivo atual (mais recente) sem duplicatas
        /// </summary>
        private async Task<string?> ObterPeriodoLetivoAtual(NpsDbContext context)
        {
            try
            {
                // Buscar o período letivo mais recente (sem duplicatas)
                var ultimoPeriodo = await context.PeriodosLetivos
                    .OrderByDescending(p => p.Id)
                    .Select(p => p.Nome)
                    .FirstOrDefaultAsync();

                return ultimoPeriodo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter período letivo atual");
                return null;
            }
        }
    }
}
