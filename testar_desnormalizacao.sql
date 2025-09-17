-- Script para testar se a desnormalização está funcionando
-- Execute após fazer uma nova resposta no sistema

USE ava_inst;

-- 1. Verificar se as colunas existem
SELECT 'Verificando colunas desnormalizadas' AS Status;

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ava_inst' 
  AND TABLE_NAME = 'respostas'
  AND COLUMN_NAME IN ('CursoId', 'TurmaId', 'DisciplinaId', 'ProfessorId', 'InstituicaoId')
ORDER BY COLUMN_NAME;

-- 2. Verificar respostas recentes com campos desnormalizados
SELECT 'Respostas com campos desnormalizados' AS Status;

SELECT 
    r.Id,
    r.DataResposta,
    r.TipoItemAvaliado,
    r.CursoId,
    r.TurmaId,
    r.DisciplinaId,
    r.ProfessorId,
    r.InstituicaoId,
    p.Nome AS Participante,
    q.Titulo AS Questionario
FROM respostas r
LEFT JOIN participantes p ON r.ParticipanteId = p.Id
LEFT JOIN questionarios q ON r.QuestionarioId = q.Id
WHERE r.DataResposta >= DATE_SUB(NOW(), INTERVAL 1 HOUR)  -- Última hora
ORDER BY r.DataResposta DESC
LIMIT 10;

-- 3. Verificar se os índices foram criados
SELECT 'Verificando índices' AS Status;

SELECT 
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'ava_inst' 
  AND TABLE_NAME = 'respostas'
  AND COLUMN_NAME IN ('CursoId', 'TurmaId', 'DisciplinaId', 'ProfessorId', 'InstituicaoId', 'TipoItemAvaliado')
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- 4. Exemplo de consulta otimizada (se houver dados)
SELECT 'Exemplo de consulta otimizada' AS Status;

SELECT 
    p.Nome AS QuemRespondeu,
    c.Nome AS Curso,
    t.Nome AS Turma,
    d.Nome AS Disciplina,
    prof.Nome AS Professor,
    i.Nome AS Instituicao,
    r.DataResposta,
    r.TipoItemAvaliado
FROM respostas r
LEFT JOIN participantes p ON r.ParticipanteId = p.Id
LEFT JOIN cursos c ON r.CursoId = c.Id
LEFT JOIN turmas t ON r.TurmaId = t.Id
LEFT JOIN disciplinas d ON r.DisciplinaId = d.Id
LEFT JOIN professores prof ON r.ProfessorId = prof.Id
LEFT JOIN instituicoes i ON r.InstituicaoId = i.Id
WHERE r.CursoId IS NOT NULL 
   OR r.TurmaId IS NOT NULL 
   OR r.DisciplinaId IS NOT NULL 
   OR r.ProfessorId IS NOT NULL 
   OR r.InstituicaoId IS NOT NULL
ORDER BY r.DataResposta DESC
LIMIT 5;

-- 5. Contar respostas por tipo de item avaliado
SELECT 'Respostas por tipo de item avaliado' AS Status;

SELECT 
    CASE 
        WHEN r.TipoItemAvaliado = 0 THEN 'Curso'
        WHEN r.TipoItemAvaliado = 1 THEN 'Turma'
        WHEN r.TipoItemAvaliado = 2 THEN 'Disciplina'
        WHEN r.TipoItemAvaliado = 3 THEN 'Professor'
        WHEN r.TipoItemAvaliado = 4 THEN 'Coordenador'
        WHEN r.TipoItemAvaliado = 6 THEN 'Estrutura'
        WHEN r.TipoItemAvaliado = 7 THEN 'Estágio'
        WHEN r.TipoItemAvaliado = 8 THEN 'Projeto Extensionista'
        WHEN r.TipoItemAvaliado = 9 THEN 'Alunos'
        WHEN r.TipoItemAvaliado = 10 THEN 'TurmaDisciplina'
        WHEN r.TipoItemAvaliado = 11 THEN 'Infraestrutura'
        ELSE 'Outro'
    END AS TipoItemAvaliado,
    COUNT(*) AS TotalRespostas,
    COUNT(r.CursoId) AS ComCursoId,
    COUNT(r.TurmaId) AS ComTurmaId,
    COUNT(r.DisciplinaId) AS ComDisciplinaId,
    COUNT(r.ProfessorId) AS ComProfessorId,
    COUNT(r.InstituicaoId) AS ComInstituicaoId
FROM respostas r
WHERE r.TipoItemAvaliado IS NOT NULL
GROUP BY r.TipoItemAvaliado
ORDER BY TotalRespostas DESC;
