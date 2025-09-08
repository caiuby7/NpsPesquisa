using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Models;
using NpsPesquisa.Api.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfessorController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public ProfessorController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Professor>>> GetAll()
        {
            return await _context.Professores
                .Include(p => p.Instituicao)
                .Include(p => p.TurmasDisciplinas)
                    .ThenInclude(td => td.Turma)
                .Include(p => p.TurmasDisciplinas)
                    .ThenInclude(td => td.Disciplina)
                .Include(p => p.TurmasDisciplinas)
                    .ThenInclude(td => td.PeriodoLetivo)
                .Where(p => p.Ativo)
                .OrderBy(p => p.Nome)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Professor>> GetById(int id)
        {
            var professor = await _context.Professores
                .Include(p => p.Instituicao)
                .Include(p => p.TurmasDisciplinas)
                    .ThenInclude(td => td.Turma)
                .Include(p => p.TurmasDisciplinas)
                    .ThenInclude(td => td.Disciplina)
                .Include(p => p.TurmasDisciplinas)
                    .ThenInclude(td => td.PeriodoLetivo)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (professor == null) return NotFound();

            return professor;
        }

        [HttpGet("por-departamento/{departamento}")]
        public async Task<ActionResult<IEnumerable<Professor>>> GetByDepartamento(string departamento)
        {
            return await _context.Professores
                .Where(p => p.Departamento == departamento && p.Ativo)
                .OrderBy(p => p.Nome)
                .ToListAsync();
        }

        [HttpGet("por-titulacao/{titulacao}")]
        public async Task<ActionResult<IEnumerable<Professor>>> GetByTitulacao(string titulacao)
        {
            return await _context.Professores
                .Where(p => p.Titulacao == titulacao && p.Ativo)
                .OrderBy(p => p.Nome)
                .ToListAsync();
        }

        [HttpGet("por-periodo-letivo/{periodoLetivoId}")]
        public async Task<ActionResult<IEnumerable<Professor>>> GetByPeriodoLetivo(int periodoLetivoId)
        {
            return await _context.Professores
                .Include(p => p.Instituicao)
                .Include(p => p.TurmasDisciplinas)
                    .ThenInclude(td => td.Turma)
                .Include(p => p.TurmasDisciplinas)
                    .ThenInclude(td => td.Disciplina)
                .Include(p => p.TurmasDisciplinas)
                    .ThenInclude(td => td.PeriodoLetivo)
                .Where(p => p.Ativo && p.TurmasDisciplinas.Any(td => td.PeriodoLetivoId == periodoLetivoId && td.Ativo))
                .OrderBy(p => p.Nome)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Professor>> Create(ProfessorViewModel professorViewModel)
        {
            try
            {
                // Validar se já existe um professor com o mesmo email
                var professorExistente = await _context.Professores
                    .FirstOrDefaultAsync(p => p.Email == professorViewModel.Email);

                if (professorExistente != null)
                {
                    return BadRequest("Já existe um professor com este email");
                }

                // Validar se já existe um professor com o mesmo CPF (se fornecido)
                if (!string.IsNullOrEmpty(professorViewModel.Cpf))
                {
                    var professorComCpf = await _context.Professores
                        .FirstOrDefaultAsync(p => p.Cpf == professorViewModel.Cpf);

                    if (professorComCpf != null)
                    {
                        return BadRequest("Já existe um professor com este CPF");
                    }
                }

                // Validar se já existe um professor com o mesmo login (se fornecido)
                if (!string.IsNullOrEmpty(professorViewModel.Login))
                {
                    var professorComLogin = await _context.Professores
                        .FirstOrDefaultAsync(p => p.Login == professorViewModel.Login);

                    if (professorComLogin != null)
                    {
                        return BadRequest("Já existe um professor com este login");
                    }
                }

                var professor = new Professor
                {
                    Nome = professorViewModel.Nome,
                    Email = professorViewModel.Email,
                    Departamento = professorViewModel.Departamento,
                    Titulacao = professorViewModel.Titulacao,
                    Telefone = professorViewModel.Telefone,
                    Cpf = professorViewModel.Cpf,
                    DataNascimento = professorViewModel.DataNascimento,
                    Sexo = ConverterStringParaSexo(professorViewModel.Sexo),
                    Login = professorViewModel.Login,
                    TipoProfessor = ConverterStringParaTipoProfessor(professorViewModel.TipoProfessor),
                    IntegracaoId = professorViewModel.IntegracaoId,
                    CursoIntegracaoId = professorViewModel.CursoIntegracaoId,
                    TurmaIntegracaoId = professorViewModel.TurmaIntegracaoId,
                    PeriodoLetivoIntegracaoId = professorViewModel.PeriodoLetivoIntegracaoId,
                    InstituicaoIntegracaoId = professorViewModel.InstituicaoIntegracaoId,
                    DisciplinaIntegracaoId = professorViewModel.DisciplinaIntegracaoId,
                    InstituicaoId = professorViewModel.InstituicaoId,
                    Ativo = professorViewModel.Ativo,
                    DataCadastro = DateTime.Now
                };

                _context.Professores.Add(professor);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = professor.Id }, professor);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao criar professor", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProfessorViewModel professorViewModel)
        {
            try
            {
                var professor = await _context.Professores.FindAsync(id);
                if (professor == null) return NotFound();

                // Validar se já existe outro professor com o mesmo email
                var professorComEmail = await _context.Professores
                    .FirstOrDefaultAsync(p => p.Email == professorViewModel.Email && p.Id != id);

                if (professorComEmail != null)
                {
                    return BadRequest("Já existe outro professor com este email");
                }

                // Validar se já existe outro professor com o mesmo CPF (se fornecido)
                if (!string.IsNullOrEmpty(professorViewModel.Cpf))
                {
                    var professorComCpf = await _context.Professores
                        .FirstOrDefaultAsync(p => p.Cpf == professorViewModel.Cpf && p.Id != id);

                    if (professorComCpf != null)
                    {
                        return BadRequest("Já existe outro professor com este CPF");
                    }
                }

                // Validar se já existe outro professor com o mesmo login (se fornecido)
                if (!string.IsNullOrEmpty(professorViewModel.Login))
                {
                    var professorComLogin = await _context.Professores
                        .FirstOrDefaultAsync(p => p.Login == professorViewModel.Login && p.Id != id);

                    if (professorComLogin != null)
                    {
                        return BadRequest("Já existe outro professor com este login");
                    }
                }

                professor.Nome = professorViewModel.Nome;
                professor.Email = professorViewModel.Email;
                professor.Departamento = professorViewModel.Departamento;
                professor.Titulacao = professorViewModel.Titulacao;
                professor.Telefone = professorViewModel.Telefone;
                professor.Cpf = professorViewModel.Cpf;
                professor.DataNascimento = professorViewModel.DataNascimento;
                professor.Sexo = ConverterStringParaSexo(professorViewModel.Sexo);
                professor.Login = professorViewModel.Login;
                professor.TipoProfessor = ConverterStringParaTipoProfessor(professorViewModel.TipoProfessor);
                professor.IntegracaoId = professorViewModel.IntegracaoId;
                professor.CursoIntegracaoId = professorViewModel.CursoIntegracaoId;
                professor.TurmaIntegracaoId = professorViewModel.TurmaIntegracaoId;
                professor.PeriodoLetivoIntegracaoId = professorViewModel.PeriodoLetivoIntegracaoId;
                professor.InstituicaoIntegracaoId = professorViewModel.InstituicaoIntegracaoId;
                professor.DisciplinaIntegracaoId = professorViewModel.DisciplinaIntegracaoId;
                professor.InstituicaoId = professorViewModel.InstituicaoId;
                professor.Ativo = professorViewModel.Ativo;
                professor.DataAtualizacao = DateTime.Now;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ProfessorExists(id))
                        return NotFound();
                    throw;
                }

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar professor", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var professor = await _context.Professores.FindAsync(id);
                if (professor == null) return NotFound();

                // Verificar se o professor está sendo usado em algum lugar
                var turmasUsando = await _context.TurmaDisciplinas.AnyAsync(td => td.ProfessorId == id);
                var disciplinasUsando = await _context.Disciplinas.AnyAsync(d => d.Professores.Any(p => p.Id == id));

                if (turmasUsando || disciplinasUsando)
                {
                    return BadRequest("Não é possível excluir este professor pois está sendo usado por turmas ou disciplinas. Use a opção de desativar.");
                }

                _context.Professores.Remove(professor);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao excluir professor", error = ex.Message });
            }
        }

        [HttpPatch("{id}/ativar")]
        public async Task<IActionResult> AtivarProfessor(int id)
        {
            try
            {
                var professor = await _context.Professores.FindAsync(id);
                if (professor == null) return NotFound();

                professor.Ativo = true;
                professor.DataAtualizacao = DateTime.Now;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao ativar professor", error = ex.Message });
            }
        }

        [HttpPatch("{id}/desativar")]
        public async Task<IActionResult> DesativarProfessor(int id)
        {
            try
            {
                var professor = await _context.Professores.FindAsync(id);
                if (professor == null) return NotFound();

                professor.Ativo = false;
                professor.DataAtualizacao = DateTime.Now;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao desativar professor", error = ex.Message });
            }
        }

        private static Sexo? ConverterStringParaSexo(string? sexo)
        {
            if (string.IsNullOrEmpty(sexo)) return null;
            
            return sexo.ToUpper() switch
            {
                "MASCULINO" or "M" => Sexo.Masculino,
                "FEMININO" or "F" => Sexo.Feminino,
                _ => null
            };
        }

        private static TipoProfessor? ConverterStringParaTipoProfessor(string? tipoProfessor)
        {
            if (string.IsNullOrEmpty(tipoProfessor)) return null;
            
            return tipoProfessor.ToUpper() switch
            {
                "TUTOR" => TipoProfessor.Tutor,
                "TITULAR" => TipoProfessor.Titular,
                "COORDENADOR" => TipoProfessor.Coordenador,
                _ => null
            };
        }

        private bool ProfessorExists(int id)
        {
            return _context.Professores.Any(e => e.Id == id);
        }
    }
}
