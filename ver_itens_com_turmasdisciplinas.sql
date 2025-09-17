-- SQL para ver quem respondeu o quê com lógica para Turma/Disciplina
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- Consulta principal mostrando:
-- - Quem respondeu (participante)
-- - Tipo do participante (Aluno, Professor, etc.)
-- - Questão respondida
-- - Resposta dada
-- - Tipo do item avaliado (do questionário)
-- - Nome do item específico (com lógica para Turma/Disciplina)
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
    CASE 
        WHEN qu.TipoItemAvaliado = 1 THEN 
            -- Se for Turma, buscar da tabela turmasdisciplinas
            CONCAT('Turma: ', COALESCE(t.Nome, 'N/A'), ' - Disciplina: ', COALESCE(d.Nome, 'N/A'))
        ELSE 
            -- Para outros tipos, usar o nome do item específico
            r.NomeItemEspecifico
    END AS NomeItemAvaliado,
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
LEFT JOIN
    turmasdisciplinas AS td ON (qu.TipoItemAvaliado = 1 AND r.ItemAvaliadoId = td.Id)
LEFT JOIN
    turmas AS t ON td.TurmaId = t.Id
LEFT JOIN
    disciplinas AS d ON td.DisciplinaId = d.Id
WHERE
    rq.ItemAvaliadoId IS NOT NULL
ORDER BY
    r.DataResposta DESC, p.Nome;

-- Verificar a estrutura da tabela turmasdisciplinas
SELECT 'Estrutura da tabela turmasdisciplinas' AS Status;
DESCRIBE turmasdisciplinas;

-- Verificar dados na tabela turmasdisciplinas
SELECT 'Dados na tabela turmasdisciplinas' AS Status;
SELECT * FROM turmasdisciplinas LIMIT 10;

-- Verificar turmas e disciplinas
SELECT 'Turmas disponíveis' AS Status;
SELECT Id, Nome FROM turmas LIMIT 10;

SELECT 'Disciplinas disponíveis' AS Status;
SELECT Id, Nome FROM disciplinas LIMIT 10;

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
