-- SQL alternativo - buscar informações da tabela respostas
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- Consulta usando dados da tabela respostas (que pode ter as informações)
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

-- Verificar se a tabela respostas tem as informações
SELECT 'Verificando dados na tabela respostas' AS Status;
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

-- Consulta simples para ver todos os dados
SELECT 'Dados completos da tabela respostas' AS Status;
SELECT * FROM respostas ORDER BY DataResposta DESC LIMIT 5;
