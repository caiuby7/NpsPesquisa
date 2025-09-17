-- SQL para ver quem respondeu o quê usando TipoItemAvaliado do questionário
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- Consulta principal mostrando:
-- - Quem respondeu (participante)
-- - Tipo do participante (Aluno, Professor, etc.)
-- - Questão respondida
-- - Resposta dada
-- - Tipo do item avaliado (do questionário)
-- - Nome do item específico
-- - Quando respondeu

SELECT
    p.Nome AS QuemRespondeu,
    CASE 
        WHEN p.Tipo = 0 THEN 'Aluno'
        WHEN p.Tipo = 1 THEN 'Professor'
        WHEN p.Tipo = 2 THEN 'Coordenador'
        WHEN p.Tipo = 3 THEN 'Diretor'
        ELSE 'Outro'
    END AS TipoParticipante,
    q.Texto AS Questao,
    rq.Valor AS Resposta,
    CASE 
        WHEN qu.TipoItemAvaliado = 0 THEN 'Curso'
        WHEN qu.TipoItemAvaliado = 1 THEN 'Turma'
        WHEN qu.TipoItemAvaliado = 2 THEN 'Disciplina'
        WHEN qu.TipoItemAvaliado = 3 THEN 'Professor'
        WHEN qu.TipoItemAvaliado = 4 THEN 'Instituição'
        ELSE 'Outro'
    END AS TipoItemAvaliado,
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
LEFT JOIN
    questionarios AS qu ON r.QuestionarioId = qu.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
ORDER BY
    r.DataResposta DESC, p.Nome;

-- Consulta resumida por tipo de participante e item avaliado
SELECT 'Resumo por tipo de participante e item avaliado' AS Status;
SELECT
    CASE 
        WHEN p.Tipo = 0 THEN 'Aluno'
        WHEN p.Tipo = 1 THEN 'Professor'
        WHEN p.Tipo = 2 THEN 'Coordenador'
        WHEN p.Tipo = 3 THEN 'Diretor'
        ELSE 'Outro'
    END AS TipoParticipante,
    CASE 
        WHEN qu.TipoItemAvaliado = 0 THEN 'Curso'
        WHEN qu.TipoItemAvaliado = 1 THEN 'Turma'
        WHEN qu.TipoItemAvaliado = 2 THEN 'Disciplina'
        WHEN qu.TipoItemAvaliado = 3 THEN 'Professor'
        WHEN qu.TipoItemAvaliado = 4 THEN 'Instituição'
        ELSE 'Outro'
    END AS TipoItemAvaliado,
    COUNT(*) AS TotalRespostas
FROM
    respostasquestoes AS rq
LEFT JOIN
    respostas AS r ON rq.RespostaId = r.Id
LEFT JOIN
    participantes AS p ON r.ParticipanteId = p.Id
LEFT JOIN
    questionarios AS qu ON r.QuestionarioId = qu.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
GROUP BY
    p.Tipo, qu.TipoItemAvaliado
ORDER BY
    p.Tipo, qu.TipoItemAvaliado;

-- Verificar se o questionário tem TipoItemAvaliado
SELECT 'Verificando TipoItemAvaliado nos questionários' AS Status;
SELECT 
    Id,
    Titulo,
    TipoItemAvaliado,
    CASE 
        WHEN TipoItemAvaliado = 0 THEN 'Curso'
        WHEN TipoItemAvaliado = 1 THEN 'Turma'
        WHEN TipoItemAvaliado = 2 THEN 'Disciplina'
        WHEN TipoItemAvaliado = 3 THEN 'Professor'
        WHEN TipoItemAvaliado = 4 THEN 'Instituição'
        ELSE 'Outro'
    END AS TipoItemAvaliadoDescricao
FROM questionarios
ORDER BY Id;
