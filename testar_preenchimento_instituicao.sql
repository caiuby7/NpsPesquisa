-- =====================================================
-- TESTE: PREENCHIMENTO DE INSTITUICAO
-- =====================================================
-- Este script testa especificamente o preenchimento da InstituicaoId

USE ava_inst;

-- =====================================================
-- 1. VERIFICAR DADOS DE ENTRADA
-- =====================================================

-- Verificar se temos participantes com CursoId
SELECT 
    'Participantes com CursoId' as Descricao,
    COUNT(*) as Total
FROM participantes 
WHERE CursoId IS NOT NULL
UNION ALL
SELECT 
    'Participantes sem CursoId' as Descricao,
    COUNT(*) as Total
FROM participantes 
WHERE CursoId IS NULL;

-- Verificar se os cursos têm InstituicaoId
SELECT 
    'Cursos com InstituicaoId' as Descricao,
    COUNT(*) as Total
FROM cursos 
WHERE InstituicaoId IS NOT NULL
UNION ALL
SELECT 
    'Cursos sem InstituicaoId' as Descricao,
    COUNT(*) as Total
FROM cursos 
WHERE InstituicaoId IS NULL;

-- =====================================================
-- 2. TESTAR LÓGICA ESPECÍFICA PARA ALUNOS
-- =====================================================

-- Simular a lógica: Aluno -> Curso -> Instituicao
SELECT 
    p.Id as ParticipanteId,
    p.Nome as Participante,
    p.CursoId as ParticipanteCursoId,
    c.Id as CursoId,
    c.Nome as Curso,
    c.InstituicaoId as CursoInstituicaoId,
    i.Id as InstituicaoId,
    i.Nome as Instituicao
FROM participantes p
LEFT JOIN cursos c ON p.CursoId = c.Id
LEFT JOIN instituicoes i ON c.InstituicaoId = i.Id
WHERE p.Tipo = 'Aluno'
    AND p.CursoId IS NOT NULL
ORDER BY p.Id
LIMIT 10;

-- =====================================================
-- 3. VERIFICAR RESPOSTASQUESTOES ATUAIS
-- =====================================================

-- Verificar respostasquestoes que deveriam ter InstituicaoId
SELECT 
    rq.Id as RespostaQuestaoId,
    p.Nome as Participante,
    p.Tipo,
    p.CursoId as ParticipanteCursoId,
    rq.CursoId as RespostaCursoId,
    c.Nome as Curso,
    c.InstituicaoId as CursoInstituicaoId,
    rq.InstituicaoId as RespostaInstituicaoId,
    i.Nome as InstituicaoResposta
FROM respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN participantes p ON r.ParticipanteId = p.Id
LEFT JOIN cursos c ON rq.CursoId = c.Id
LEFT JOIN instituicoes i ON rq.InstituicaoId = i.Id
WHERE p.Tipo = 'Aluno'
    AND p.CursoId IS NOT NULL
ORDER BY rq.Id
LIMIT 10;

-- =====================================================
-- 4. IDENTIFICAR PROBLEMAS
-- =====================================================

-- Casos onde deveria ter InstituicaoId mas não tem
SELECT 
    'PROBLEMA: Deveria ter InstituicaoId mas não tem' as Problema,
    rq.Id as RespostaQuestaoId,
    p.Nome as Participante,
    p.CursoId as ParticipanteCursoId,
    c.InstituicaoId as CursoInstituicaoId,
    rq.InstituicaoId as RespostaInstituicaoId
FROM respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN participantes p ON r.ParticipanteId = p.Id
LEFT JOIN cursos c ON p.CursoId = c.Id
WHERE p.Tipo = 'Aluno'
    AND p.CursoId IS NOT NULL
    AND c.InstituicaoId IS NOT NULL
    AND rq.InstituicaoId IS NULL;

-- =====================================================
-- 5. CORREÇÃO MANUAL (TESTE)
-- =====================================================

-- Atualizar InstituicaoId baseado no CursoId do participante
-- (Execute apenas se quiser testar a correção)
/*
UPDATE respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN participantes p ON r.ParticipanteId = p.Id
JOIN cursos c ON p.CursoId = c.Id
SET rq.InstituicaoId = c.InstituicaoId
WHERE rq.InstituicaoId IS NULL 
    AND p.Tipo = 'Aluno' 
    AND p.CursoId IS NOT NULL
    AND c.InstituicaoId IS NOT NULL;

-- Verificar se a correção funcionou
SELECT 
    'APÓS CORREÇÃO' as Status,
    COUNT(*) as TotalAtualizado
FROM respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN participantes p ON r.ParticipanteId = p.Id
WHERE p.Tipo = 'Aluno' 
    AND rq.InstituicaoId IS NOT NULL;
*/

-- =====================================================
-- 6. VERIFICAR SE O PROBLEMA É NO CÓDIGO C#
-- =====================================================

-- Verificar se o problema pode estar na ordem de execução
-- (CursoId precisa ser preenchido antes de InstituicaoId)
SELECT 
    'RespostaQuestoes com CursoId mas sem InstituicaoId' as Problema,
    COUNT(*) as Total
FROM respostasquestoes rq
WHERE rq.CursoId IS NOT NULL 
    AND rq.InstituicaoId IS NULL;

-- =====================================================
-- FIM DO TESTE
-- =====================================================
