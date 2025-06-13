using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Models;
using NpsPesquisa.Api.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlunoController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public AlunoController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<IEnumerable<Aluno>>> GetAll()
        {
            return await _context.Alunos
                .Include(a => a.Curso)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<Aluno>> GetById(int id)
        {
            var aluno = await _context.Alunos
                .Include(a => a.Curso)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aluno == null) return NotFound();
            return aluno;
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<Aluno>> Create(AlunoViewModel alunoViewModel)
        {
            // Busca o curso pelo nome
            var curso = await _context.Cursos
                .FirstOrDefaultAsync(c => c.Nome.ToLower() == alunoViewModel.NomeCurso.ToLower());

            // Se o curso não existir, cria um novo
            if (curso == null)
            {
                curso = new Curso { Nome = alunoViewModel.NomeCurso };
                _context.Cursos.Add(curso);
                await _context.SaveChangesAsync();
            }

            var aluno = new Aluno
            {
                Nome = alunoViewModel.Nome,
                Filial = alunoViewModel.Filial,
                NivelEnsino = alunoViewModel.NivelEnsino,
                PeriodoLetivo = alunoViewModel.PeriodoLetivo,
                Matricula = alunoViewModel.Matricula,
                CursoId = curso.Id,
                Turno = alunoViewModel.Turno,
                EmailInstitucional = alunoViewModel.EmailInstitucional,
                EmailPessoal = alunoViewModel.EmailPessoal,
                Fone = alunoViewModel.Fone,
                StatusNoPeriodoLetivo = alunoViewModel.StatusNoPeriodoLetivo,
                AceitaContato = alunoViewModel.AceitaContato
            };

            _context.Alunos.Add(aluno);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = aluno.Id }, aluno);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Update(int id, AlunoViewModel alunoViewModel)
        {
            var aluno = await _context.Alunos.FindAsync(id);
            if (aluno == null) return NotFound();

            // Busca o curso pelo nome
            var curso = await _context.Cursos
                .FirstOrDefaultAsync(c => c.Nome.ToLower() == alunoViewModel.NomeCurso.ToLower());

            // Se o curso não existir, cria um novo
            if (curso == null)
            {
                curso = new Curso { Nome = alunoViewModel.NomeCurso };
                _context.Cursos.Add(curso);
                await _context.SaveChangesAsync();
            }

            aluno.Nome = alunoViewModel.Nome;
            aluno.Filial = alunoViewModel.Filial;
            aluno.NivelEnsino = alunoViewModel.NivelEnsino;
            aluno.PeriodoLetivo = alunoViewModel.PeriodoLetivo;
            aluno.Matricula = alunoViewModel.Matricula;
            aluno.CursoId = curso.Id;
            aluno.Turno = alunoViewModel.Turno;
            aluno.EmailInstitucional = alunoViewModel.EmailInstitucional;
            aluno.EmailPessoal = alunoViewModel.EmailPessoal;
            aluno.Fone = alunoViewModel.Fone;
            aluno.StatusNoPeriodoLetivo = alunoViewModel.StatusNoPeriodoLetivo;
            aluno.AceitaContato = alunoViewModel.AceitaContato;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlunoExists(id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Delete(int id)
        {
            var aluno = await _context.Alunos.FindAsync(id);
            if (aluno == null) return NotFound();

            // Verifica se existem respostas vinculadas
            var respostasVinculadas = await _context.Respostas.AnyAsync(r => r.AlunoId == id);
            if (respostasVinculadas)
                return BadRequest("Não é possível excluir um aluno que possui respostas vinculadas.");

            _context.Alunos.Remove(aluno);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AlunoExists(int id)
        {
            return _context.Alunos.Any(e => e.Id == id);
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportAlunos(IFormFile file)
        {
            if (file == null || file.Length <= 0)
            {
                return BadRequest("No file uploaded.");
            }
            /*
            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    var rowCount = worksheet.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++)
                    {
                        var aluno = new Aluno
                        {
                            Filial = worksheet.Cells[row, 1].Value?.ToString(),
                            NivelEnsino = worksheet.Cells[row, 2].Value?.ToString(),
                            PeriodoLetivo = worksheet.Cells[row, 3].Value?.ToString(),
                            Nome = worksheet.Cells[row, 4].Value?.ToString(),
                            Matricula = worksheet.Cells[row, 5].Value?.ToString(),
                            Turno = worksheet.Cells[row, 6].Value?.ToString(),
                            EmailInstitucional = worksheet.Cells[row, 7].Value?.ToString(),
                            EmailPessoal = worksheet.Cells[row, 8].Value?.ToString(),
                            Fone = worksheet.Cells[row, 9].Value?.ToString(),
                            StatusNoPeriodoLetivo = worksheet.Cells[row, 10].Value?.ToString()
                        };

                        _context.Alunos.Add(aluno);
                    }
                }
            }*/

            await _context.SaveChangesAsync();
            return Ok("Import completed successfully.");
        }
    }
} 