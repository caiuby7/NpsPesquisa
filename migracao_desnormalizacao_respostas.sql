-- Script de migração para desnormalização da tabela respostas
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- 1. Adicionar as novas colunas na tabela respostas
SELECT 'Adicionando colunas na tabela respostas' AS Status;

ALTER TABLE respostas ADD COLUMN CursoId INT;
ALTER TABLE respostas ADD COLUMN TurmaId INT;
ALTER TABLE respostas ADD COLUMN DisciplinaId INT;
ALTER TABLE respostas ADD COLUMN ProfessorId INT;
ALTER TABLE respostas ADD COLUMN InstituicaoId INT;

-- 2. Criar índices para melhorar performance
SELECT 'Criando índices para performance' AS Status;

CREATE INDEX idx_respostas_cursoid ON respostas(CursoId);
CREATE INDEX idx_respostas_turmaid ON respostas(TurmaId);
CREATE INDEX idx_respostas_disciplinaid ON respostas(DisciplinaId);
CREATE INDEX idx_respostas_professorid ON respostas(ProfessorId);
CREATE INDEX idx_respostas_instituicaoid ON respostas(InstituicaoId);
CREATE INDEX idx_respostas_tipoitemavaliado ON respostas(TipoItemAvaliado);

-- 3. Migrar dados existentes baseado no TipoItemAvaliado
SELECT 'Migrando dados existentes' AS Status;

-- Para TipoItemAvaliado = 0 (Curso)
UPDATE respostas r
INNER JOIN questionarios q ON r.QuestionarioId = q.Id
INNER JOIN participantes p ON r.ParticipanteId = p.Id
INNER JOIN alunos a ON p.Id = a.ParticipanteId
INNER JOIN turmas t ON a.TurmaId = t.Id
INNER JOIN cursos c ON t.CursoId = c.Id
SET r.CursoId = c.Id
WHERE q.TipoItemAvaliado = 0;

-- Para TipoItemAvaliado = 1 (Turma)
UPDATE respostas r
INNER JOIN questionarios q ON r.QuestionarioId = q.Id
INNER JOIN respostasquestoes rq ON r.Id = rq.RespostaId
INNER JOIN turmasdisciplinas td ON rq.ItemAvaliadoId = td.Id
SET r.TurmaId = td.TurmaId
WHERE q.TipoItemAvaliado = 1;

-- Para TipoItemAvaliado = 2 (Disciplina)
UPDATE respostas r
INNER JOIN questionarios q ON r.QuestionarioId = q.Id
INNER JOIN respostasquestoes rq ON r.Id = rq.RespostaId
INNER JOIN turmasdisciplinas td ON rq.ItemAvaliadoId = td.Id
SET r.DisciplinaId = td.DisciplinaId
WHERE q.TipoItemAvaliado = 2;

-- Para TipoItemAvaliado = 3 (Professor)
UPDATE respostas r
INNER JOIN questionarios q ON r.QuestionarioId = q.Id
INNER JOIN respostasquestoes rq ON r.Id = rq.RespostaId
INNER JOIN turmasdisciplinas td ON rq.ItemAvaliadoId = td.Id
SET r.ProfessorId = td.ProfessorId
WHERE q.TipoItemAvaliado = 3;

-- Para TipoItemAvaliado = 4 (Coordenador) - usar ProfessorId
UPDATE respostas r
INNER JOIN questionarios q ON r.QuestionarioId = q.Id
INNER JOIN respostasquestoes rq ON r.Id = rq.RespostaId
INNER JOIN itensavaliadosquestionarios iaq ON rq.ItemAvaliadoId = iaq.Id
INNER JOIN professores p ON iaq.ItemAvaliadoId = p.Id
SET r.ProfessorId = p.Id
WHERE q.TipoItemAvaliado = 4;

-- Para TipoItemAvaliado = 6 (Estrutura) - usar InstituicaoId
UPDATE respostas r
INNER JOIN questionarios q ON r.QuestionarioId = q.Id
INNER JOIN respostasquestoes rq ON r.Id = rq.RespostaId
INNER JOIN itensavaliadosquestionarios iaq ON rq.ItemAvaliadoId = iaq.Id
INNER JOIN instituicoes i ON iaq.ItemAvaliadoId = i.Id
SET r.InstituicaoId = i.Id
WHERE q.TipoItemAvaliado = 6;

-- Para TipoItemAvaliado = 7 (Estagio) - usar DisciplinaId
UPDATE respostas r
INNER JOIN questionarios q ON r.QuestionarioId = q.Id
INNER JOIN respostasquestoes rq ON r.Id = rq.RespostaId
INNER JOIN turmasdisciplinas td ON rq.ItemAvaliadoId = td.Id
SET r.DisciplinaId = td.DisciplinaId
WHERE q.TipoItemAvaliado = 7;

-- Para TipoItemAvaliado = 8 (ProjetoExtensionista) - usar DisciplinaId
UPDATE respostas r
INNER JOIN questionarios q ON r.QuestionarioId = q.Id
INNER JOIN respostasquestoes rq ON r.Id = rq.RespostaId
INNER JOIN turmasdisciplinas td ON rq.ItemAvaliadoId = td.Id
SET r.DisciplinaId = td.DisciplinaId
WHERE q.TipoItemAvaliado = 8;

-- Para TipoItemAvaliado = 9 (Alunos) - usar TurmaId
UPDATE respostas r
INNER JOIN questionarios q ON r.QuestionarioId = q.Id
INNER JOIN respostasquestoes rq ON r.Id = rq.RespostaId
INNER JOIN turmasdisciplinas td ON rq.ItemAvaliadoId = td.Id
SET r.TurmaId = td.TurmaId
WHERE q.TipoItemAvaliado = 9;

-- Para TipoItemAvaliado = 10 (TurmaDisciplina) - usar TurmaId e DisciplinaId
UPDATE respostas r
INNER JOIN questionarios q ON r.QuestionarioId = q.Id
INNER JOIN respostasquestoes rq ON r.Id = rq.RespostaId
INNER JOIN turmasdisciplinas td ON rq.ItemAvaliadoId = td.Id
SET r.TurmaId = td.TurmaId, r.DisciplinaId = td.DisciplinaId
WHERE q.TipoItemAvaliado = 10;

-- Para TipoItemAvaliado = 11 (Infraestrutura) - usar InstituicaoId
UPDATE respostas r
INNER JOIN questionarios q ON r.QuestionarioId = q.Id
INNER JOIN respostasquestoes rq ON r.Id = rq.RespostaId
INNER JOIN itensavaliadosquestionarios iaq ON rq.ItemAvaliadoId = iaq.Id
INNER JOIN instituicoes i ON iaq.ItemAvaliadoId = i.Id
SET r.InstituicaoId = i.Id
WHERE q.TipoItemAvaliado = 11;

-- 4. Verificar dados migrados
SELECT 'Verificando dados migrados' AS Status;

SELECT 
    'Respostas com CursoId' AS Tipo,
    COUNT(*) AS Total
FROM respostas 
WHERE CursoId IS NOT NULL

UNION ALL

SELECT 
    'Respostas com TurmaId' AS Tipo,
    COUNT(*) AS Total
FROM respostas 
WHERE TurmaId IS NOT NULL

UNION ALL

SELECT 
    'Respostas com DisciplinaId' AS Tipo,
    COUNT(*) AS Total
FROM respostas 
WHERE DisciplinaId IS NOT NULL

UNION ALL

SELECT 
    'Respostas com ProfessorId' AS Tipo,
    COUNT(*) AS Total
FROM respostas 
WHERE ProfessorId IS NOT NULL

UNION ALL

SELECT 
    'Respostas com InstituicaoId' AS Tipo,
    COUNT(*) AS Total
FROM respostas 
WHERE InstituicaoId IS NOT NULL;

-- 5. Exemplo de consulta otimizada
SELECT 'Exemplo de consulta otimizada' AS Status;

SELECT 
    p.Nome AS QuemRespondeu,
    c.Nome AS Curso,
    t.Nome AS Turma,
    d.Nome AS Disciplina,
    prof.Nome AS Professor,
    i.Nome AS Instituicao,
    r.DataResposta
FROM respostas r
LEFT JOIN participantes p ON r.ParticipanteId = p.Id
LEFT JOIN cursos c ON r.CursoId = c.Id
LEFT JOIN turmas t ON r.TurmaId = t.Id
LEFT JOIN disciplinas d ON r.DisciplinaId = d.Id
LEFT JOIN professores prof ON r.ProfessorId = prof.Id
LEFT JOIN instituicoes i ON r.InstituicaoId = i.Id
WHERE r.Id IN (SELECT Id FROM respostas LIMIT 5)
ORDER BY r.DataResposta DESC;
