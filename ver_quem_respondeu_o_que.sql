-- SQL SIMPLES: Quem respondeu e o que foi avaliado
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- Consulta principal - QUEM respondeu O QUE
SELECT
    p.Nome AS QuemRespondeu,
    p.Tipo AS TipoParticipante,
    q.Texto AS Questao,
    rq.Valor AS Resposta,
    ia.tipoItemAvaliado AS TipoItemAvaliado,
    ia.nomeItemEspecifico AS NomeItemAvaliado,
    r.DataResposta AS QuandoRespondeu
FROM
    respostasquestoes AS rq
LEFT JOIN
    respostas AS r ON rq.RespostaId = r.Id
LEFT JOIN
    participantes AS p ON r.ParticipanteId = p.Id
LEFT JOIN
    questoes AS q ON rq.QuestaoId = q.Id
LEFT JOIN
    itensavaliadosquestionarios AS ia ON rq.ItemAvaliadoId = ia.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
ORDER BY
    r.DataResposta DESC, p.Nome;

-- Resumo por TIPO DE ITEM avaliado
SELECT
    ia.tipoItemAvaliado AS TipoItemAvaliado,
    COUNT(*) AS QuantasRespostas,
    GROUP_CONCAT(DISTINCT ia.nomeItemEspecifico ORDER BY ia.nomeItemEspecifico SEPARATOR ', ') AS QuaisItens
FROM
    respostasquestoes AS rq
LEFT JOIN
    itensavaliadosquestionarios AS ia ON rq.ItemAvaliadoId = ia.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
GROUP BY
    ia.tipoItemAvaliado
ORDER BY
    QuantasRespostas DESC;

-- Resumo por PARTICIPANTE
SELECT
    p.Nome AS QuemRespondeu,
    p.Tipo AS TipoParticipante,
    COUNT(*) AS TotalRespostas,
    GROUP_CONCAT(DISTINCT ia.tipoItemAvaliado ORDER BY ia.tipoItemAvaliado SEPARATOR ', ') AS TiposItensAvaliados
FROM
    respostasquestoes AS rq
LEFT JOIN
    respostas AS r ON rq.RespostaId = r.Id
LEFT JOIN
    participantes AS p ON r.ParticipanteId = p.Id
LEFT JOIN
    itensavaliadosquestionarios AS ia ON rq.ItemAvaliadoId = ia.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
GROUP BY
    p.Id, p.Nome, p.Tipo
ORDER BY
    TotalRespostas DESC;
