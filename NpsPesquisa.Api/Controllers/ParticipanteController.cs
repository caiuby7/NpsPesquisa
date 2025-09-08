using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;
using NpsPesquisa.Api.Services;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParticipanteController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public ParticipanteController(NpsDbContext context)
        {
            _context = context;
        }

        // GET: api/Participante
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Participante>>> GetParticipantes(
            [FromQuery] TipoParticipante? tipo = null,
            [FromQuery] int? cursoId = null,
            [FromQuery] bool? ativo = null)
        {
            try
            {
                // Vamos tentar apenas os campos básicos primeiro
                var participantes = await _context.Participantes
                    .Select(p => new
                    {
                        p.Id,
                        p.Nome,
                        p.Email,
                        p.Tipo,
                        p.Ativo,
                        p.DataCadastro
                    })
                    .ToListAsync();

                return Ok(participantes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao buscar participantes", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // GET: api/Participante/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Participante>> GetParticipante(int id)
        {
            var participante = await _context.Participantes
                .Include(p => p.Curso)
                .Include(p => p.Aluno)
                .Include(p => p.Professor)
                .Include(p => p.Coordenador)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (participante == null)
            {
                return NotFound();
            }

            return participante;
        }

        // GET: api/Participante/por-tipo/aluno
        [HttpGet("por-tipo/{tipo}")]
        public async Task<ActionResult<IEnumerable<Participante>>> GetParticipantesPorTipo(TipoParticipante tipo)
        {
            return await _context.Participantes
                .Include(p => p.Curso)
                .Include(p => p.Aluno)
                .Include(p => p.Professor)
                .Include(p => p.Coordenador)
                .Where(p => p.Tipo == tipo && p.Ativo)
                .OrderBy(p => p.Nome)
                .ToListAsync();
        }

        // GET: api/Participante/por-curso/5
        [HttpGet("por-curso/{cursoId}")]
        public async Task<ActionResult<IEnumerable<Participante>>> GetParticipantesPorCurso(int cursoId)
        {
            return await _context.Participantes
                .Include(p => p.Curso)
                .Include(p => p.Aluno)
                .Include(p => p.Professor)
                .Include(p => p.Coordenador)
                .Where(p => p.CursoId == cursoId && p.Ativo)
                .OrderBy(p => p.Tipo)
                .ThenBy(p => p.Nome)
                .ToListAsync();
        }

        // GET: api/Participante/disponiveis-para-questionario
        [HttpGet("disponiveis-para-questionario")]
        public async Task<ActionResult<object>> GetParticipantesDisponiveisParaQuestionario(
            [FromQuery] TipoQuestionario tipoQuestionario,
            [FromQuery] TipoItemAvaliado? tipoItemAvaliado = null,
            [FromQuery] int? cursoId = null,
            [FromQuery] int? turmaId = null,
            [FromQuery] int? disciplinaId = null)
        {
            try
            {
                // Determinar quais tipos de participantes são válidos para este questionário
                var tiposParticipantesValidos = new List<TipoParticipante>();

                if (tipoQuestionario == TipoQuestionario.NPS)
                {
                    // Para NPS, todos os tipos podem participar
                    tiposParticipantesValidos.AddRange(new[] { 
                        TipoParticipante.Aluno, 
                        TipoParticipante.Professor, 
                        TipoParticipante.Funcionario, 
                        TipoParticipante.Coordenador 
                    });
                }
                else if (tipoQuestionario == TipoQuestionario.AvaliacaoInstitucional)
                {
                    // Para Avaliação Institucional, usar as regras específicas
                    if (tipoItemAvaliado.HasValue)
                    {
                        tiposParticipantesValidos.AddRange(RegrasAvaliacao.ObterParticipantesValidosParaItem(tipoItemAvaliado.Value));
                    }
                    else
                    {
                        // Se não especificado, incluir todos os tipos válidos
                        tiposParticipantesValidos.AddRange(new[] { 
                            TipoParticipante.Aluno, 
                            TipoParticipante.Professor, 
                            TipoParticipante.Funcionario, 
                            TipoParticipante.Coordenador 
                        });
                    }
                }

                // Buscar participantes baseado nos critérios
                var query = _context.Participantes
                    .Include(p => p.Curso)
                    .Include(p => p.Aluno)
                    .Include(p => p.Professor)
                    .Include(p => p.Coordenador)
                    .Where(p => p.Ativo && tiposParticipantesValidos.Contains(p.Tipo));

                // Filtrar por curso se especificado
                if (cursoId.HasValue)
                {
                    query = query.Where(p => p.CursoId == cursoId.Value);
                }

                // Filtrar por turma se especificado (para alunos)
                if (turmaId.HasValue)
                {
                    query = query.Where(p => p.Tipo == TipoParticipante.Aluno && p.Aluno != null && p.Aluno.TurmaId == turmaId.Value);
                }

                // Filtrar por disciplina se especificado
                if (disciplinaId.HasValue)
                {
                    // Para alunos: disciplinas que cursam
                    // Para professores: disciplinas que ministram
                    query = query.Where(p => 
                        (p.Tipo == TipoParticipante.Aluno && p.Aluno != null) ||
                        (p.Tipo == TipoParticipante.Professor && p.Professor != null)
                    );
                }

                var participantes = await query
                    .OrderBy(p => p.Tipo)
                    .ThenBy(p => p.Nome)
                    .ToListAsync();

                // Agrupar por tipo para facilitar o uso no frontend
                var resultado = new
                {
                    TipoQuestionario = tipoQuestionario,
                    TipoItemAvaliado = tipoItemAvaliado,
                    Filtros = new
                    {
                        CursoId = cursoId,
                        TurmaId = turmaId,
                        DisciplinaId = disciplinaId
                    },
                    ParticipantesPorTipo = participantes
                        .GroupBy(p => p.Tipo)
                        .Select(g => new
                        {
                            Tipo = g.Key,
                            Descricao = ObterDescricaoTipoParticipante(g.Key),
                            Quantidade = g.Count(),
                            Participantes = g.Select(p => new
                            {
                                p.Id,
                                p.Nome,
                                p.Email,
                                NomeCurso = p.Curso?.Nome,
                                p.Matricula,
                                p.Semestre,
                                p.Departamento,
                                p.Titulacao,
                                p.Setor,
                                p.Cargo
                            }).ToList()
                        })
                        .OrderBy(g => g.Tipo)
                        .ToList(),
                    TotalParticipantes = participantes.Count,
                    RegrasAplicadas = tipoQuestionario == TipoQuestionario.AvaliacaoInstitucional && tipoItemAvaliado.HasValue
                        ? RegrasAvaliacao.ObterDescricaoCombinacao(tiposParticipantesValidos.FirstOrDefault(), tipoItemAvaliado.Value)
                        : "Regras padrão aplicadas"
                };

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Erro ao buscar participantes disponíveis", 
                    error = ex.Message 
                });
            }
        }

        // GET: api/Participante/sugestao-tipos
        [HttpGet("sugestao-tipos")]
        public ActionResult<object> GetSugestaoTiposParticipantes(
            [FromQuery] TipoQuestionario tipoQuestionario,
            [FromQuery] TipoItemAvaliado? tipoItemAvaliado = null)
        {
            try
            {
                var sugestoes = new List<object>();

                if (tipoQuestionario == TipoQuestionario.NPS)
                {
                    sugestoes.AddRange(new[]
                    {
                        new { 
                            Tipo = TipoParticipante.Aluno, 
                            Descricao = "Estudantes para pesquisas de satisfação geral",
                            Recomendado = true,
                            Motivo = "Alunos são o público principal para NPS"
                        },
                        new { 
                            Tipo = TipoParticipante.Professor, 
                            Descricao = "Docentes para feedback sobre serviços",
                            Recomendado = true,
                            Motivo = "Professores podem avaliar infraestrutura e serviços"
                        },
                        new { 
                            Tipo = TipoParticipante.Funcionario, 
                            Descricao = "Colaboradores para avaliação interna",
                            Recomendado = false,
                            Motivo = "Funcionários podem ter visão diferente dos serviços"
                        }
                    });
                }
                else if (tipoQuestionario == TipoQuestionario.AvaliacaoInstitucional)
                {
                    if (tipoItemAvaliado.HasValue)
                    {
                        var tiposValidos = RegrasAvaliacao.ObterParticipantesValidosParaItem(tipoItemAvaliado.Value);
                        
                        foreach (var tipo in tiposValidos)
                        {
                            var descricao = RegrasAvaliacao.ObterDescricaoCombinacao(tipo, tipoItemAvaliado.Value);
                            sugestoes.Add(new
                            {
                                Tipo = tipo,
                                Descricao = descricao,
                                Recomendado = true,
                                Motivo = $"Pode avaliar {tipoItemAvaliado.Value} conforme regras do sistema"
                            });
                        }
                    }
                    else
                    {
                        sugestoes.AddRange(new[]
                        {
                            new { 
                                Tipo = TipoParticipante.Aluno, 
                                Descricao = "Estudantes para avaliação acadêmica",
                                Recomendado = true,
                                Motivo = "Alunos avaliam cursos, turmas e disciplinas"
                            },
                            new { 
                                Tipo = TipoParticipante.Professor, 
                                Descricao = "Docentes para avaliação pedagógica",
                                Recomendado = true,
                                Motivo = "Professores avaliam turmas, disciplinas e infraestrutura"
                            }
                        });
                    }
                }

                return Ok(new
                {
                    TipoQuestionario = tipoQuestionario,
                    TipoItemAvaliado = tipoItemAvaliado,
                    Sugestoes = sugestoes,
                    TotalSugestoes = sugestoes.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Erro ao gerar sugestões", 
                    error = ex.Message 
                });
            }
        }

        // POST: api/Participante
        [HttpPost]
        public async Task<ActionResult<Participante>> PostParticipante([FromBody] object request)
        {
            try
            {
                // Deserializar o request para determinar o tipo
                var jsonElement = (System.Text.Json.JsonElement)request;
                var tipo = jsonElement.GetProperty("tipo").GetInt32();
                var email = jsonElement.GetProperty("email").GetString();

                if (string.IsNullOrEmpty(email))
                {
                    return BadRequest("O email é obrigatório");
                }

                // Verificar se já existe um participante com o mesmo email
                var participanteExistente = await _context.Participantes
                    .FirstOrDefaultAsync(p => p.Email.ToLower() == email.ToLower());

                if (participanteExistente != null)
                {
                    return BadRequest("Já existe um participante com este email");
                }

                Participante participante;
                string? errorMessage;

                // Criar participante baseado no tipo
                switch ((TipoParticipante)tipo)
                {
                    case TipoParticipante.Aluno:
                        (participante, errorMessage) = await CriarAluno(jsonElement);
                        break;
                    case TipoParticipante.Professor:
                        (participante, errorMessage) = await CriarProfessor(jsonElement);
                        break;
                    case TipoParticipante.Coordenador:
                        (participante, errorMessage) = await CriarCoordenador(jsonElement);
                        break;
                    case TipoParticipante.Funcionario:
                        (participante, errorMessage) = await CriarFuncionario(jsonElement);
                        break;
                    default:
                        return BadRequest("Tipo de participante inválido");
                }

                if (!string.IsNullOrEmpty(errorMessage))
                {
                    return BadRequest(errorMessage);
                }

                _context.Participantes.Add(participante);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetParticipante), new { id = participante.Id }, participante);
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao processar requisição: {ex.Message}");
            }
        }

        private async Task<(Participante participante, string? errorMessage)> CriarAluno(System.Text.Json.JsonElement json)
        {
            try
            {
                // Validar campos obrigatórios
                if (!json.TryGetProperty("cursoId", out var cursoIdElement) || !cursoIdElement.TryGetInt32(out var cursoId))
                {
                    return (null!, "Alunos devem ter um curso associado");
                }

                if (!json.TryGetProperty("matricula", out var matriculaElement) || string.IsNullOrEmpty(matriculaElement.GetString()))
                {
                    return (null!, "Alunos devem ter uma matrícula");
                }

                // Verificar se o curso existe
                var curso = await _context.Cursos.FindAsync(cursoId);
                if (curso == null)
                {
                    return (null!, "Curso não encontrado");
                }

                // Criar o aluno
                var aluno = new Aluno
                {
                    Nome = json.GetProperty("nome").GetString()!,
                    Email = json.GetProperty("email").GetString()!,
                    CursoId = cursoId,
                    Matricula = matriculaElement.GetString()!,
                    Turno = json.TryGetProperty("turno", out var turnoElement) ? 
                        (turnoElement.GetString() switch
                        {
                            "Matutino" => Turno.Matutino,
                            "Vespertino" => Turno.Vespertino,
                            "Noturno" => Turno.Noturno,
                            _ => null
                        }) : null,
                    PeriodoLetivoId = 1, // TODO: Mapear corretamente o período letivo
                    InstituicaoId = 1, // TODO: Mapear corretamente a instituição
                    StatusNoPeriodoLetivo = json.TryGetProperty("statusNoPeriodoLetivo", out var statusElement) ? statusElement.GetString() : "Ativo",
                    AceitaContato = json.TryGetProperty("aceitaContato", out var contatoElement) ? contatoElement.GetBoolean() : true,
                    EmailPessoal = json.TryGetProperty("emailPessoal", out var emailPessoalElement) ? emailPessoalElement.GetString() : null,
                    Telefone = json.TryGetProperty("telefone", out var telefoneElement) ? telefoneElement.GetString() : null,
                    Ativo = true,
                    DataCadastro = DateTime.Now
                };

                _context.Alunos.Add(aluno);
                await _context.SaveChangesAsync();

                // Criar o participante vinculado ao aluno
                var participante = new Participante
                {
                    Nome = aluno.Nome,
                    Email = aluno.Email,
                    Tipo = TipoParticipante.Aluno,
                    Ativo = true,
                    CursoId = cursoId,
                    Matricula = aluno.Matricula,
                    Telefone = aluno.Telefone,
                    Cpf = json.TryGetProperty("cpf", out var cpfElement) ? cpfElement.GetString() : null,
                    DataNascimento = json.TryGetProperty("dataNascimento", out var dataElement) && DateTime.TryParse(dataElement.GetString(), out var data) ? data : null,
                    AlunoId = aluno.Id,
                    DataCadastro = DateTime.Now
                };

                return (participante, null);
            }
            catch (Exception ex)
            {
                return (null!, $"Erro ao criar aluno: {ex.Message}");
            }
        }

        private async Task<(Participante participante, string? errorMessage)> CriarProfessor(System.Text.Json.JsonElement json)
        {
            try
            {
                // Validar campos obrigatórios
                if (!json.TryGetProperty("departamento", out var deptElement) || string.IsNullOrEmpty(deptElement.GetString()))
                {
                    return (null!, "Professores devem ter um departamento");
                }

                // Criar o professor
                var professor = new Professor
                {
                    Nome = json.GetProperty("nome").GetString()!,
                    Email = json.GetProperty("email").GetString()!,
                    Departamento = deptElement.GetString()!,
                    Titulacao = json.TryGetProperty("titulacao", out var titulacaoElement) ? titulacaoElement.GetString() : null,
                    Telefone = json.TryGetProperty("telefone", out var telefoneElement) ? telefoneElement.GetString() : null,
                    Cpf = json.TryGetProperty("cpf", out var cpfElement) ? cpfElement.GetString() : null,
                    DataNascimento = json.TryGetProperty("dataNascimento", out var dataElement) && DateTime.TryParse(dataElement.GetString(), out var data) ? data : null,
                    Ativo = true,
                    DataCadastro = DateTime.Now
                };

                _context.Professores.Add(professor);
                await _context.SaveChangesAsync();

                // Criar o participante vinculado ao professor
                var participante = new Participante
                {
                    Nome = professor.Nome,
                    Email = professor.Email,
                    Tipo = TipoParticipante.Professor,
                    Ativo = true,
                    Departamento = professor.Departamento,
                    Titulacao = professor.Titulacao,
                    Telefone = professor.Telefone,
                    Cpf = professor.Cpf,
                    DataNascimento = professor.DataNascimento,
                    ProfessorId = professor.Id,
                    DataCadastro = DateTime.Now
                };

                return (participante, null);
            }
            catch (Exception ex)
            {
                return (null!, $"Erro ao criar professor: {ex.Message}");
            }
        }

        private async Task<(Participante participante, string? errorMessage)> CriarCoordenador(System.Text.Json.JsonElement json)
        {
            try
            {
                // Validar campos obrigatórios
                if (!json.TryGetProperty("departamento", out var deptElement) || string.IsNullOrEmpty(deptElement.GetString()))
                {
                    return (null!, "Coordenadores devem ter um departamento");
                }

                // Criar o coordenador
                var coordenador = new Coordenador
                {
                    Nome = json.GetProperty("nome").GetString()!,
                    Email = json.GetProperty("email").GetString()!,
                    Departamento = deptElement.GetString()!,
                    Titulacao = json.TryGetProperty("titulacao", out var titulacaoElement) ? titulacaoElement.GetString() : null,
                    Telefone = json.TryGetProperty("telefone", out var telefoneElement) ? telefoneElement.GetString() : null,
                    Cpf = json.TryGetProperty("cpf", out var cpfElement) ? cpfElement.GetString() : null,
                    DataNascimento = json.TryGetProperty("dataNascimento", out var dataElement) && DateTime.TryParse(dataElement.GetString(), out var data) ? data : null,
                    Ativo = true,
                    DataCadastro = DateTime.Now
                };

                _context.Coordenadores.Add(coordenador);
                await _context.SaveChangesAsync();

                // Criar o participante vinculado ao coordenador
                var participante = new Participante
                {
                    Nome = coordenador.Nome,
                    Email = coordenador.Email,
                    Tipo = TipoParticipante.Coordenador,
                    Ativo = true,
                    Departamento = coordenador.Departamento,
                    Titulacao = coordenador.Titulacao,
                    Telefone = coordenador.Telefone,
                    Cpf = coordenador.Cpf,
                    DataNascimento = coordenador.DataNascimento,
                    CoordenadorId = coordenador.Id,
                    DataCadastro = DateTime.Now
                };

                return (participante, null);
            }
            catch (Exception ex)
            {
                return (null!, $"Erro ao criar coordenador: {ex.Message}");
            }
        }

        private async Task<(Participante participante, string? errorMessage)> CriarFuncionario(System.Text.Json.JsonElement json)
        {
            try
            {
                // Validar campos obrigatórios
                if (!json.TryGetProperty("setor", out var setorElement) || string.IsNullOrEmpty(setorElement.GetString()))
                {
                    return (null!, "Funcionários devem ter um setor");
                }

                if (!json.TryGetProperty("cargo", out var cargoElement) || string.IsNullOrEmpty(cargoElement.GetString()))
                {
                    return (null!, "Funcionários devem ter um cargo");
                }

                // Criar o participante (funcionários não têm entidade específica)
                var participante = new Participante
                {
                    Nome = json.GetProperty("nome").GetString()!,
                    Email = json.GetProperty("email").GetString()!,
                    Tipo = TipoParticipante.Funcionario,
                    Ativo = true,
                    Setor = setorElement.GetString()!,
                    Cargo = cargoElement.GetString()!,
                    Telefone = json.TryGetProperty("telefone", out var telefoneElement) ? telefoneElement.GetString() : null,
                    Cpf = json.TryGetProperty("cpf", out var cpfElement) ? cpfElement.GetString() : null,
                    DataNascimento = json.TryGetProperty("dataNascimento", out var dataElement) && DateTime.TryParse(dataElement.GetString(), out var data) ? data : null,
                    DataCadastro = DateTime.Now
                };

                return (participante, null);
            }
            catch (Exception ex)
            {
                return (null!, $"Erro ao criar funcionário: {ex.Message}");
            }
        }

        // PUT: api/Participante/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutParticipante(int id, Participante participante)
        {
            if (id != participante.Id)
            {
                return BadRequest();
            }

            if (string.IsNullOrWhiteSpace(participante.Nome))
            {
                return BadRequest("O nome é obrigatório");
            }

            if (string.IsNullOrWhiteSpace(participante.Email))
            {
                return BadRequest("O email é obrigatório");
            }

            // Verificar se já existe outro participante com o mesmo email
            var participanteExistente = await _context.Participantes
                .FirstOrDefaultAsync(p => p.Id != id && p.Email.ToLower() == participante.Email.ToLower());

            if (participanteExistente != null)
            {
                return BadRequest("Já existe um participante com este email");
            }

            // Validação dos relacionamentos baseado no tipo
            var (isValid, errorMessage) = await ValidarRelacionamentos(participante);
            if (!isValid)
                return BadRequest(new { message = errorMessage });

            participante.DataAtualizacao = DateTime.Now;
            _context.Entry(participante).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ParticipanteExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Participante/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParticipante(int id)
        {
            var participante = await _context.Participantes.FindAsync(id);
            if (participante == null)
            {
                return NotFound();
            }

            // Verificar se o participante está sendo usado em algum questionário
            var questionariosUsando = await _context.ParticipantesQuestionarios
                .AnyAsync(pq => pq.ParticipanteId == id);

            if (questionariosUsando)
            {
                return BadRequest("Não é possível excluir este participante pois está sendo usado em questionários. Use a opção de desativar.");
            }

            _context.Participantes.Remove(participante);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Participante/5/ativar
        [HttpPatch("{id}/ativar")]
        public async Task<IActionResult> AtivarParticipante(int id)
        {
            var participante = await _context.Participantes.FindAsync(id);
            if (participante == null)
            {
                return NotFound();
            }

            participante.Ativo = true;
            participante.DataAtualizacao = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Participante/5/desativar
        [HttpPatch("{id}/desativar")]
        public async Task<IActionResult> DesativarParticipante(int id)
        {
            var participante = await _context.Participantes.FindAsync(id);
            if (participante == null)
            {
                return NotFound();
            }

            participante.Ativo = false;
            participante.DataAtualizacao = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ParticipanteExists(int id)
        {
            return _context.Participantes.Any(e => e.Id == id);
        }

        /// <summary>
        /// Obtém a descrição amigável de um tipo de participante
        /// </summary>
        private string ObterDescricaoTipoParticipante(TipoParticipante tipo)
        {
            return tipo switch
            {
                TipoParticipante.Aluno => "Estudante matriculado em um curso",
                TipoParticipante.Professor => "Docente que ministra disciplinas",
                TipoParticipante.Funcionario => "Colaborador administrativo ou técnico",
                TipoParticipante.Coordenador => "Responsável pela coordenação de curso",
                _ => "Tipo de participante não definido"
            };
        }

        /// <summary>
        /// Valida os relacionamentos baseado no tipo de participante
        /// </summary>
        private async Task<(bool isValid, string errorMessage)> ValidarRelacionamentos(Participante participante)
        {
            switch (participante.Tipo)
            {
                case TipoParticipante.Aluno:
                    if (participante.AlunoId == null)
                        return (false, "Alunos devem ter um registro na tabela Aluno");
                    
                    var aluno = await _context.Alunos.FirstOrDefaultAsync(a => a.Id == participante.AlunoId && a.Ativo);
                    if (aluno == null)
                        return (false, "Aluno não encontrado ou inativo");
                    break;

                case TipoParticipante.Professor:
                    if (participante.ProfessorId == null)
                        return (false, "Professores devem ter um registro na tabela Professor");
                    
                    var professor = await _context.Professores.FirstOrDefaultAsync(a => a.Id == participante.ProfessorId && a.Ativo);
                    if (professor == null)
                        return (false, "Professor não encontrado ou inativo");
                    break;

                case TipoParticipante.Coordenador:
                    if (participante.CoordenadorId == null)
                        return (false, "Coordenadores devem ter um registro na tabela Coordenador");
                    
                    var coordenador = await _context.Coordenadores.FirstOrDefaultAsync(c => c.Id == participante.CoordenadorId && c.Ativo);
                    if (coordenador == null)
                        return (false, "Coordenador não encontrado ou inativo");
                    break;

                case TipoParticipante.Funcionario:
                    // Funcionários não precisam de relacionamentos específicos
                    break;
            }

            return (true, string.Empty);
        }
    }
}
