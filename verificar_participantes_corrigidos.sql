-- Script para verificar se os participantes foram salvos corretamente
-- após a correção do bug de IDs

-- 1. Verificar participantes criados recentemente
SELECT 
    p.Id as ParticipanteId,
    p.Nome,
    p.Email,
    p.Tipo,
    p.ProfessorId,
    p.AlunoId,
    p.CoordenadorId,
    p.DataCadastro
FROM participantes p
WHERE p.DataCadastro >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY p.DataCadastro DESC;

-- 2. Verificar associações com questionários
SELECT 
    pq.Id as AssociacaoId,
    pq.QuestionarioId,
    pq.ParticipanteId,
    pq.Status,
    p.Nome as NomeParticipante,
    p.Tipo as TipoParticipante,
    p.ProfessorId,
    p.AlunoId,
    p.CoordenadorId
FROM participantesquestionarios pq
JOIN participantes p ON pq.ParticipanteId = p.Id
WHERE pq.QuestionarioId = 7 -- Substitua pelo ID da avaliação
ORDER BY pq.Id DESC;

-- 3. Verificar se há duplicatas de participantes
SELECT 
    p.ProfessorId,
    p.AlunoId,
    p.CoordenadorId,
    COUNT(*) as Quantidade
FROM participantes p
WHERE p.ProfessorId IS NOT NULL 
   OR p.AlunoId IS NOT NULL 
   OR p.CoordenadorId IS NOT NULL
GROUP BY p.ProfessorId, p.AlunoId, p.CoordenadorId
HAVING COUNT(*) > 1;

-- 4. Verificar professores na tabela original
SELECT 
    pr.Id as ProfessorId,
    pr.Nome as NomeProfessor,
    pr.Email as EmailProfessor
FROM professores pr
WHERE pr.Id IN (2, 3, 4, 5) -- IDs dos professores que você adicionou
ORDER BY pr.Id;

-- 5. Verificar se os participantes foram associados corretamente
SELECT 
    p.Id as ParticipanteId,
    p.Nome as NomeParticipante,
    p.Tipo as TipoParticipante,
    p.ProfessorId,
    pr.Nome as NomeProfessorOriginal,
    pr.Email as EmailProfessorOriginal
FROM participantes p
LEFT JOIN professores pr ON p.ProfessorId = pr.Id
WHERE p.ProfessorId IS NOT NULL
ORDER BY p.Id DESC;
