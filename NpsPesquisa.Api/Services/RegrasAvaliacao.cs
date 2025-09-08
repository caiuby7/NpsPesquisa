using NpsPesquisa.Api.Models;

namespace NpsPesquisa.Api.Services
{
    public static class RegrasAvaliacao
    {
        /// <summary>
        /// Define as combinações válidas entre Tipo de Participante e Tipo de Item Avaliado
        /// </summary>
        public static readonly Dictionary<TipoParticipante, TipoItemAvaliado[]> CombinacoesValidas = new()
        {
            { TipoParticipante.Aluno, new[] { 
                TipoItemAvaliado.Curso,           // Aluno avalia seu curso
                TipoItemAvaliado.Turma,           // Aluno avalia sua turma
                TipoItemAvaliado.Disciplina,      // Aluno avalia disciplinas que cursa
                TipoItemAvaliado.Coordenador      // Aluno avalia coordenador do curso
            }},
            
            { TipoParticipante.Professor, new[] { 
                TipoItemAvaliado.Turma,           // Professor avalia turmas que leciona
                TipoItemAvaliado.Disciplina,      // Professor avalia disciplinas que ministra
                TipoItemAvaliado.Coordenador,     // Professor avalia coordenador
                TipoItemAvaliado.Estrutura,       // Professor avalia estrutura da sala
                TipoItemAvaliado.Infraestrutura   // Professor avalia infraestrutura
            }},
            
            { TipoParticipante.Funcionario, new[] { 
                TipoItemAvaliado.Estrutura,       // Funcionário avalia estrutura física
                TipoItemAvaliado.Infraestrutura,  // Funcionário avalia infraestrutura
                TipoItemAvaliado.Coordenador      // Funcionário avalia coordenadores
            }},
            
            { TipoParticipante.Coordenador, new[] { 
                TipoItemAvaliado.Estrutura,       // Coordenador avalia estrutura física
                TipoItemAvaliado.Infraestrutura   // Coordenador avalia infraestrutura
            }}
        };

        /// <summary>
        /// Valida se uma combinação entre Tipo de Participante e Tipo de Item é válida
        /// </summary>
        /// <param name="tipoParticipante">Tipo do participante</param>
        /// <param name="tipoItem">Tipo do item a ser avaliado</param>
        /// <returns>True se a combinação for válida</returns>
        public static bool ValidarCombinacao(TipoParticipante tipoParticipante, TipoItemAvaliado tipoItem)
        {
            return CombinacoesValidas.ContainsKey(tipoParticipante) && 
                   CombinacoesValidas[tipoParticipante].Contains(tipoItem);
        }

        /// <summary>
        /// Obtém todos os tipos de itens que um tipo de participante pode avaliar
        /// </summary>
        /// <param name="tipoParticipante">Tipo do participante</param>
        /// <returns>Array com os tipos de itens válidos</returns>
        public static TipoItemAvaliado[] ObterItensValidosParaParticipante(TipoParticipante tipoParticipante)
        {
            return CombinacoesValidas.ContainsKey(tipoParticipante) 
                ? CombinacoesValidas[tipoParticipante] 
                : Array.Empty<TipoItemAvaliado>();
        }

        /// <summary>
        /// Obtém todos os tipos de participantes que podem avaliar um tipo de item
        /// </summary>
        /// <param name="tipoItem">Tipo do item</param>
        /// <returns>Array com os tipos de participantes válidos</returns>
        public static TipoParticipante[] ObterParticipantesValidosParaItem(TipoItemAvaliado tipoItem)
        {
            return CombinacoesValidas
                .Where(kvp => kvp.Value.Contains(tipoItem))
                .Select(kvp => kvp.Key)
                .ToArray();
        }

        /// <summary>
        /// Obtém descrição amigável de uma combinação válida
        /// </summary>
        /// <param name="tipoParticipante">Tipo do participante</param>
        /// <param name="tipoItem">Tipo do item</param>
        /// <returns>Descrição da combinação</returns>
        public static string ObterDescricaoCombinacao(TipoParticipante tipoParticipante, TipoItemAvaliado tipoItem)
        {
            if (!ValidarCombinacao(tipoParticipante, tipoItem))
                return "Combinação inválida";

            return (tipoParticipante, tipoItem) switch
            {
                (TipoParticipante.Aluno, TipoItemAvaliado.Curso) => "Alunos avaliam seus cursos",
                (TipoParticipante.Aluno, TipoItemAvaliado.Turma) => "Alunos avaliam suas turmas",
                (TipoParticipante.Aluno, TipoItemAvaliado.Disciplina) => "Alunos avaliam disciplinas que cursam",
                (TipoParticipante.Aluno, TipoItemAvaliado.Coordenador) => "Alunos avaliam coordenadores",
                
                (TipoParticipante.Professor, TipoItemAvaliado.Turma) => "Professores avaliam turmas que lecionam",
                (TipoParticipante.Professor, TipoItemAvaliado.Disciplina) => "Professores avaliam disciplinas que ministram",
                (TipoParticipante.Professor, TipoItemAvaliado.Coordenador) => "Professores avaliam coordenadores",
                (TipoParticipante.Professor, TipoItemAvaliado.Estrutura) => "Professores avaliam estrutura das salas",
                (TipoParticipante.Professor, TipoItemAvaliado.Infraestrutura) => "Professores avaliam infraestrutura",
                
                (TipoParticipante.Funcionario, TipoItemAvaliado.Estrutura) => "Funcionários avaliam estrutura física",
                (TipoParticipante.Funcionario, TipoItemAvaliado.Infraestrutura) => "Funcionários avaliam infraestrutura",
                (TipoParticipante.Funcionario, TipoItemAvaliado.Coordenador) => "Funcionários avaliam coordenadores",
                
                (TipoParticipante.Coordenador, TipoItemAvaliado.Estrutura) => "Coordenadores avaliam estrutura física",
                (TipoParticipante.Coordenador, TipoItemAvaliado.Infraestrutura) => "Coordenadores avaliam infraestrutura",
                
                _ => "Combinação válida"
            };
        }

        /// <summary>
        /// Obtém todas as combinações válidas com suas descrições
        /// </summary>
        /// <returns>Dicionário com todas as combinações válidas</returns>
        public static Dictionary<string, string> ObterTodasCombinacoesValidas()
        {
            var resultado = new Dictionary<string, string>();
            
            foreach (var combinacao in CombinacoesValidas)
            {
                foreach (var tipoItem in combinacao.Value)
                {
                    var chave = $"{combinacao.Key} → {tipoItem}";
                    var descricao = ObterDescricaoCombinacao(combinacao.Key, tipoItem);
                    resultado[chave] = descricao;
                }
            }
            
            return resultado;
        }
    }
}
