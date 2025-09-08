using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoordenadorCursoController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public CoordenadorCursoController(NpsDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém todas as coordenações
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CoordenadorCurso>>> GetCoordenacoes()
        {
            return await _context.CoordenadoresCursos
                .Include(cc => cc.Coordenador)
                .Include(cc => cc.Curso)
                .Where(cc => cc.Ativo)
                .ToListAsync();
        }

        /// <summary>
        /// Obtém uma coordenação específica
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<CoordenadorCurso>> GetCoordenacao(int id)
        {
            var coordenacao = await _context.CoordenadoresCursos
                .Include(cc => cc.Coordenador)
                .Include(cc => cc.Curso)
                .FirstOrDefaultAsync(cc => cc.Id == id && cc.Ativo);

            if (coordenacao == null)
                return NotFound(new { message = "Coordenacao não encontrada" });

            return coordenacao;
        }

        /// <summary>
        /// Cria uma nova coordenação
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<CoordenadorCurso>> CreateCoordenacao(CoordenadorCurso coordenacao)
        {
            // Verifica se o coordenador existe e está ativo
            var coordenador = await _context.Coordenadores
                .FirstOrDefaultAsync(c => c.Id == coordenacao.CoordenadorId && c.Ativo);
            
            if (coordenador == null)
                return BadRequest(new { message = "Coordenador não encontrado ou inativo" });

            // Verifica se o curso existe e está ativo
            var curso = await _context.Cursos
                .FirstOrDefaultAsync(c => c.Id == coordenacao.CursoId && c.Ativo);
            
            if (curso == null)
                return BadRequest(new { message = "Curso não encontrado ou inativo" });

            // Verifica se já existe uma coordenação ativa para este curso
            var coordenacaoExistente = await _context.CoordenadoresCursos
                .FirstOrDefaultAsync(cc => cc.CursoId == coordenacao.CursoId && cc.Ativo);

            if (coordenacaoExistente != null)
                return BadRequest(new { message = "Este curso já possui um coordenador ativo" });

            // Verifica se o coordenador já coordena outro curso ativo
            var coordenacaoCoordenador = await _context.CoordenadoresCursos
                .FirstOrDefaultAsync(cc => cc.CoordenadorId == coordenacao.CoordenadorId && cc.Ativo);

            if (coordenacaoCoordenador != null)
                return BadRequest(new { message = "Este coordenador já coordena outro curso ativo" });

            coordenacao.DataCadastro = DateTime.Now;
            coordenacao.Ativo = true;

            _context.CoordenadoresCursos.Add(coordenacao);
            await _context.SaveChangesAsync();

            // Retorna a coordenação com os dados relacionados
            var coordenacaoCriada = await _context.CoordenadoresCursos
                .Include(cc => cc.Coordenador)
                .Include(cc => cc.Curso)
                .FirstOrDefaultAsync(cc => cc.Id == coordenacao.Id);

            return CreatedAtAction(nameof(GetCoordenacao), new { id = coordenacao.Id }, coordenacaoCriada);
        }

        /// <summary>
        /// Atualiza uma coordenação
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCoordenacao(int id, CoordenadorCurso coordenacao)
        {
            if (id != coordenacao.Id)
                return BadRequest();

            var coordenacaoExistente = await _context.CoordenadoresCursos
                .FirstOrDefaultAsync(cc => cc.Id == id && cc.Ativo);

            if (coordenacaoExistente == null)
                return NotFound(new { message = "Coordenacao não encontrada" });

            // Verifica se o coordenador existe e está ativo
            var coordenador = await _context.Coordenadores
                .FirstOrDefaultAsync(c => c.Id == coordenacao.CoordenadorId && c.Ativo);
            
            if (coordenador == null)
                return BadRequest(new { message = "Coordenador não encontrado ou inativo" });

            // Verifica se o curso existe e está ativo
            var curso = await _context.Cursos
                .FirstOrDefaultAsync(c => c.Id == coordenacao.CursoId && c.Ativo);
            
            if (curso == null)
                return BadRequest(new { message = "Curso não encontrado ou inativo" });

            // Verifica se já existe outra coordenação ativa para este curso (excluindo a atual)
            var coordenacaoCursoExistente = await _context.CoordenadoresCursos
                .FirstOrDefaultAsync(cc => cc.CursoId == coordenacao.CursoId && cc.Id != id && cc.Ativo);

            if (coordenacaoCursoExistente != null)
                return BadRequest(new { message = "Este curso já possui outro coordenador ativo" });

            // Verifica se o coordenador já coordena outro curso ativo (excluindo o atual)
            var coordenacaoCoordenadorExistente = await _context.CoordenadoresCursos
                .FirstOrDefaultAsync(cc => cc.CoordenadorId == coordenacao.CoordenadorId && cc.Id != id && cc.Ativo);

            if (coordenacaoCoordenadorExistente != null)
                return BadRequest(new { message = "Este coordenador já coordena outro curso ativo" });

            coordenacaoExistente.CoordenadorId = coordenacao.CoordenadorId;
            coordenacaoExistente.CursoId = coordenacao.CursoId;
            coordenacaoExistente.DataInicio = coordenacao.DataInicio;
            coordenacaoExistente.DataFim = coordenacao.DataFim;
            coordenacaoExistente.Observacao = coordenacao.Observacao;
            coordenacaoExistente.DataAtualizacao = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CoordenacaoExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Desativa uma coordenação
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCoordenacao(int id)
        {
            var coordenacao = await _context.CoordenadoresCursos
                .FirstOrDefaultAsync(cc => cc.Id == id && cc.Ativo);

            if (coordenacao == null)
                return NotFound(new { message = "Coordenacao não encontrada" });

            coordenacao.Ativo = false;
            coordenacao.DataFim = DateTime.Now;
            coordenacao.DataAtualizacao = DateTime.Now;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Obtém coordenações por curso
        /// </summary>
        [HttpGet("curso/{cursoId}")]
        public async Task<ActionResult<IEnumerable<CoordenadorCurso>>> GetCoordenacoesPorCurso(int cursoId)
        {
            return await _context.CoordenadoresCursos
                .Include(cc => cc.Coordenador)
                .Include(cc => cc.Curso)
                .Where(cc => cc.CursoId == cursoId && cc.Ativo)
                .ToListAsync();
        }

        /// <summary>
        /// Obtém coordenações por coordenador
        /// </summary>
        [HttpGet("coordenador/{coordenadorId}")]
        public async Task<ActionResult<IEnumerable<CoordenadorCurso>>> GetCoordenacoesPorCoordenador(int coordenadorId)
        {
            return await _context.CoordenadoresCursos
                .Include(cc => cc.Coordenador)
                .Include(cc => cc.Curso)
                .Where(cc => cc.CoordenadorId == coordenadorId && cc.Ativo)
                .ToListAsync();
        }

        /// <summary>
        /// Obtém coordenações ativas
        /// </summary>
        [HttpGet("ativas")]
        public async Task<ActionResult<IEnumerable<CoordenadorCurso>>> GetCoordenacoesAtivas()
        {
            return await _context.CoordenadoresCursos
                .Include(cc => cc.Coordenador)
                .Include(cc => cc.Curso)
                .Where(cc => cc.Ativo && cc.EhCoordenacaoAtiva)
                .ToListAsync();
        }

        /// <summary>
        /// Obtém histórico de coordenações de um curso
        /// </summary>
        [HttpGet("curso/{cursoId}/historico")]
        public async Task<ActionResult<IEnumerable<CoordenadorCurso>>> GetHistoricoCoordenacoesPorCurso(int cursoId)
        {
            return await _context.CoordenadoresCursos
                .Include(cc => cc.Coordenador)
                .Include(cc => cc.Curso)
                .Where(cc => cc.CursoId == cursoId)
                .OrderByDescending(cc => cc.DataInicio)
                .ToListAsync();
        }

        /// <summary>
        /// Obtém histórico de coordenações de um coordenador
        /// </summary>
        [HttpGet("coordenador/{coordenadorId}/historico")]
        public async Task<ActionResult<IEnumerable<CoordenadorCurso>>> GetHistoricoCoordenacoesPorCoordenador(int coordenadorId)
        {
            return await _context.CoordenadoresCursos
                .Include(cc => cc.Coordenador)
                .Include(cc => cc.Curso)
                .Where(cc => cc.CoordenadorId == coordenadorId)
                .OrderByDescending(cc => cc.DataInicio)
                .ToListAsync();
        }

        private bool CoordenacaoExists(int id)
        {
            return _context.CoordenadoresCursos.Any(cc => cc.Id == id && cc.Ativo);
        }
    }
}
