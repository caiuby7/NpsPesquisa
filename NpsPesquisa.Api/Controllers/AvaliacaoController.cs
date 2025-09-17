using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;
using System.Linq;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AvaliacaoController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public AvaliacaoController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpPost("criar")]
        public async Task<ActionResult<CriarAvaliacaoResponse>> CriarAvaliacao([FromBody] CriarAvaliacaoRequest request)
        {
            try
            {
                // Validar request
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Criar o questionário
                var questionario = new Questionario
                {
                    Titulo = request.Titulo,
                    Descricao = request.Descricao,
                    DataCriacao = DateTime.Now,
                    DataInicio = request.DataInicio,
                    DataFim = request.DataFim,
                    Tipo = TipoQuestionario.AvaliacaoInstitucional,
                    TipoItemAvaliado = request.ItemAvaliado,
                    Ativo = true
                };

                _context.Questionarios.Add(questionario);
                await _context.SaveChangesAsync();

                // Criar os itens avaliados baseado no tipo
                var itemAvaliado = new ItemAvaliadoQuestionario
                {
                    QuestionarioId = questionario.Id,
                    TipoItemAvaliado = request.ItemAvaliado,
                    NomeItemEspecifico = request.NomeItemEspecifico,
                    DescricaoItem = request.DescricaoItem,
                    OrdemApresentacao = 1,
                    Ativo = true,
                    DataCriacao = DateTime.Now
                };

                // Mapear IDs específicos baseado no tipo
                switch (request.ItemAvaliado)
                {
                    case TipoItemAvaliado.Professor:
                        itemAvaliado.ProfessorId = request.ProfessorId;
                        break;
                    case TipoItemAvaliado.Disciplina:
                        itemAvaliado.DisciplinaId = request.DisciplinaId;
                        break;
                    case TipoItemAvaliado.TurmaDisciplina:
                        itemAvaliado.TurmaDisciplinaId = request.TurmaDisciplinaId;
                        break;
                    case TipoItemAvaliado.Curso:
                        itemAvaliado.CursoId = request.CursoId;
                        break;
                    case TipoItemAvaliado.Turma:
                        itemAvaliado.TurmaId = request.TurmaId;
                        break;
                    case TipoItemAvaliado.Coordenador:
                        itemAvaliado.CoordenadorId = request.CoordenadorId;
                        break;
                    case TipoItemAvaliado.Infraestrutura:
                        // Para Infraestrutura, buscar o nome da instituição do participante
                        // O NomeItemEspecifico e DescricaoItem serão definidos dinamicamente
                        break;
                    case TipoItemAvaliado.TCC:
                    case TipoItemAvaliado.Estagio:
                    case TipoItemAvaliado.ProjetoExtensionista:
                        // Para TCC, Estágio e Projeto Extensionista, não precisa de ID específico
                        // O nome e descrição já foram definidos acima
                        break;
                }

                _context.ItensAvaliadosQuestionarios.Add(itemAvaliado);
                await _context.SaveChangesAsync();

                // Mapear participantes baseado nos filtros
                var participantes = await MapearParticipantes(request);
                
                // Criar ParticipanteQuestionario para cada participante
                foreach (var participante in participantes)
                {
                    var participanteQuestionario = new ParticipanteQuestionario
                    {
                        QuestionarioId = questionario.Id,
                        ParticipanteId = participante.Id,
                        DataConvite = DateTime.Now,
                        Status = "Enviado",
                    };
                    
                    _context.ParticipantesQuestionarios.Add(participanteQuestionario);
                }

                await _context.SaveChangesAsync();

                return Ok(new CriarAvaliacaoResponse
                {
                    QuestionarioId = questionario.Id,
                    ItemAvaliadoId = itemAvaliado.Id,
                    ParticipantesMapeados = participantes.Count,
                    Mensagem = "Avaliação criada com sucesso!"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpGet("filtros/{tipoItemAvaliado}")]
        public async Task<ActionResult<FiltrosAvaliacaoResponse>> ObterFiltros(TipoItemAvaliado tipoItemAvaliado)
        {
            try
            {
                var response = new FiltrosAvaliacaoResponse
                {
                    TipoItemAvaliado = tipoItemAvaliado,
                    FiltrosDisponiveis = new List<string>()
                };

                // Definir filtros disponíveis baseado no tipo
                switch (tipoItemAvaliado)
                {
                    case TipoItemAvaliado.Professor:
                    case TipoItemAvaliado.Disciplina:
                    case TipoItemAvaliado.TurmaDisciplina:
                    case TipoItemAvaliado.Curso:
                        response.FiltrosDisponiveis.AddRange(new[] { "Instituicao", "PeriodoLetivo", "Curso" });
                        if (tipoItemAvaliado == TipoItemAvaliado.TurmaDisciplina || tipoItemAvaliado == TipoItemAvaliado.Turma)
                            response.FiltrosDisponiveis.Add("Turma");
                        if (tipoItemAvaliado == TipoItemAvaliado.Disciplina || tipoItemAvaliado == TipoItemAvaliado.TurmaDisciplina)
                            response.FiltrosDisponiveis.Add("Disciplina");
                        break;

                    case TipoItemAvaliado.Estrutura:
                        response.FiltrosDisponiveis.Add("TipoParticipante");
                        response.FiltrosDisponiveis.Add("Instituicao");
                        response.FiltrosDisponiveis.Add("PeriodoLetivo");
                        break;

                    case TipoItemAvaliado.Coordenador:
                        response.FiltrosDisponiveis.AddRange(new[] { "Instituicao", "Curso" });
                        break;
                }

                // Carregar dados para os filtros
                response.Instituicoes = await _context.Instituicoes
                    .Where(i => i.Ativo)
                    .Select(i => new { i.Id, i.Nome })
                    .Cast<dynamic>()
                    .ToListAsync();

                response.PeriodosLetivos = await _context.PeriodosLetivos
                    .Where(p => p.Ativo)
                    .Select(p => new { p.Id, p.Nome, p.Codigo })
                    .Cast<dynamic>()
                    .ToListAsync();

                response.Cursos = await _context.Cursos
                    .Where(c => c.Ativo)
                    .Select(c => new { c.Id, c.Nome, c.Codigo })
                    .Cast<dynamic>()
                    .ToListAsync();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpPost("filtros/participantes")]
        public async Task<ActionResult<ParticipantesFiltradosResponse>> ObterParticipantesFiltrados([FromBody] FiltrosParticipantesRequest request)
        {
            try
            {
                var participantes = new List<Participante>();

                switch (request.TipoItemAvaliado)
                {
                    case TipoItemAvaliado.Professor:
                        // Buscar professores baseado nos filtros
                        var queryProfessores = _context.Professores.AsQueryable();

                        if (request.InstituicaoId.HasValue)
                            queryProfessores = queryProfessores.Where(p => p.InstituicaoId == request.InstituicaoId);

                        // Filtrar por curso através de TurmaDisciplina
                        if (request.CursoId.HasValue)
                        {
                            queryProfessores = queryProfessores.Where(p => p.TurmasDisciplinas.Any(td => td.Turma.CursoId == request.CursoId.Value && td.Ativo));
                        }

                        // Filtrar por disciplina através de TurmaDisciplina
                        if (request.DisciplinaId.HasValue)
                        {
                            queryProfessores = queryProfessores.Where(p => p.TurmasDisciplinas.Any(td => td.DisciplinaId == request.DisciplinaId.Value && td.Ativo));
                        }

                        // Filtrar por turma através de TurmaDisciplina
                        if (request.TurmaId.HasValue)
                        {
                            queryProfessores = queryProfessores.Where(p => p.TurmasDisciplinas.Any(td => td.TurmaId == request.TurmaId.Value && td.Ativo));
                        }

                        var professores = await queryProfessores
                            .Include(p => p.Instituicao)
                            .Include(p => p.TurmasDisciplinas)
                                .ThenInclude(td => td.Disciplina)
                            .Where(p => p.Ativo)
                            .ToListAsync();

                        // Converter professores para participantes
                        foreach (var professor in professores)
                        {
                            var participante = new Participante
                            {
                                Nome = professor.Nome,
                                Email = professor.Email,
                                Tipo = TipoParticipante.Professor,
                                ProfessorId = professor.Id,
                                Departamento = professor.Departamento,
                                Titulacao = professor.Titulacao,
                                Ativo = true,
                                DataCadastro = DateTime.Now
                            };
                            participantes.Add(participante);
                        }
                        break;

                    case TipoItemAvaliado.Disciplina:
                    case TipoItemAvaliado.TurmaDisciplina:
                        // Buscar alunos baseado nos filtros
                        var query = _context.Alunos.AsQueryable();

                        if (request.InstituicaoId.HasValue)
                            query = query.Where(a => a.InstituicaoId == request.InstituicaoId);

                        if (request.PeriodoLetivoId.HasValue)
                            query = query.Where(a => a.PeriodoLetivoId == request.PeriodoLetivoId);

                        if (request.CursoId.HasValue)
                            query = query.Where(a => a.CursoId == request.CursoId);

                        if (request.TurmaId.HasValue)
                            query = query.Where(a => a.TurmaId == request.TurmaId);

                        // Filtrar por disciplina através de TurmaDisciplina
                        if (request.DisciplinaId.HasValue)
                        {
                            query = query.Where(a => a.TurmasDisciplinas.Any(td => td.DisciplinaId == request.DisciplinaId.Value && td.Ativo));
                        }

                        var alunos = await query
                            .Include(a => a.Curso)
                            .Include(a => a.Instituicao)
                            .Include(a => a.TurmasDisciplinas)
                                .ThenInclude(td => td.Disciplina)
                            .Where(a => a.Ativo)
                            .ToListAsync();

                        // Converter alunos para participantes
                        foreach (var aluno in alunos)
                        {
                            var participante = new Participante
                            {
                                Nome = aluno.Nome,
                                Email = aluno.Email,
                                Tipo = TipoParticipante.Aluno,
                                AlunoId = aluno.AlunoId,
                                CursoId = aluno.CursoId,
                                Matricula = aluno.Matricula,
                                Ativo = true,
                                DataCadastro = DateTime.Now
                            };
                            participantes.Add(participante);
                        }
                        break;

                    case TipoItemAvaliado.Estrutura:
                        if (request.TipoParticipante == TipoParticipante.Aluno)
                        {
                            // Mesma lógica dos alunos
                            var alunosEstrutura = await _context.Alunos
                                .Where(a => a.Ativo)
                                .Include(a => a.Curso)
                                .Include(a => a.Instituicao)
                                .ToListAsync();

                            foreach (var aluno in alunosEstrutura)
                            {
                                var participante = new Participante
                                {
                                    Nome = aluno.Nome,
                                    Email = aluno.Email,
                                    Tipo = TipoParticipante.Aluno,
                                    AlunoId = aluno.AlunoId,
                                    CursoId = aluno.CursoId,
                                    Matricula = aluno.Matricula,
                                    Ativo = true,
                                    DataCadastro = DateTime.Now
                                };
                                participantes.Add(participante);
                            }
                        }
                        else if (request.TipoParticipante == TipoParticipante.Professor)
                        {
                            // Buscar professores
                            var professoresFiltrados = await _context.Professores
                                .Where(p => p.Ativo)
                                .Include(p => p.Departamento)
                                .ToListAsync();

                            foreach (var professor in professoresFiltrados)
                            {
                                var participante = new Participante
                                {
                                    Nome = professor.Nome,
                                    Email = professor.Email,
                                    Tipo = TipoParticipante.Professor,
                                    ProfessorId = professor.Id,
                                    Departamento = professor.Departamento,
                                    Titulacao = professor.Titulacao,
                                    Ativo = true,
                                    DataCadastro = DateTime.Now
                                };
                                participantes.Add(participante);
                            }
                        }
                        break;
                }

                return Ok(new ParticipantesFiltradosResponse
                {
                    Participantes = participantes,
                    Total = participantes.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        private async Task<List<Participante>> MapearParticipantes(CriarAvaliacaoRequest request)
        {
            var filtrosRequest = new FiltrosParticipantesRequest
            {
                TipoItemAvaliado = request.ItemAvaliado,
                InstituicaoId = request.InstituicaoId,
                PeriodoLetivoId = request.PeriodoLetivoId,
                CursoId = request.CursoId,
                TurmaId = request.TurmaId,
                DisciplinaId = request.DisciplinaId,
                ProfessorId = request.ProfessorId,
                TipoParticipante = request.TipoParticipante
            };

            var response = await ObterParticipantesFiltrados(filtrosRequest);
            return response.Value?.Participantes ?? new List<Participante>();
        }
    }
}
