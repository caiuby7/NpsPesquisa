-- SQL para ver quem respondeu o quê com informações corretas
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- Consulta principal mostrando:
-- - Quem respondeu (participante)
-- - Tipo do participante (Aluno, Professor, etc.)
-- - Questão respondida
-- - Resposta dada
-- - Tipo do item avaliado (Curso, Turma, Disciplina, etc.)
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
        WHEN r.TipoItemAvaliado = 0 THEN 'Curso'
        WHEN r.TipoItemAvaliado = 1 THEN 'Turma'
        WHEN r.TipoItemAvaliado = 2 THEN 'Disciplina'
        WHEN r.TipoItemAvaliado = 3 THEN 'Professor'
        WHEN r.TipoItemAvaliado = 4 THEN 'Instituição'
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
        WHEN r.TipoItemAvaliado = 0 THEN 'Curso'
        WHEN r.TipoItemAvaliado = 1 THEN 'Turma'
        WHEN r.TipoItemAvaliado = 2 THEN 'Disciplina'
        WHEN r.TipoItemAvaliado = 3 THEN 'Professor'
        WHEN r.TipoItemAvaliado = 4 THEN 'Instituição'
        ELSE 'Outro'
    END AS TipoItemAvaliado,
    COUNT(*) AS TotalRespostas
FROM
    respostasquestoes AS rq
LEFT JOIN
    respostas AS r ON rq.RespostaId = r.Id
LEFT JOIN
    participantes AS p ON r.ParticipanteId = p.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
GROUP BY
    p.Tipo, r.TipoItemAvaliado
ORDER BY
    p.Tipo, r.TipoItemAvaliado;
