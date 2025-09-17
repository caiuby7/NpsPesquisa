-- Script simples para verificar se os campos desnormalizados estão sendo salvos
-- Execute este script no banco de dados

-- 1. Verificar as últimas respostas
SELECT 
    r.Id as RespostaId,
    r.DataResposta,
    r.TipoItemAvaliado,
    p.Nome as ParticipanteNome,
    p.Tipo as ParticipanteTipo,
    p.CursoId as ParticipanteCursoId
FROM respostas r
INNER JOIN participantes p ON r.ParticipanteId = p.Id
ORDER BY r.DataResposta DESC
LIMIT 3;

-- 2. Verificar as respostas de questões com campos desnormalizados
SELECT 
    rq.Id as RespostaQuestaoId,
    rq.RespostaId,
    rq.QuestaoId,
    rq.CursoId,
    rq.TurmaId,
    rq.DisciplinaId,
    rq.ProfessorId,
    rq.InstituicaoId,
    r.TipoItemAvaliado,
    p.Nome as ParticipanteNome,
    p.Tipo as ParticipanteTipo,
    p.CursoId as ParticipanteCursoId
FROM respostasquestoes rq
INNER JOIN respostas r ON rq.RespostaId = r.Id
INNER JOIN participantes p ON r.ParticipanteId = p.Id
ORDER BY r.DataResposta DESC
LIMIT 5;

-- 3. Contar quantas respostas têm campos preenchidos
SELECT 
    COUNT(*) as TotalRespostas,
    COUNT(CursoId) as ComCursoId,
    COUNT(TurmaId) as ComTurmaId,
    COUNT(DisciplinaId) as ComDisciplinaId,
    COUNT(ProfessorId) as ComProfessorId,
    COUNT(InstituicaoId) as ComInstituicaoId
FROM respostasquestoes;
