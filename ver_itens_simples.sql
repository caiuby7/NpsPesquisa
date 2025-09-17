-- SQL SIMPLES para ver os itens avaliados
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- Consulta simples e direta
SELECT
    rq.Id,
    rq.RespostaId,
    rq.QuestaoId,
    rq.Valor,
    rq.ItemAvaliadoId,
    ia.nomeItemEspecifico AS ItemAvaliado,
    r.DataResposta
FROM
    respostasquestoes AS rq
LEFT JOIN
    itensavaliadosquestionarios AS ia ON rq.ItemAvaliadoId = ia.Id
LEFT JOIN
    respostas AS r ON rq.RespostaId = r.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
ORDER BY
    rq.RespostaId, rq.QuestaoId, rq.ItemAvaliadoId;
