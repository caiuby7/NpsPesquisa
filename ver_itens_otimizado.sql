-- SQL OTIMIZADO para ver quem respondeu o quê
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- Versão otimizada com índices e consultas mais eficientes
-- 1. Primeiro, vamos verificar se existem índices nas tabelas principais
SELECT 'Verificando índices nas tabelas principais' AS Status;

-- Verificar índices na tabela respostasquestoes
SHOW INDEX FROM respostasquestoes;

-- Verificar índices na tabela respostas
SHOW INDEX FROM respostas;

-- Verificar índices na tabela questionarios
SHOW INDEX FROM questionarios;

-- 2. Consulta otimizada - usando apenas os campos necessários
SELECT
    p.Nome AS QuemRespondeu,
    CASE p.Tipo
        WHEN 0 THEN 'Aluno'
        WHEN 1 THEN 'Professor'
        WHEN 2 THEN 'Coordenador'
        WHEN 3 THEN 'Diretor'
        ELSE 'Outro'
    END AS TipoParticipante,
    q.Texto AS Questao,
    rq.Valor AS Resposta,
    CASE qu.TipoItemAvaliado
        WHEN 0 THEN 'Curso'
        WHEN 1 THEN 'Turma'
        WHEN 2 THEN 'Disciplina'
        WHEN 3 THEN 'Professor'
        WHEN 4 THEN 'Instituição'
        ELSE 'Outro'
    END AS TipoItemAvaliado,
    CASE 
        WHEN qu.TipoItemAvaliado = 1 THEN 
            CONCAT('Turma: ', COALESCE(t.Nome, 'N/A'), ' - Disciplina: ', COALESCE(d.Nome, 'N/A'))
        ELSE r.NomeItemEspecifico
    END AS NomeItemAvaliado,
    rq.ItemAvaliadoId,
    r.DataResposta AS QuandoRespondeu
FROM respostasquestoes rq
INNER JOIN respostas r ON rq.RespostaId = r.Id
INNER JOIN participantes p ON r.ParticipanteId = p.Id
INNER JOIN questoes q ON rq.QuestaoId = q.Id
INNER JOIN questionarios qu ON r.QuestionarioId = qu.Id
LEFT JOIN turmasdisciplinas td ON (qu.TipoItemAvaliado = 1 AND rq.ItemAvaliadoId = td.Id)
LEFT JOIN turmas t ON td.TurmaId = t.Id
LEFT JOIN disciplinas d ON td.DisciplinaId = d.Id
WHERE rq.ItemAvaliadoId IS NOT NULL
ORDER BY r.DataResposta DESC, p.Nome
LIMIT 100; -- Limitar para teste

-- 3. Consulta resumida para estatísticas (mais rápida)
SELECT 'Resumo por tipo de participante e item avaliado' AS Status;
SELECT
    CASE p.Tipo
        WHEN 0 THEN 'Aluno'
        WHEN 1 THEN 'Professor'
        WHEN 2 THEN 'Coordenador'
        WHEN 3 THEN 'Diretor'
        ELSE 'Outro'
    END AS TipoParticipante,
    CASE qu.TipoItemAvaliado
        WHEN 0 THEN 'Curso'
        WHEN 1 THEN 'Turma'
        WHEN 2 THEN 'Disciplina'
        WHEN 3 THEN 'Professor'
        WHEN 4 THEN 'Instituição'
        ELSE 'Outro'
    END AS TipoItemAvaliado,
    COUNT(*) AS TotalRespostas
FROM respostasquestoes rq
INNER JOIN respostas r ON rq.RespostaId = r.Id
INNER JOIN participantes p ON r.ParticipanteId = p.Id
INNER JOIN questionarios qu ON r.QuestionarioId = qu.Id
WHERE rq.ItemAvaliadoId IS NOT NULL
GROUP BY p.Tipo, qu.TipoItemAvaliado
ORDER BY p.Tipo, qu.TipoItemAvaliado;

-- 4. Sugestões de índices para melhorar performance
SELECT 'Sugestões de índices para melhorar performance' AS Status;
SELECT 'CREATE INDEX idx_respostasquestoes_itemavaliadoid ON respostasquestoes(ItemAvaliadoId);' AS Sugestao1;
SELECT 'CREATE INDEX idx_respostas_questionarioid ON respostas(QuestionarioId);' AS Sugestao2;
SELECT 'CREATE INDEX idx_respostas_participanteid ON respostas(ParticipanteId);' AS Sugestao3;
SELECT 'CREATE INDEX idx_respostas_datresposta ON respostas(DataResposta);' AS Sugestao4;
SELECT 'CREATE INDEX idx_questionarios_tipoitemavaliado ON questionarios(TipoItemAvaliado);' AS Sugestao5;
