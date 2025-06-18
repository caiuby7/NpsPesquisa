using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ResultadoCscController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public ResultadoCscController(NpsDbContext context)
        {
            _context = context;
        }
        /*
        [HttpGet("atual/{periodoLetivo}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<object>> GetResultadoAtual(string periodoLetivo)
        {
            var questionario = await _context.Questionarios
                .Include(q => q.Respostas)
                    .ThenInclude(r => r.RespostasQuestoes)
                .FirstOrDefaultAsync(q => q.Titulo.Contains("CSC") && q.DataInicio.HasValue && q.DataFim.HasValue);

            if (questionario == null)
                return NotFound(new { message = "Questionário CSC não encontrado para o período atual" });

            var resultadosPorCurso = await _context.Respostas
                .Include(r => r.Aluno)
                    .ThenInclude(a => a.Curso)
                .Where(r => r.QuestionarioId == questionario.Id)
                .GroupBy(r => r.Aluno.Curso)
                .Select(g => new
                {
                    CursoId = g.Key.Id,
                    CursoNome = g.Key.Nome,
                    NotaCsc = g.Average(r => r.RespostasQuestoes
                        .Where(rq => rq.Questao.Tipo == TipoQuestao.Escala)
                        .Average(rq => decimal.Parse(rq.Valor))),
                    TotalRespondentes = g.Count()
                })
                .ToListAsync();

            return Ok(new
            {
                PeriodoLetivo = periodoLetivo,
                DataInicio = questionario.DataInicio,
                DataFim = questionario.DataFim,
                ResultadosPorCurso = resultadosPorCurso
            });
        }

        [HttpGet("historico")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<IEnumerable<object>>> GetHistorico()
        {
            var resultados = await _context.ResultadosHistoricosCsc
                .Include(r => r.Curso)
                .OrderByDescending(r => r.PeriodoLetivo)
                .Select(r => new
                {
                    r.Id,
                    r.PeriodoLetivo,
                    r.CursoId,
                    CursoNome = r.Curso.Nome,
                    r.NotaCsc,
                    r.TotalRespondentes,
                    r.Observacoes,
                    r.DataRegistro,
                    r.UsuarioRegistro
                })
                .ToListAsync();

            return Ok(resultados);
        }

        [HttpGet("historico/{periodoLetivo}")]
        [Authorize(Roles = "Administrador,Coordenacao")]
        public async Task<ActionResult<object>> GetHistoricoPorPeriodo(string periodoLetivo)
        {
            var resultados = await _context.ResultadosHistoricosCsc
                .Include(r => r.Curso)
                .Where(r => r.PeriodoLetivo == periodoLetivo)
                .Select(r => new
                {
                    r.Id,
                    r.PeriodoLetivo,
                    r.CursoId,
                    CursoNome = r.Curso.Nome,
                    r.NotaCsc,
                    r.TotalRespondentes,
                    r.Observacoes,
                    r.DataRegistro,
                    r.UsuarioRegistro
                })
                .ToListAsync();

            if (!resultados.Any())
                return NotFound(new { message = "Nenhum resultado encontrado para este período" });

            return Ok(new
            {
                PeriodoLetivo = periodoLetivo,
                Resultados = resultados
            });
        }

        [HttpPost("historico")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<ResultadoHistoricoCsc>> AdicionarHistorico(ResultadoHistoricoCsc resultado)
        {
            var curso = await _context.Cursos.FindAsync(resultado.CursoId);
            if (curso == null)
                return BadRequest(new { message = "Curso não encontrado" });

            resultado.DataRegistro = DateTime.UtcNow;
            resultado.UsuarioRegistro = User.Identity.Name;

            _context.ResultadosHistoricosCsc.Add(resultado);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetHistoricoPorPeriodo), 
                new { periodoLetivo = resultado.PeriodoLetivo }, resultado);
        }

        [HttpPut("historico/{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> AtualizarHistorico(int id, ResultadoHistoricoCsc resultado)
        {
            if (id != resultado.Id)
                return BadRequest(new { message = "ID do resultado não corresponde" });

            var resultadoExistente = await _context.ResultadosHistoricosCsc.FindAsync(id);
            if (resultadoExistente == null)
                return NotFound(new { message = "Resultado histórico não encontrado" });

            var curso = await _context.Cursos.FindAsync(resultado.CursoId);
            if (curso == null)
                return BadRequest(new { message = "Curso não encontrado" });

            resultadoExistente.PeriodoLetivo = resultado.PeriodoLetivo;
            resultadoExistente.CursoId = resultado.CursoId;
            resultadoExistente.NotaCsc = resultado.NotaCsc;
            resultadoExistente.TotalRespondentes = resultado.TotalRespondentes;
            resultadoExistente.Observacoes = resultado.Observacoes;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ResultadoHistoricoExists(id))
                    return NotFound(new { message = "Resultado histórico não encontrado" });
                throw;
            }

            return NoContent();
        }

        [HttpDelete("historico/{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeletarHistorico(int id)
        {
            var resultado = await _context.ResultadosHistoricosCsc.FindAsync(id);
            if (resultado == null)
                return NotFound(new { message = "Resultado histórico não encontrado" });

            _context.ResultadosHistoricosCsc.Remove(resultado);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ResultadoHistoricoExists(int id)
        {
            return _context.ResultadosHistoricosCsc.Any(e => e.Id == id);
        }*/
    }
} 