-- SQL para testar se as correções funcionaram
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- 1. Verificar se agora temos dados na tabela respostas
SELECT 'Verificando dados na tabela respostas após correção' AS Status;
SELECT 
    Id,
    QuestionarioId,
    ParticipanteId,
    TipoItemAvaliado,
    NomeItemEspecifico,
    ItemAvaliadoId,
    DataResposta
FROM respostas 
WHERE Id IN (SELECT DISTINCT RespostaId FROM respostasquestoes WHERE ItemAvaliadoId IS NOT NULL)
ORDER BY DataResposta DESC;

-- 2. Consulta completa com as informações dos itens
SELECT 'Consulta completa com informações dos itens' AS Status;
SELECT
    p.Nome AS QuemRespondeu,
    p.Tipo AS TipoParticipante,
    q.Texto AS Questao,
    rq.Valor AS Resposta,
    r.TipoItemAvaliado AS TipoItemAvaliado,
    r.NomeItemEspecifico AS NomeItemAvaliado,
    r.ItemAvaliadoId AS ItemAvaliadoId,
    r.DataResposta AS QuandoRespondeu
FROM
    respostasquestoes AS rq
LEFT JOIN
    respostas AS r ON rq.RespostaId = r.Id
LEFT JOIN
    participantes AS p ON r.ParticipanteId = p.Id
LEFT JOIN
    questoes AS q ON rq.QuestaoId = q.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
ORDER BY
    r.DataResposta DESC, p.Nome;

-- 3. Verificar se existem dados na tabela itensavaliadosquestionarios
SELECT 'Verificando dados na tabela itensavaliadosquestionarios' AS Status;
SELECT COUNT(*) AS TotalItens FROM itensavaliadosquestionarios;
SELECT * FROM itensavaliadosquestionarios LIMIT 10;
