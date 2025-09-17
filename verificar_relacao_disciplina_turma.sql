-- Script para verificar a relação entre disciplina e turma
-- Execute este script para verificar se os dados estão corretos

-- 1. Verificar as TurmaDisciplinas e suas relações
SELECT 
    td.Id as TurmaDisciplinaId,
    td.TurmaId,
    td.DisciplinaId,
    td.ProfessorId,
    t.Nome as TurmaNome,
    d.Nome as DisciplinaNome,
    p.Nome as ProfessorNome
FROM turmasdisciplinas td
LEFT JOIN turmas t ON td.TurmaId = t.Id
LEFT JOIN disciplinas d ON td.DisciplinaId = d.Id
LEFT JOIN professores p ON td.ProfessorId = p.Id
ORDER BY td.Id;

-- 2. Verificar especificamente a TurmaDisciplina ID 2
SELECT 
    td.Id as TurmaDisciplinaId,
    td.TurmaId,
    td.DisciplinaId,
    td.ProfessorId,
    t.Nome as TurmaNome,
    d.Nome as DisciplinaNome,
    p.Nome as ProfessorNome
FROM turmasdisciplinas td
LEFT JOIN turmas t ON td.TurmaId = t.Id
LEFT JOIN disciplinas d ON td.DisciplinaId = d.Id
LEFT JOIN professores p ON td.ProfessorId = p.Id
WHERE td.Id = 2;

-- 3. Verificar as últimas respostas para ver o que está sendo salvo
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
    r.NomeItemAvaliado
FROM respostasquestoes rq
INNER JOIN respostas r ON rq.RespostaId = r.Id
ORDER BY rq.Id DESC
LIMIT 10;
