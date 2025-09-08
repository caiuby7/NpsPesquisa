using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NpsPesquisa.Api.Data;
using NpsPesquisa.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoordenadorController : ControllerBase
    {
        private readonly NpsDbContext _context;

        public CoordenadorController(NpsDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém todos os coordenadores
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Coordenador>>> GetCoordenadores()
        {
            return await _context.Coordenadores
                .Include(c => c.Coordenacoes)
                    .ThenInclude(cc => cc.Curso)
                .Where(c => c.Ativo)
                .ToListAsync();
        }

        /// <summary>
        /// Obtém um coordenador específico
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Coordenador>> GetCoordenador(int id)
        {
            var coordenador = await _context.Coordenadores
                .Include(c => c.Coordenacoes)
                    .ThenInclude(cc => cc.Curso)
                .FirstOrDefaultAsync(c => c.Id == id && c.Ativo);

            if (coordenador == null)
                return NotFound(new { message = "Coordenador não encontrado" });

            return coordenador;
        }

        /// <summary>
        /// Cria um novo coordenador
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Coordenador>> CreateCoordenador(Coordenador coordenador)
        {
            // Validação de email único
            if (await _context.Coordenadores.AnyAsync(c => c.Email == coordenador.Email && c.Ativo))
                return BadRequest(new { message = "Já existe um coordenador com este email" });

            // Validação de CPF único (se fornecido)
            if (!string.IsNullOrEmpty(coordenador.Cpf) && 
                await _context.Coordenadores.AnyAsync(c => c.Cpf == coordenador.Cpf && c.Ativo))
                return BadRequest(new { message = "Já existe um coordenador com este CPF" });

            coordenador.DataCadastro = DateTime.Now;
            coordenador.Ativo = true;

            _context.Coordenadores.Add(coordenador);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCoordenador), new { id = coordenador.Id }, coordenador);
        }

        /// <summary>
        /// Atualiza um coordenador
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCoordenador(int id, Coordenador coordenador)
        {
            if (id != coordenador.Id)
                return BadRequest();

            var coordenadorExistente = await _context.Coordenadores
                .FirstOrDefaultAsync(c => c.Id == id && c.Ativo);

            if (coordenadorExistente == null)
                return NotFound(new { message = "Coordenador não encontrado" });

            // Validação de email único (excluindo o próprio)
            if (await _context.Coordenadores.AnyAsync(c => c.Email == coordenador.Email && c.Id != id && c.Ativo))
                return BadRequest(new { message = "Já existe um coordenador com este email" });

            // Validação de CPF único (se fornecido)
            if (!string.IsNullOrEmpty(coordenador.Cpf) && 
                await _context.Coordenadores.AnyAsync(c => c.Cpf == coordenador.Cpf && c.Id != id && c.Ativo))
                return BadRequest(new { message = "Já existe um coordenador com este CPF" });

            coordenadorExistente.Nome = coordenador.Nome;
            coordenadorExistente.Email = coordenador.Email;
            coordenadorExistente.Departamento = coordenador.Departamento;
            coordenadorExistente.Titulacao = coordenador.Titulacao;
            coordenadorExistente.Telefone = coordenador.Telefone;
            coordenadorExistente.Cpf = coordenador.Cpf;
            coordenadorExistente.DataNascimento = coordenador.DataNascimento;
            coordenadorExistente.DataAtualizacao = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CoordenadorExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Desativa um coordenador
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCoordenador(int id)
        {
            var coordenador = await _context.Coordenadores
                .Include(c => c.Coordenacoes.Where(cc => cc.Ativo))
                .FirstOrDefaultAsync(c => c.Id == id && c.Ativo);

            if (coordenador == null)
                return NotFound(new { message = "Coordenador não encontrado" });

            // Verifica se tem coordenações ativas
            if (coordenador.Coordenacoes.Any())
                return BadRequest(new { message = "Não é possível excluir um coordenador com coordenações ativas" });

            coordenador.Ativo = false;
            coordenador.DataAtualizacao = DateTime.Now;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Obtém coordenadores por departamento
        /// </summary>
        [HttpGet("departamento/{departamento}")]
        public async Task<ActionResult<IEnumerable<Coordenador>>> GetCoordenadoresPorDepartamento(string departamento)
        {
            return await _context.Coordenadores
                .Include(c => c.Coordenacoes.Where(cc => cc.Ativo))
                    .ThenInclude(cc => cc.Curso)
                .Where(c => c.Ativo && c.Departamento == departamento)
                .ToListAsync();
        }

        /// <summary>
        /// Obtém coordenadores ativos
        /// </summary>
        [HttpGet("ativos")]
        public async Task<ActionResult<IEnumerable<Coordenador>>> GetCoordenadoresAtivos()
        {
            return await _context.Coordenadores
                .Include(c => c.Coordenacoes.Where(cc => cc.Ativo))
                    .ThenInclude(cc => cc.Curso)
                .Where(c => c.Ativo)
                .ToListAsync();
        }

        /// <summary>
        /// Obtém coordenadores disponíveis (sem coordenações ativas)
        /// </summary>
        [HttpGet("disponiveis")]
        public async Task<ActionResult<IEnumerable<Coordenador>>> GetCoordenadoresDisponiveis()
        {
            var coordenadoresComCoordenacoes = await _context.CoordenadoresCursos
                .Where(cc => cc.Ativo)
                .Select(cc => cc.CoordenadorId)
                .Distinct()
                .ToListAsync();

            return await _context.Coordenadores
                .Where(c => c.Ativo && !coordenadoresComCoordenacoes.Contains(c.Id))
                .ToListAsync();
        }

        private bool CoordenadorExists(int id)
        {
            return _context.Coordenadores.Any(c => c.Id == id && c.Ativo);
        }
    }
}
