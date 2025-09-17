using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.IO;
using ClosedXML.Excel;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlunoController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public AlunoController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Aluno>>> GetAll()
        {
            return await _context.Alunos
                .Include(a => a.Curso)
                .Include(a => a.Turma)
                .Include(a => a.PeriodoLetivo)
                .Include(a => a.Instituicao)
                .Include(a => a.TurmasDisciplinas)
                    .ThenInclude(td => td.Disciplina)
                .Include(a => a.TurmasDisciplinas)
                    .ThenInclude(td => td.Professor)
                .Where(a => a.Ativo)
                .OrderBy(a => a.Nome)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Aluno>> GetById(int id)
        {
            var aluno = await _context.Alunos
                .Include(a => a.Curso)
                .Include(a => a.Turma)
                .Include(a => a.PeriodoLetivo)
                .Include(a => a.Instituicao)
                .Include(a => a.TurmasDisciplinas)
                    .ThenInclude(td => td.Disciplina)
                .Include(a => a.TurmasDisciplinas)
                    .ThenInclude(td => td.Professor)
                .FirstOrDefaultAsync(a => a.AlunoId == id);

            if (aluno == null)
                return NotFound();

            return aluno;
        }

        [HttpPost]
       // 
        public async Task<ActionResult<Aluno>> Create(AlunoViewModel alunoViewModel)
        {
            // Verifica se o curso existe
            var curso = await _context.Cursos.FindAsync(alunoViewModel.CursoId);
            if (curso == null)
                return BadRequest("Curso não encontrado");

            // Verifica se o período letivo existe
            var periodoLetivo = await _context.PeriodosLetivos.FindAsync(alunoViewModel.PeriodoLetivoId);
            if (periodoLetivo == null)
                return BadRequest("Período letivo não encontrado");

            // Verifica se a instituição existe
            var instituicao = await _context.Instituicoes.FindAsync(alunoViewModel.InstituicaoId);
            if (instituicao == null)
                return BadRequest("Instituição não encontrada");

            // Verifica se a turma existe (se fornecida)
            Turma? turma = null;
            if (alunoViewModel.TurmaId.HasValue)
            {
                turma = await _context.Turmas.FindAsync(alunoViewModel.TurmaId.Value);
                if (turma == null)
                    return BadRequest("Turma não encontrada");
            }

            var aluno = new Aluno
            {
                Nome = alunoViewModel.Nome,
                Matricula = alunoViewModel.Matricula,
                Cpf = alunoViewModel.Cpf,
                DataNascimento = alunoViewModel.DataNascimento,
                Sexo = alunoViewModel.Sexo,
                Email = alunoViewModel.Email,
                EmailPessoal = alunoViewModel.EmailPessoal,
                Telefone = alunoViewModel.Telefone,
                CursoId = alunoViewModel.CursoId,
                TurmaId = alunoViewModel.TurmaId,
                PeriodoLetivoId = alunoViewModel.PeriodoLetivoId,
                InstituicaoId = alunoViewModel.InstituicaoId,
                Turno = alunoViewModel.Turno,
                Fase = alunoViewModel.Fase,
                Grade = alunoViewModel.Grade,
                Habilitacao = alunoViewModel.Habilitacao,
                DataIngressoCurso = alunoViewModel.DataIngressoCurso,
                TipoMatricula = alunoViewModel.TipoMatricula,
                DataMatricula = alunoViewModel.DataMatricula,
                StatusNoPeriodoLetivo = alunoViewModel.StatusNoPeriodoLetivo,
                TurmaAtiva = alunoViewModel.TurmaAtiva,
                AceitaContato = alunoViewModel.AceitaContato,
                Ativo = alunoViewModel.Ativo,
                IntegracaoId = alunoViewModel.IntegracaoId,
                CursoIntegracaoId = alunoViewModel.CursoIntegracaoId,
                TurmaIntegracaoId = alunoViewModel.TurmaIntegracaoId,
                PeriodoLetivoIntegracaoId = alunoViewModel.PeriodoLetivoIntegracaoId,
                InstituicaoIntegracaoId = alunoViewModel.InstituicaoIntegracaoId,
                DataCadastro = DateTime.Now
            };

            _context.Alunos.Add(aluno);
            await _context.SaveChangesAsync();

            // Adiciona as turmas-disciplinas se fornecidas
            if (alunoViewModel.TurmaDisciplinaIds != null && alunoViewModel.TurmaDisciplinaIds.Any())
            {
                var turmasDisciplinas = await _context.TurmaDisciplinas
                    .Where(td => alunoViewModel.TurmaDisciplinaIds.Contains(td.Id))
                    .ToListAsync();

                foreach (var turmaDisciplina in turmasDisciplinas)
                {
                    aluno.TurmasDisciplinas.Add(turmaDisciplina);
                }
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetById), new { id = aluno.AlunoId }, aluno);
        }

        [HttpPut("{id}")]
        
        public async Task<IActionResult> Update(int id, AlunoViewModel alunoViewModel)
        {
            var aluno = await _context.Alunos.FindAsync(id);
            if (aluno == null) return NotFound();

            // Verifica se o curso existe
            var curso = await _context.Cursos.FindAsync(alunoViewModel.CursoId);
            if (curso == null)
                return BadRequest("Curso não encontrado");

            // Verifica se o período letivo existe
            var periodoLetivo = await _context.PeriodosLetivos.FindAsync(alunoViewModel.PeriodoLetivoId);
            if (periodoLetivo == null)
                return BadRequest("Período letivo não encontrado");

            // Verifica se a instituição existe
            var instituicao = await _context.Instituicoes.FindAsync(alunoViewModel.InstituicaoId);
            if (instituicao == null)
                return BadRequest("Instituição não encontrada");

            // Verifica se a turma existe (se fornecida)
            if (alunoViewModel.TurmaId.HasValue)
            {
                var turma = await _context.Turmas.FindAsync(alunoViewModel.TurmaId.Value);
                if (turma == null)
                    return BadRequest("Turma não encontrada");
            }

            aluno.Nome = alunoViewModel.Nome;
            aluno.Matricula = alunoViewModel.Matricula;
            aluno.Cpf = alunoViewModel.Cpf;
            aluno.DataNascimento = alunoViewModel.DataNascimento;
            aluno.Sexo = alunoViewModel.Sexo;
            aluno.Email = alunoViewModel.Email;
            aluno.EmailPessoal = alunoViewModel.EmailPessoal;
            aluno.Telefone = alunoViewModel.Telefone;
            aluno.CursoId = alunoViewModel.CursoId;
            aluno.TurmaId = alunoViewModel.TurmaId;
            aluno.PeriodoLetivoId = alunoViewModel.PeriodoLetivoId;
            aluno.InstituicaoId = alunoViewModel.InstituicaoId;
            aluno.Turno = alunoViewModel.Turno;
            aluno.Fase = alunoViewModel.Fase;
            aluno.Grade = alunoViewModel.Grade;
            aluno.Habilitacao = alunoViewModel.Habilitacao;
            aluno.DataIngressoCurso = alunoViewModel.DataIngressoCurso;
            aluno.TipoMatricula = alunoViewModel.TipoMatricula;
            aluno.DataMatricula = alunoViewModel.DataMatricula;
            aluno.StatusNoPeriodoLetivo = alunoViewModel.StatusNoPeriodoLetivo;
            aluno.TurmaAtiva = alunoViewModel.TurmaAtiva;
            aluno.AceitaContato = alunoViewModel.AceitaContato;
            aluno.Ativo = alunoViewModel.Ativo;
            aluno.IntegracaoId = alunoViewModel.IntegracaoId;
            aluno.CursoIntegracaoId = alunoViewModel.CursoIntegracaoId;
            aluno.TurmaIntegracaoId = alunoViewModel.TurmaIntegracaoId;
            aluno.PeriodoLetivoIntegracaoId = alunoViewModel.PeriodoLetivoIntegracaoId;
            aluno.InstituicaoIntegracaoId = alunoViewModel.InstituicaoIntegracaoId;
            aluno.DataAtualizacao = DateTime.Now;

            try
            {
                // Salva as alterações do aluno primeiro (sem as turmas-disciplinas)
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlunoExists(id))
                    return NotFound();
                throw;
            }

            // Atualiza as turmas-disciplinas se fornecidas (após salvar o aluno)
            if (alunoViewModel.TurmaDisciplinaIds != null)
            {
                try
                {
                    // Remove todas as associações atuais da tabela de junção
                    await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM AlunoTurmaDisciplina WHERE AlunosAlunoId = {0}", id);

                    // Adiciona as novas associações
                    if (alunoViewModel.TurmaDisciplinaIds.Any())
                    {
                        foreach (var turmaDisciplinaId in alunoViewModel.TurmaDisciplinaIds)
                        {
                            await _context.Database.ExecuteSqlRawAsync(
                                "INSERT INTO AlunoTurmaDisciplina (AlunosAlunoId, TurmasDisciplinasId) VALUES ({0}, {1})",
                                id, turmaDisciplinaId);
                        }
                    }
                }
                catch (Exception ex)
                {
                    return BadRequest($"Erro ao atualizar turmas-disciplinas: {ex.Message}");
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        
        public async Task<IActionResult> Delete(int id)
        {
            var aluno = await _context.Alunos.FindAsync(id);
            if (aluno == null) return NotFound();

            // Verifica se existem respostas vinculadas
            var respostasVinculadas = await _context.Respostas.AnyAsync(r => r.ParticipanteId == id);
            if (respostasVinculadas)
                return BadRequest("Não é possível excluir um aluno que possui respostas vinculadas.");

            _context.Alunos.Remove(aluno);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AlunoExists(int id)
        {
            return _context.Alunos.Any(e => e.AlunoId == id);
        }

        // Endpoints para gerenciar turmas-disciplinas do aluno
        [HttpGet("{id}/turmas-disciplinas")]
        public async Task<ActionResult<IEnumerable<TurmaDisciplina>>> GetTurmasDisciplinas(int id)
        {
            var aluno = await _context.Alunos
                .Include(a => a.TurmasDisciplinas)
                    .ThenInclude(td => td.Disciplina)
                .Include(a => a.TurmasDisciplinas)
                    .ThenInclude(td => td.Professor)
                .Include(a => a.TurmasDisciplinas)
                    .ThenInclude(td => td.Turma)
                .FirstOrDefaultAsync(a => a.AlunoId == id);

            if (aluno == null)
                return NotFound();

            return Ok(aluno.TurmasDisciplinas);
        }

        [HttpPost("{id}/turmas-disciplinas")]
        public async Task<IActionResult> AddTurmaDisciplina(int id, [FromBody] int turmaDisciplinaId)
        {
            var aluno = await _context.Alunos
                .Include(a => a.TurmasDisciplinas)
                .FirstOrDefaultAsync(a => a.AlunoId == id);

            if (aluno == null)
                return NotFound("Aluno não encontrado");

            var turmaDisciplina = await _context.TurmaDisciplinas.FindAsync(turmaDisciplinaId);
            if (turmaDisciplina == null)
                return NotFound("Turma-Disciplina não encontrada");

            // Verifica se o relacionamento já existe
            if (aluno.TurmasDisciplinas.Any(td => td.Id == turmaDisciplinaId))
                return BadRequest("Aluno já está vinculado a esta turma-disciplina");

            aluno.TurmasDisciplinas.Add(turmaDisciplina);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}/turmas-disciplinas/{turmaDisciplinaId}")]
        public async Task<IActionResult> RemoveTurmaDisciplina(int id, int turmaDisciplinaId)
        {
            var aluno = await _context.Alunos
                .Include(a => a.TurmasDisciplinas)
                .FirstOrDefaultAsync(a => a.AlunoId == id);

            if (aluno == null)
                return NotFound("Aluno não encontrado");

            var turmaDisciplina = aluno.TurmasDisciplinas.FirstOrDefault(td => td.Id == turmaDisciplinaId);
            if (turmaDisciplina == null)
                return NotFound("Turma-Disciplina não encontrada para este aluno");

            aluno.TurmasDisciplinas.Remove(turmaDisciplina);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPut("{id}/turmas-disciplinas")]
        public async Task<IActionResult> UpdateTurmasDisciplinas(int id, [FromBody] List<int> turmaDisciplinaIds)
        {
            var aluno = await _context.Alunos
                .Include(a => a.TurmasDisciplinas)
                .FirstOrDefaultAsync(a => a.AlunoId == id);

            if (aluno == null)
                return NotFound("Aluno não encontrado");

            // Verifica se todas as turmas-disciplinas existem
            var turmasDisciplinas = await _context.TurmaDisciplinas
                .Where(td => turmaDisciplinaIds.Contains(td.Id))
                .ToListAsync();

            if (turmasDisciplinas.Count != turmaDisciplinaIds.Count)
                return BadRequest("Uma ou mais turmas-disciplinas não foram encontradas");

            // Remove todas as associações atuais da tabela de junção
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM AlunoTurmaDisciplina WHERE AlunosAlunoId = {0}", id);

            // Adiciona as novas associações
            foreach (var turmaDisciplina in turmasDisciplinas)
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "INSERT INTO AlunoTurmaDisciplina (AlunosAlunoId, TurmasDisciplinasId) VALUES ({0}, {1})",
                    id, turmaDisciplina.Id);
            }

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportAlunos(IFormFile file)
        {
            if (file == null || file.Length <= 0)
            {
                return BadRequest("No file uploaded.");
            }

            // TODO: Implementar importação usando os novos campos
            // A importação precisará ser adaptada para usar os novos campos
            // como InstituicaoId, CursoId, etc.

            await _context.SaveChangesAsync();
            return Ok("Import completed successfully.");
        }
    }
} 