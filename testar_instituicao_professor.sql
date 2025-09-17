-- =====================================================
-- TESTE: INSTITUICAO E PROFESSOR
-- =====================================================
-- Este script testa se InstituicaoId e ProfessorId estão sendo preenchidos

USE ava_inst;

-- =====================================================
-- 1. VERIFICAR DADOS DE ENTRADA
-- =====================================================

-- Verificar se existem cursos com InstituicaoId
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

-- Mostrar alguns cursos e suas instituições
SELECT 
    c.Id as CursoId,
    c.Nome as Curso,
    c.InstituicaoId,
    i.Nome as Instituicao
FROM cursos c
LEFT JOIN instituicoes i ON c.InstituicaoId = i.Id
ORDER BY c.Id
LIMIT 10;

-- =====================================================
-- 2. VERIFICAR PARTICIPANTES
-- =====================================================

-- Verificar participantes do tipo Aluno e seus cursos
SELECT 
    p.Id as ParticipanteId,
    p.Nome as Participante,
    p.Tipo,
    p.CursoId,
    c.Nome as Curso,
    c.InstituicaoId,
    i.Nome as Instituicao
FROM participantes p
LEFT JOIN cursos c ON p.CursoId = c.Id
LEFT JOIN instituicoes i ON c.InstituicaoId = i.Id
WHERE p.Tipo = 'Aluno'
ORDER BY p.Id
LIMIT 10;

-- =====================================================
-- 3. VERIFICAR RESPOSTASQUESTOES ATUAIS
-- =====================================================

-- Verificar respostasquestoes e seus campos desnormalizados
SELECT 
    rq.Id as RespostaQuestaoId,
    rq.QuestaoId,
    rq.Valor,
    p.Nome as Participante,
    p.Tipo as TipoParticipante,
    rq.CursoId,
    c.Nome as Curso,
    c.InstituicaoId as CursoInstituicaoId,
    rq.InstituicaoId as RespostaInstituicaoId,
    i.Nome as InstituicaoResposta,
    rq.ProfessorId,
    prof.Nome as ProfessorNome
FROM respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN participantes p ON r.ParticipanteId = p.Id
LEFT JOIN cursos c ON rq.CursoId = c.Id
LEFT JOIN instituicoes i ON rq.InstituicaoId = i.Id
LEFT JOIN professores prof ON rq.ProfessorId = prof.Id
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
    'APÓS CORREÇÃO - InstituicaoId' as Status,
    COUNT(*) as TotalAtualizado
FROM respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN participantes p ON r.ParticipanteId = p.Id
WHERE p.Tipo = 'Aluno' 
    AND rq.InstituicaoId IS NOT NULL;

-- =====================================================
-- 6. VERIFICAR RESULTADO FINAL
-- =====================================================

-- Verificar respostasquestoes após correção
SELECT 
    rq.Id as RespostaQuestaoId,
    rq.QuestaoId,
    rq.Valor,
    p.Nome as Participante,
    p.Tipo as TipoParticipante,
    rq.CursoId,
    c.Nome as Curso,
    c.InstituicaoId as CursoInstituicaoId,
    rq.InstituicaoId as RespostaInstituicaoId,
    i.Nome as InstituicaoResposta,
    rq.ProfessorId,
    prof.Nome as ProfessorNome
FROM respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN participantes p ON r.ParticipanteId = p.Id
LEFT JOIN cursos c ON rq.CursoId = c.Id
LEFT JOIN instituicoes i ON rq.InstituicaoId = i.Id
LEFT JOIN professores prof ON rq.ProfessorId = prof.Id
WHERE p.Tipo = 'Aluno'
ORDER BY rq.Id
LIMIT 10;

-- =====================================================
-- FIM DO TESTE
-- =====================================================
