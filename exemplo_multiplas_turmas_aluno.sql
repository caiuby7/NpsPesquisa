-- =====================================================
-- EXEMPLO: ALUNO EM MÚLTIPLAS TURMAS/DISCIPLINAS
-- =====================================================
-- Este script mostra como um aluno pode estar em várias turmas/disciplinas
-- e como isso afeta o preenchimento dos campos desnormalizados

USE ava_inst;

-- =====================================================
-- 1. VERIFICAR ALUNOS EM MÚLTIPLAS TURMAS
-- =====================================================

-- Alunos que estão em mais de uma turma/disciplina
SELECT 
    a.AlunoId,
    a.Nome as NomeAluno,
    a.Matricula,
    c.Nome as Curso,
    COUNT(DISTINCT td.TurmaId) as TotalTurmas,
    COUNT(DISTINCT td.DisciplinaId) as TotalDisciplinas,
    GROUP_CONCAT(DISTINCT t.Nome ORDER BY t.Nome SEPARATOR ', ') as Turmas,
    GROUP_CONCAT(DISTINCT d.Nome ORDER BY d.Nome SEPARATOR ', ') as Disciplinas
FROM alunos a
JOIN cursos c ON a.CursoId = c.Id
JOIN alunoturmasdisciplinas atd ON a.AlunoId = atd.AlunoId
JOIN turmasdisciplinas td ON atd.TurmaDisciplinaId = td.Id
JOIN turmas t ON td.TurmaId = t.Id
JOIN disciplinas d ON td.DisciplinaId = d.Id
GROUP BY a.AlunoId, a.Nome, a.Matricula, c.Nome
HAVING COUNT(DISTINCT td.TurmaId) > 1 OR COUNT(DISTINCT td.DisciplinaId) > 1
ORDER BY TotalTurmas DESC, TotalDisciplinas DESC;

-- =====================================================
-- 2. EXEMPLO DE RESPOSTA DE ALUNO EM MÚLTIPLAS TURMAS
-- =====================================================

-- Simular uma resposta de um aluno que está em múltiplas turmas
-- (Este é apenas um exemplo conceitual)

-- Cenário: Aluno responde questionário sobre "Curso"
-- Mas o aluno está em 3 turmas diferentes com disciplinas diferentes

-- Dados do aluno (exemplo)
-- AlunoId: 123
-- Curso: Sistemas de Informação
-- Turmas: T1 (Matemática), T2 (Programação), T3 (Banco de Dados)

-- =====================================================
-- 3. COMO OS CAMPOS SERIAM PREENCHIDOS
-- =====================================================

-- Para cada RespostaQuestao deste aluno, os campos seriam:
-- CursoId: 5 (Sistemas de Informação) - do participante
-- InstituicaoId: 1 (Católica SC) - do curso do participante
-- TurmaId: T1, T2 ou T3 - dependendo do contexto da questão
-- DisciplinaId: Matemática, Programação ou Banco de Dados - dependendo do contexto
-- ProfessorId: Professor da disciplina específica

-- =====================================================
-- 4. CONSULTA PARA VERIFICAR PREENCHIMENTO CORRETO
-- =====================================================

-- Verificar se os campos desnormalizados estão sendo preenchidos corretamente
-- para alunos em múltiplas turmas
SELECT 
    rq.Id as RespostaQuestaoId,
    rq.QuestaoId,
    rq.Valor,
    a.Nome as Aluno,
    c.Nome as Curso,
    t.Nome as Turma,
    d.Nome as Disciplina,
    p.Nome as Professor,
    i.Nome as Instituicao,
    rq.CursoId,
    rq.TurmaId,
    rq.DisciplinaId,
    rq.ProfessorId,
    rq.InstituicaoId
FROM respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN participantes p_part ON r.ParticipanteId = p_part.Id
JOIN alunos a ON p_part.AlunoId = a.AlunoId
LEFT JOIN cursos c ON rq.CursoId = c.Id
LEFT JOIN turmas t ON rq.TurmaId = t.Id
LEFT JOIN disciplinas d ON rq.DisciplinaId = d.Id
LEFT JOIN professores p ON rq.ProfessorId = p.Id
LEFT JOIN instituicoes i ON rq.InstituicaoId = i.Id
WHERE p_part.Tipo = 'Aluno'
    AND a.AlunoId IN (
        -- Alunos em múltiplas turmas
        SELECT a2.AlunoId
        FROM alunos a2
        JOIN alunoturmasdisciplinas atd2 ON a2.AlunoId = atd2.AlunoId
        JOIN turmasdisciplinas td2 ON atd2.TurmaDisciplinaId = td2.Id
        GROUP BY a2.AlunoId
        HAVING COUNT(DISTINCT td2.TurmaId) > 1
    )
ORDER BY a.Nome, rq.QuestaoId;

-- =====================================================
-- 5. RELATÓRIO POR TURMA/DISCIPLINA
-- =====================================================

-- Relatório mostrando respostas agrupadas por turma/disciplina
-- para alunos em múltiplas turmas
SELECT 
    c.Nome as Curso,
    t.Nome as Turma,
    d.Nome as Disciplina,
    p.Nome as Professor,
    COUNT(*) as TotalRespostas,
    AVG(CAST(rq.Valor AS DECIMAL(5,2))) as MediaNota
FROM respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN participantes p_part ON r.ParticipanteId = p_part.Id
JOIN alunos a ON p_part.AlunoId = a.AlunoId
LEFT JOIN cursos c ON rq.CursoId = c.Id
LEFT JOIN turmas t ON rq.TurmaId = t.Id
LEFT JOIN disciplinas d ON rq.DisciplinaId = d.Id
LEFT JOIN professores p ON rq.ProfessorId = p.Id
WHERE p_part.Tipo = 'Aluno'
    AND rq.Valor IS NOT NULL 
    AND rq.Valor != ''
    AND rq.Valor REGEXP '^[0-9]+$'
    AND a.AlunoId IN (
        -- Alunos em múltiplas turmas
        SELECT a2.AlunoId
        FROM alunos a2
        JOIN alunoturmasdisciplinas atd2 ON a2.AlunoId = atd2.AlunoId
        JOIN turmasdisciplinas td2 ON atd2.TurmaDisciplinaId = td2.Id
        GROUP BY a2.AlunoId
        HAVING COUNT(DISTINCT td2.TurmaId) > 1
    )
GROUP BY c.Nome, t.Nome, d.Nome, p.Nome
ORDER BY c.Nome, t.Nome, d.Nome;

-- =====================================================
-- FIM DO EXEMPLO
-- =====================================================
