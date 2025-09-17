-- SQL para verificar quais itens foram avaliados nas respostas
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- Consulta principal para ver os itens avaliados
SELECT
    rq.Id,
    rq.RespostaId,
    rq.QuestaoId,
    rq.Valor,
    rq.Texto,
    rq.OpcaoId,
    rq.ItemAvaliadoId,
    ia.nomeItemEspecifico AS NomeDoItemAvaliado,
    ia.tipoItemAvaliado AS TipoItemAvaliado,
    ia.descricaoItem AS DescricaoItem,
    r.DataResposta,
    p.Nome AS NomeParticipante,
    q.Texto AS TextoQuestao
FROM
    respostasquestoes AS rq
LEFT JOIN
    itensavaliadosquestionarios AS ia ON rq.ItemAvaliadoId = ia.Id
LEFT JOIN
    respostas AS r ON rq.RespostaId = r.Id
LEFT JOIN
    participantes AS p ON r.ParticipanteId = p.Id
LEFT JOIN
    questoes AS q ON rq.QuestaoId = q.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
ORDER BY
    rq.RespostaId, rq.QuestaoId, rq.ItemAvaliadoId;

-- Consulta resumida por questão
SELECT
    rq.QuestaoId,
    q.Texto AS TextoQuestao,
    COUNT(DISTINCT rq.ItemAvaliadoId) AS TotalItensAvaliados,
    GROUP_CONCAT(DISTINCT ia.nomeItemEspecifico ORDER BY ia.nomeItemEspecifico SEPARATOR ', ') AS ItensAvaliados
FROM
    respostasquestoes AS rq
LEFT JOIN
    questoes AS q ON rq.QuestaoId = q.Id
LEFT JOIN
    itensavaliadosquestionarios AS ia ON rq.ItemAvaliadoId = ia.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
GROUP BY
    rq.QuestaoId, q.Texto
ORDER BY
    rq.QuestaoId;

-- Consulta para ver respostas sem ItemAvaliadoId (estrutura normal)
SELECT
    rq.Id,
    rq.RespostaId,
    rq.QuestaoId,
    rq.Valor,
    rq.Texto,
    rq.OpcaoId,
    rq.ItemAvaliadoId,
    'Resposta Normal (sem item específico)' AS TipoResposta,
    r.DataResposta,
    p.Nome AS NomeParticipante,
    q.Texto AS TextoQuestao
FROM
    respostasquestoes AS rq
LEFT JOIN
    respostas AS r ON rq.RespostaId = r.Id
LEFT JOIN
    participantes AS p ON r.ParticipanteId = p.Id
LEFT JOIN
    questoes AS q ON rq.QuestaoId = q.Id
WHERE
    rq.ItemAvaliadoId IS NULL
ORDER BY
    rq.RespostaId, rq.QuestaoId;

-- Estatísticas gerais
SELECT
    'Total de Respostas' AS Metrica,
    COUNT(*) AS Valor
FROM respostasquestoes
UNION ALL
SELECT
    'Respostas com ItemAvaliadoId' AS Metrica,
    COUNT(*) AS Valor
FROM respostasquestoes
WHERE ItemAvaliadoId IS NOT NULL
UNION ALL
SELECT
    'Respostas sem ItemAvaliadoId' AS Metrica,
    COUNT(*) AS Valor
FROM respostasquestoes
WHERE ItemAvaliadoId IS NULL
UNION ALL
SELECT
    'Questões diferentes respondidas' AS Metrica,
    COUNT(DISTINCT QuestaoId) AS Valor
FROM respostasquestoes
UNION ALL
SELECT
    'Itens diferentes avaliados' AS Metrica,
    COUNT(DISTINCT ItemAvaliadoId) AS Valor
FROM respostasquestoes
WHERE ItemAvaliadoId IS NOT NULL;
