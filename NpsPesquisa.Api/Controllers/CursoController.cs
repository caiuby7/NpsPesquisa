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
    public class CursoController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public CursoController(NpsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Curso>>> GetAll()
        {
            return await _context.Cursos
                .Include(c => c.Instituicao)
                .Where(c => c.Ativo)
                .OrderBy(c => c.Codigo)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Curso>> GetById(int id)
        {
            var curso = await _context.Cursos
                .Include(c => c.Instituicao)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (curso == null) return NotFound();

            return curso;
        }

        [HttpPost]
        public async Task<ActionResult<Curso>> Create(CursoViewModel cursoViewModel)
        {
            try
            {
                // Validar se já existe um curso com o mesmo código
                var cursoExistente = await _context.Cursos
                    .FirstOrDefaultAsync(c => c.Codigo == cursoViewModel.Codigo);

                if (cursoExistente != null)
                {
                    return BadRequest("Já existe um curso com este código");
                }

                var curso = new Curso
                {
                    Nome = cursoViewModel.Nome,
                    Descricao = cursoViewModel.Descricao,
                    Codigo = cursoViewModel.Codigo,
                    Modalidade = ConverterStringParaModalidade(cursoViewModel.Modalidade),
                    TipoCurso = ConverterStringParaTipoCurso(cursoViewModel.TipoCurso),
                    IntegracaoId = cursoViewModel.IntegracaoId,
                    CodigoFilial = cursoViewModel.CodigoFilial,
                    Ativo = cursoViewModel.Ativo,
                    InstituicaoId = cursoViewModel.InstituicaoId,
                    DataCadastro = System.DateTime.Now
                };

                _context.Cursos.Add(curso);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = curso.Id }, curso);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao criar curso", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CursoViewModel cursoViewModel)
        {
            try
            {
                var curso = await _context.Cursos.FindAsync(id);
                if (curso == null) return NotFound();

                // Validar se já existe outro curso com o mesmo código
                var cursoComCodigo = await _context.Cursos
                    .FirstOrDefaultAsync(c => c.Codigo == cursoViewModel.Codigo && c.Id != id);

                if (cursoComCodigo != null)
                {
                    return BadRequest("Já existe outro curso com este código");
                }

                curso.Nome = cursoViewModel.Nome;
                curso.Descricao = cursoViewModel.Descricao;
                curso.Codigo = cursoViewModel.Codigo;
                curso.Modalidade = ConverterStringParaModalidade(cursoViewModel.Modalidade);
                curso.TipoCurso = ConverterStringParaTipoCurso(cursoViewModel.TipoCurso);
                curso.IntegracaoId = cursoViewModel.IntegracaoId;
                curso.CodigoFilial = cursoViewModel.CodigoFilial;
                curso.Ativo = cursoViewModel.Ativo;
                curso.InstituicaoId = cursoViewModel.InstituicaoId;
                curso.DataAtualizacao = System.DateTime.Now;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!CursoExists(id))
                        return NotFound();
                    throw;
                }

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar curso", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var curso = await _context.Cursos.FindAsync(id);
                if (curso == null) return NotFound();

                // Verificar se o curso está sendo usado em algum lugar
                var alunosVinculados = await _context.Alunos.AnyAsync(a => a.CursoId == id);
                var turmasVinculadas = await _context.Turmas.AnyAsync(t => t.CursoId == id);
                // var coordenacoesVinculadas = await _context.CoordenadorCursos.AnyAsync(cc => cc.CursoId == id);
                var disciplinasVinculadas = await _context.Disciplinas.AnyAsync(d => d.InstituicaoId == curso.InstituicaoId);

                if (alunosVinculados || turmasVinculadas || disciplinasVinculadas)
                {
                    return BadRequest("Não é possível excluir este curso pois está sendo usado por alunos, turmas, coordenações ou disciplinas. Use a opção de desativar.");
                }

                _context.Cursos.Remove(curso);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao excluir curso", error = ex.Message });
            }
        }

        [HttpPatch("{id}/ativar")]
        public async Task<IActionResult> AtivarCurso(int id)
        {
            try
            {
                var curso = await _context.Cursos.FindAsync(id);
                if (curso == null) return NotFound();

                curso.Ativo = true;
                curso.DataAtualizacao = System.DateTime.Now;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao ativar curso", error = ex.Message });
            }
        }

        [HttpPatch("{id}/desativar")]
        public async Task<IActionResult> DesativarCurso(int id)
        {
            try
            {
                var curso = await _context.Cursos.FindAsync(id);
                if (curso == null) return NotFound();

                curso.Ativo = false;
                curso.DataAtualizacao = System.DateTime.Now;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao desativar curso", error = ex.Message });
            }
        }

        private static Modalidade ConverterStringParaModalidade(string modalidade)
        {
            return modalidade.ToUpper() switch
            {
                "PRESENCIAL" => Modalidade.PRESENCIAL,
                "EAD" => Modalidade.EAD,
                _ => Modalidade.PRESENCIAL // Valor padrão
            };
        }

        private static TipoCurso ConverterStringParaTipoCurso(string tipoCurso)
        {
            return tipoCurso.ToUpper() switch
            {
                "GRADUACAO" => TipoCurso.GRADUACAO,
                "POSGRADUACAO" or "PÓS-GRADUAÇÃO" or "PÓSGRADUAÇÃO" => TipoCurso.POSGRADUACAO,
                _ => TipoCurso.GRADUACAO // Valor padrão
            };
        }

        private bool CursoExists(int id)
        {
            return _context.Cursos.Any(e => e.Id == id);
        }
    }
} 