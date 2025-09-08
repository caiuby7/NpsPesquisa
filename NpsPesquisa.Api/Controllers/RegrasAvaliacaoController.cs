using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NpsPesquisa.Api.Models;
using NpsPesquisa.Api.Services;

namespace NpsPesquisa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegrasAvaliacaoController : ControllerBase
    {
        /// <summary>
        /// Obtém todas as regras de avaliação válidas
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public ActionResult<object> GetRegras()
        {
            var regras = RegrasAvaliacao.ObterTodasCombinacoesValidas();
            var tiposParticipantes = Enum.GetValues<TipoParticipante>();
            var tiposItens = Enum.GetValues<TipoItemAvaliado>();

            return new
            {
                Regras = regras,
                TiposParticipantes = tiposParticipantes.Select(tp => new
                {
                    Valor = tp,
                    Nome = tp.ToString(),
                    Descricao = ObterDescricaoTipoParticipante(tp),
                    ItensValidos = RegrasAvaliacao.ObterItensValidosParaParticipante(tp)
                }),
                TiposItens = tiposItens.Select(ti => new
                {
                    Valor = ti,
                    Nome = ti.ToString(),
                    Descricao = ObterDescricaoTipoItem(ti),
                    ParticipantesValidos = RegrasAvaliacao.ObterParticipantesValidosParaItem(ti)
                })
            };
        }

        /// <summary>
        /// Obtém os tipos de itens válidos para um tipo de participante
        /// </summary>
        [HttpGet("participante/{tipoParticipante}")]
        [AllowAnonymous]
        public ActionResult<object> GetItensValidosParaParticipante(TipoParticipante tipoParticipante)
        {
            var itensValidos = RegrasAvaliacao.ObterItensValidosParaParticipante(tipoParticipante);
            
            return new
            {
                TipoParticipante = tipoParticipante,
                NomeParticipante = tipoParticipante.ToString(),
                DescricaoParticipante = ObterDescricaoTipoParticipante(tipoParticipante),
                ItensValidos = itensValidos.Select(item => new
                {
                    Valor = item,
                    Nome = item.ToString(),
                    Descricao = ObterDescricaoTipoItem(item),
                    DescricaoCombinacao = RegrasAvaliacao.ObterDescricaoCombinacao(tipoParticipante, item)
                })
            };
        }

        /// <summary>
        /// Obtém os tipos de participantes válidos para um tipo de item
        /// </summary>
        [HttpGet("item/{tipoItem}")]
        [AllowAnonymous]
        public ActionResult<object> GetParticipantesValidosParaItem(TipoItemAvaliado tipoItem)
        {
            var participantesValidos = RegrasAvaliacao.ObterParticipantesValidosParaItem(tipoItem);
            
            return new
            {
                TipoItem = tipoItem,
                NomeItem = tipoItem.ToString(),
                DescricaoItem = ObterDescricaoTipoItem(tipoItem),
                ParticipantesValidos = participantesValidos.Select(participante => new
                {
                    Valor = participante,
                    Nome = participante.ToString(),
                    Descricao = ObterDescricaoTipoParticipante(participante),
                    DescricaoCombinacao = RegrasAvaliacao.ObterDescricaoCombinacao(participante, tipoItem)
                })
            };
        }

        /// <summary>
        /// Valida uma combinação específica entre tipo de participante e tipo de item
        /// </summary>
        [HttpGet("validar/{tipoParticipante}/{tipoItem}")]
        [AllowAnonymous]
        public ActionResult<object> ValidarCombinacao(TipoParticipante tipoParticipante, TipoItemAvaliado tipoItem)
        {
            var ehValida = RegrasAvaliacao.ValidarCombinacao(tipoParticipante, tipoItem);
            var descricao = RegrasAvaliacao.ObterDescricaoCombinacao(tipoParticipante, tipoItem);

            return new
            {
                TipoParticipante = tipoParticipante,
                NomeParticipante = tipoParticipante.ToString(),
                TipoItem = tipoItem,
                NomeItem = tipoItem.ToString(),
                EhValida = ehValida,
                Descricao = descricao,
                Mensagem = ehValida 
                    ? "Combinação válida" 
                    : "Combinação inválida - este tipo de participante não pode avaliar este tipo de item"
            };
        }

        /// <summary>
        /// Obtém todas as combinações válidas com descrições detalhadas
        /// </summary>
        [HttpGet("combinacoes-detalhadas")]
        [AllowAnonymous]
        public ActionResult<object> GetCombinacoesDetalhadas()
        {
            var combinacoes = new List<object>();
            
            foreach (var tipoParticipante in Enum.GetValues<TipoParticipante>())
            {
                var itensValidos = RegrasAvaliacao.ObterItensValidosParaParticipante(tipoParticipante);
                
                foreach (var tipoItem in itensValidos)
                {
                    combinacoes.Add(new
                    {
                        TipoParticipante = tipoParticipante,
                        NomeParticipante = tipoParticipante.ToString(),
                        DescricaoParticipante = ObterDescricaoTipoParticipante(tipoParticipante),
                        TipoItem = tipoItem,
                        NomeItem = tipoItem.ToString(),
                        DescricaoItem = ObterDescricaoTipoItem(tipoItem),
                        DescricaoCombinacao = RegrasAvaliacao.ObterDescricaoCombinacao(tipoParticipante, tipoItem)
                    });
                }
            }

            return new
            {
                TotalCombinacoes = combinacoes.Count,
                Combinacoes = combinacoes
            };
        }

        #region Métodos Auxiliares

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

        private string ObterDescricaoTipoItem(TipoItemAvaliado tipo)
        {
            return tipo switch
            {
                TipoItemAvaliado.Curso => "Programa acadêmico completo",
                TipoItemAvaliado.Turma => "Grupo específico de alunos",
                TipoItemAvaliado.Disciplina => "Matéria ou componente curricular",
                TipoItemAvaliado.Coordenador => "Responsável pela coordenação",
                TipoItemAvaliado.Estrutura => "Instalações físicas",
                TipoItemAvaliado.Infraestrutura => "Recursos e equipamentos",
                _ => "Tipo de item não definido"
            };
        }

        #endregion
    }
}
