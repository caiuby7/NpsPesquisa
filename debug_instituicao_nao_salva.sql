-- =====================================================
-- DEBUG: POR QUE INSTITUICAO NÃO ESTÁ SENDO SALVA?
-- =====================================================
-- Este script ajuda a identificar por que a InstituicaoId não está sendo preenchida

USE ava_inst;

-- =====================================================
-- 1. VERIFICAR DADOS EXISTENTES
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
-- 2. VERIFICAR PARTICIPANTES E SEUS CURSOS
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
    i.Nome as InstituicaoResposta
FROM respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN participantes p ON r.ParticipanteId = p.Id
LEFT JOIN cursos c ON rq.CursoId = c.Id
LEFT JOIN instituicoes i ON rq.InstituicaoId = i.Id
ORDER BY rq.Id
LIMIT 10;

-- =====================================================
-- 4. TESTAR LÓGICA DE PREENCHIMENTO
-- =====================================================

-- Simular a lógica de preenchimento para um participante específico
-- (Substitua o ID do participante pelo que você quer testar)
SET @participante_id = 1; -- ALTERE AQUI

SELECT 
    'DADOS DO PARTICIPANTE' as Secao,
    p.Id as ParticipanteId,
    p.Nome as Participante,
    p.Tipo,
    p.CursoId,
    c.Nome as Curso,
    c.InstituicaoId as CursoInstituicaoId,
    i.Nome as InstituicaoNome
FROM participantes p
LEFT JOIN cursos c ON p.CursoId = c.Id
LEFT JOIN instituicoes i ON c.InstituicaoId = i.Id
WHERE p.Id = @participante_id;

-- =====================================================
-- 5. VERIFICAR SE HÁ PROBLEMAS NA MIGRAÇÃO
-- =====================================================

-- Verificar se as colunas foram criadas corretamente
DESCRIBE respostasquestoes;

-- Verificar se há dados nas colunas desnormalizadas
SELECT 
    'Total RespostaQuestoes' as Descricao,
    COUNT(*) as Total
FROM respostasquestoes
UNION ALL
SELECT 
    'Com CursoId' as Descricao,
    COUNT(*) as Total
FROM respostasquestoes 
WHERE CursoId IS NOT NULL
UNION ALL
SELECT 
    'Com InstituicaoId' as Descricao,
    COUNT(*) as Total
FROM respostasquestoes 
WHERE InstituicaoId IS NOT NULL;

-- =====================================================
-- 6. TESTAR UPDATE MANUAL
-- =====================================================

-- Testar se conseguimos atualizar manualmente uma InstituicaoId
-- (Execute apenas se quiser testar)
/*
UPDATE respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN participantes p ON r.ParticipanteId = p.Id
JOIN cursos c ON p.CursoId = c.Id
SET rq.InstituicaoId = c.InstituicaoId
WHERE rq.InstituicaoId IS NULL 
    AND p.Tipo = 'Aluno' 
    AND c.InstituicaoId IS NOT NULL
LIMIT 5;

-- Verificar se funcionou
SELECT 
    rq.Id,
    rq.InstituicaoId,
    c.InstituicaoId as CursoInstituicaoId
FROM respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN participantes p ON r.ParticipanteId = p.Id
JOIN cursos c ON p.CursoId = c.Id
WHERE rq.InstituicaoId IS NOT NULL
LIMIT 5;
*/

-- =====================================================
-- FIM DO DEBUG
-- =====================================================
