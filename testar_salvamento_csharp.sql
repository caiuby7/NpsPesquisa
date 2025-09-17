-- Script para testar se os campos desnormalizados estão sendo salvos corretamente
-- Execute este script após responder um questionário para verificar os dados

-- 1. Verificar as últimas respostas criadas
SELECT 
    r.Id as RespostaId,
    r.DataResposta,
    r.TipoItemAvaliado,
    r.NomeItemAvaliado,
    p.Nome as ParticipanteNome,
    p.Tipo as ParticipanteTipo,
    p.CursoId as ParticipanteCursoId
FROM respostas r
INNER JOIN participantes p ON r.ParticipanteId = p.Id
ORDER BY r.DataResposta DESC
LIMIT 5;

-- 2. Verificar as respostas de questões com campos desnormalizados
SELECT 
    rq.Id as RespostaQuestaoId,
    rq.RespostaId,
    rq.QuestaoId,
    rq.ItemAvaliadoId,
    rq.CursoId,
    rq.TurmaId,
    rq.DisciplinaId,
    rq.ProfessorId,
    rq.InstituicaoId,
    r.TipoItemAvaliado,
    r.NomeItemAvaliado,
    p.Nome as ParticipanteNome,
    p.Tipo as ParticipanteTipo,
    p.CursoId as ParticipanteCursoId
FROM respostasquestoes rq
INNER JOIN respostas r ON rq.RespostaId = r.Id
INNER JOIN participantes p ON r.ParticipanteId = p.Id
ORDER BY r.DataResposta DESC
LIMIT 10;

-- 3. Verificar se há respostas com campos NULL que deveriam ter valores
SELECT 
    COUNT(*) as TotalRespostas,
    COUNT(CursoId) as ComCursoId,
    COUNT(TurmaId) as ComTurmaId,
    COUNT(DisciplinaId) as ComDisciplinaId,
    COUNT(ProfessorId) as ComProfessorId,
    COUNT(InstituicaoId) as ComInstituicaoId
FROM respostasquestoes;

-- 4. Verificar participantes e seus dados
SELECT 
    p.Id,
    p.Nome,
    p.Tipo,
    p.CursoId,
    p.AlunoId,
    p.ProfessorId,
    p.CoordenadorId,
    a.CursoId as AlunoCursoId,
    a.TurmaId as AlunoTurmaId
FROM participantes p
LEFT JOIN alunos a ON p.AlunoId = a.AlunoId
WHERE p.Tipo = 'Aluno'
ORDER BY p.Id DESC
LIMIT 5;

-- 5. Verificar se há dados nas tabelas relacionadas
SELECT 'Cursos' as Tabela, COUNT(*) as Total FROM cursos
UNION ALL
SELECT 'Turmas', COUNT(*) FROM turmas
UNION ALL
SELECT 'Disciplinas', COUNT(*) FROM disciplinas
UNION ALL
SELECT 'Professores', COUNT(*) FROM professores
UNION ALL
SELECT 'Instituicoes', COUNT(*) FROM instituicoes;
