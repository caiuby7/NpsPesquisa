-- =====================================================
-- MIGRAÇÃO MANUAL: DESNORMALIZAÇÃO PARA RESPOSTASQUESTOES
-- =====================================================
-- Este script adiciona campos desnormalizados na tabela respostasquestoes
-- para melhorar a performance dos relatórios

USE ava_inst;

-- =====================================================
-- 1. ADICIONAR COLUNAS DESNORMALIZADAS
-- =====================================================

-- Adicionar colunas para IDs desnormalizados
ALTER TABLE respostasquestoes 
ADD COLUMN CursoId INT NULL,
ADD COLUMN TurmaId INT NULL,
ADD COLUMN DisciplinaId INT NULL,
ADD COLUMN ProfessorId INT NULL,
ADD COLUMN InstituicaoId INT NULL;

-- =====================================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para os campos desnormalizados
CREATE INDEX IX_respostasquestoes_CursoId ON respostasquestoes(CursoId);
CREATE INDEX IX_respostasquestoes_TurmaId ON respostasquestoes(TurmaId);
CREATE INDEX IX_respostasquestoes_DisciplinaId ON respostasquestoes(DisciplinaId);
CREATE INDEX IX_respostasquestoes_ProfessorId ON respostasquestoes(ProfessorId);
CREATE INDEX IX_respostasquestoes_InstituicaoId ON respostasquestoes(InstituicaoId);
CREATE INDEX IX_respostasquestoes_ItemAvaliadoId ON respostasquestoes(ItemAvaliadoId);

-- =====================================================
-- 3. ADICIONAR FOREIGN KEYS
-- =====================================================

-- Foreign keys para os campos desnormalizados
ALTER TABLE respostasquestoes 
ADD CONSTRAINT FK_respostasquestoes_cursos_CursoId 
FOREIGN KEY (CursoId) REFERENCES cursos(Id) ON DELETE SET NULL;

ALTER TABLE respostasquestoes 
ADD CONSTRAINT FK_respostasquestoes_turmas_TurmaId 
FOREIGN KEY (TurmaId) REFERENCES turmas(Id) ON DELETE SET NULL;

ALTER TABLE respostasquestoes 
ADD CONSTRAINT FK_respostasquestoes_disciplinas_DisciplinaId 
FOREIGN KEY (DisciplinaId) REFERENCES disciplinas(Id) ON DELETE SET NULL;

ALTER TABLE respostasquestoes 
ADD CONSTRAINT FK_respostasquestoes_professores_ProfessorId 
FOREIGN KEY (ProfessorId) REFERENCES professores(Id) ON DELETE SET NULL;

ALTER TABLE respostasquestoes 
ADD CONSTRAINT FK_respostasquestoes_instituicoes_InstituicaoId 
FOREIGN KEY (InstituicaoId) REFERENCES instituicoes(Id) ON DELETE SET NULL;

-- =====================================================
-- 4. POPULAR CAMPOS DESNORMALIZADOS EXISTENTES
-- =====================================================

-- Atualizar respostasquestoes baseado no TipoItemAvaliado do questionário E no participante
UPDATE respostasquestoes rq
JOIN respostas r ON rq.RespostaId = r.Id
JOIN questionarios q ON r.QuestionarioId = q.Id
JOIN participantes p ON r.ParticipanteId = p.Id
SET 
    -- CursoId: direto do item avaliado OU do participante
    rq.CursoId = COALESCE(
        -- Primeiro tenta pelo item avaliado
        CASE 
            WHEN q.TipoItemAvaliado = 'Curso' THEN rq.ItemAvaliadoId
            WHEN q.TipoItemAvaliado = 'Turma' THEN (
                SELECT t.CursoId 
                FROM turmas t 
                WHERE t.Id = rq.ItemAvaliadoId
            )
            WHEN q.TipoItemAvaliado = 'TurmaDisciplina' THEN (
                SELECT t.CursoId 
                FROM turmasdisciplinas td 
                JOIN turmas t ON td.TurmaId = t.Id
                WHERE td.Id = rq.ItemAvaliadoId
            )
            ELSE NULL
        END,
        -- Se não encontrou, tenta pelo participante
        CASE 
            WHEN p.Tipo = 'Aluno' THEN p.CursoId
            WHEN p.Tipo = 'Professor' AND p.ProfessorId IS NOT NULL THEN (
                SELECT t.CursoId 
                FROM turmasdisciplinas td 
                JOIN turmas t ON td.TurmaId = t.Id
                WHERE td.ProfessorId = p.ProfessorId
                LIMIT 1
            )
            WHEN p.Tipo = 'Coordenador' AND p.CoordenadorId IS NOT NULL THEN (
                SELECT cc.CursoId 
                FROM coordenadorcursos cc 
                WHERE cc.CoordenadorId = p.CoordenadorId
                LIMIT 1
            )
            ELSE NULL
        END
    ),
    
    -- TurmaId: direto do item avaliado OU do participante
    rq.TurmaId = COALESCE(
        -- Primeiro tenta pelo item avaliado
        CASE 
            WHEN q.TipoItemAvaliado = 'Turma' THEN rq.ItemAvaliadoId
            WHEN q.TipoItemAvaliado = 'Alunos' THEN rq.ItemAvaliadoId
            WHEN q.TipoItemAvaliado = 'TurmaDisciplina' THEN (
                SELECT td.TurmaId 
                FROM turmasdisciplinas td 
                WHERE td.Id = rq.ItemAvaliadoId
            )
            ELSE NULL
        END,
        -- Se não encontrou, tenta pelo participante
        CASE 
            WHEN p.Tipo = 'Aluno' AND p.AlunoId IS NOT NULL THEN COALESCE(
                -- Primeiro tenta turma direta do aluno
                (SELECT a.TurmaId FROM alunos a WHERE a.AlunoId = p.AlunoId),
                -- Se não tem, busca nas TurmaDisciplinas
                (SELECT td.TurmaId 
                 FROM turmasdisciplinas td 
                 JOIN alunoturmasdisciplinas atd ON td.Id = atd.TurmaDisciplinaId
                 WHERE atd.AlunoId = p.AlunoId
                 LIMIT 1)
            )
            WHEN p.Tipo = 'Professor' AND p.ProfessorId IS NOT NULL THEN (
                SELECT td.TurmaId 
                FROM turmasdisciplinas td 
                WHERE td.ProfessorId = p.ProfessorId
                LIMIT 1
            )
            ELSE NULL
        END
    ),
    
    -- DisciplinaId: direto do item avaliado OU do participante
    rq.DisciplinaId = COALESCE(
        -- Primeiro tenta pelo item avaliado
        CASE 
            WHEN q.TipoItemAvaliado = 'Disciplina' THEN rq.ItemAvaliadoId
            WHEN q.TipoItemAvaliado = 'Estagio' THEN rq.ItemAvaliadoId
            WHEN q.TipoItemAvaliado = 'ProjetoExtensionista' THEN rq.ItemAvaliadoId
            WHEN q.TipoItemAvaliado = 'TurmaDisciplina' THEN (
                SELECT td.DisciplinaId 
                FROM turmasdisciplinas td 
                WHERE td.Id = rq.ItemAvaliadoId
            )
            ELSE NULL
        END,
        -- Se não encontrou, tenta pelo participante
        CASE 
            WHEN p.Tipo = 'Aluno' AND p.AlunoId IS NOT NULL THEN (
                SELECT td.DisciplinaId 
                FROM turmasdisciplinas td 
                JOIN alunoturmasdisciplinas atd ON td.Id = atd.TurmaDisciplinaId
                WHERE atd.AlunoId = p.AlunoId
                LIMIT 1
            )
            WHEN p.Tipo = 'Professor' AND p.ProfessorId IS NOT NULL THEN (
                SELECT td.DisciplinaId 
                FROM turmasdisciplinas td 
                WHERE td.ProfessorId = p.ProfessorId
                LIMIT 1
            )
            ELSE NULL
        END
    ),
    
    -- ProfessorId: direto do item avaliado OU do participante
    rq.ProfessorId = COALESCE(
        -- Primeiro tenta pelo item avaliado
        CASE 
            WHEN q.TipoItemAvaliado = 'Professor' THEN rq.ItemAvaliadoId
            WHEN q.TipoItemAvaliado = 'Coordenador' THEN rq.ItemAvaliadoId
            WHEN q.TipoItemAvaliado = 'TurmaDisciplina' THEN (
                SELECT td.ProfessorId 
                FROM turmasdisciplinas td 
                WHERE td.Id = rq.ItemAvaliadoId
            )
            ELSE NULL
        END,
        -- Se não encontrou, tenta pelo participante
        CASE 
            WHEN p.Tipo = 'Professor' THEN p.ProfessorId
            WHEN p.Tipo = 'Coordenador' THEN p.ProfessorId
            ELSE NULL
        END
    ),
    
    -- InstituicaoId: direto do item avaliado OU do participante OU do CursoId já preenchido
    rq.InstituicaoId = COALESCE(
        -- Primeiro tenta pelo item avaliado
        CASE 
            WHEN q.TipoItemAvaliado = 'Estrutura' THEN rq.ItemAvaliadoId
            WHEN q.TipoItemAvaliado = 'Infraestrutura' THEN rq.ItemAvaliadoId
            WHEN q.TipoItemAvaliado = 'Curso' THEN (
                SELECT c.InstituicaoId 
                FROM cursos c 
                WHERE c.Id = rq.ItemAvaliadoId
            )
            WHEN q.TipoItemAvaliado = 'Turma' THEN (
                SELECT c.InstituicaoId 
                FROM turmas t 
                JOIN cursos c ON t.CursoId = c.Id
                WHERE t.Id = rq.ItemAvaliadoId
            )
            WHEN q.TipoItemAvaliado = 'TurmaDisciplina' THEN (
                SELECT c.InstituicaoId 
                FROM turmasdisciplinas td 
                JOIN turmas t ON td.TurmaId = t.Id
                JOIN cursos c ON t.CursoId = c.Id
                WHERE td.Id = rq.ItemAvaliadoId
            )
            ELSE NULL
        END,
        -- Se não encontrou, tenta pelo participante
        CASE 
            WHEN p.Tipo = 'Aluno' AND p.CursoId IS NOT NULL THEN (
                SELECT c.InstituicaoId 
                FROM cursos c 
                WHERE c.Id = p.CursoId
            )
            WHEN p.Tipo = 'Professor' AND p.ProfessorId IS NOT NULL THEN (
                SELECT c.InstituicaoId 
                FROM turmasdisciplinas td 
                JOIN turmas t ON td.TurmaId = t.Id
                JOIN cursos c ON t.CursoId = c.Id
                WHERE td.ProfessorId = p.ProfessorId
                LIMIT 1
            )
            WHEN p.Tipo = 'Coordenador' AND p.CoordenadorId IS NOT NULL THEN (
                SELECT c.InstituicaoId 
                FROM coordenadorcursos cc 
                JOIN cursos c ON cc.CursoId = c.Id
                WHERE cc.CoordenadorId = p.CoordenadorId
                LIMIT 1
            )
            ELSE NULL
        END,
        -- Se ainda não encontrou, tenta pelo CursoId já preenchido nesta mesma linha
        CASE 
            WHEN rq.CursoId IS NOT NULL THEN (
                SELECT c.InstituicaoId 
                FROM cursos c 
                WHERE c.Id = rq.CursoId
            )
            ELSE NULL
        END
    )
WHERE rq.ItemAvaliadoId IS NOT NULL;

-- =====================================================
-- 5. VERIFICAR RESULTADOS
-- =====================================================

-- Verificar quantas respostasquestoes foram atualizadas
SELECT 
    'Total de respostasquestoes' as Descricao,
    COUNT(*) as Total
FROM respostasquestoes
UNION ALL
SELECT 
    'Com CursoId preenchido' as Descricao,
    COUNT(*) as Total
FROM respostasquestoes 
WHERE CursoId IS NOT NULL
UNION ALL
SELECT 
    'Com TurmaId preenchido' as Descricao,
    COUNT(*) as Total
FROM respostasquestoes 
WHERE TurmaId IS NOT NULL
UNION ALL
SELECT 
    'Com DisciplinaId preenchido' as Descricao,
    COUNT(*) as Total
FROM respostasquestoes 
WHERE DisciplinaId IS NOT NULL
UNION ALL
SELECT 
    'Com ProfessorId preenchido' as Descricao,
    COUNT(*) as Total
FROM respostasquestoes 
WHERE ProfessorId IS NOT NULL
UNION ALL
SELECT 
    'Com InstituicaoId preenchido' as Descricao,
    COUNT(*) as Total
FROM respostasquestoes 
WHERE InstituicaoId IS NOT NULL;

-- =====================================================
-- 6. EXEMPLO DE CONSULTA OTIMIZADA
-- =====================================================

-- Exemplo de relatório que agora será muito mais rápido
SELECT 
    c.Nome as Curso,
    t.Nome as Turma,
    d.Nome as Disciplina,
    p.Nome as Professor,
    i.Nome as Instituicao,
    q.Texto as Questao,
    AVG(CAST(rq.Valor AS DECIMAL(5,2))) as MediaNota,
    COUNT(*) as TotalRespostas
FROM respostasquestoes rq
JOIN questoes q ON rq.QuestaoId = q.Id
LEFT JOIN cursos c ON rq.CursoId = c.Id
LEFT JOIN turmas t ON rq.TurmaId = t.Id
LEFT JOIN disciplinas d ON rq.DisciplinaId = d.Id
LEFT JOIN professores p ON rq.ProfessorId = p.Id
LEFT JOIN instituicoes i ON rq.InstituicaoId = i.Id
WHERE rq.Valor IS NOT NULL 
    AND rq.Valor != ''
    AND rq.Valor REGEXP '^[0-9]+$'
GROUP BY c.Nome, t.Nome, d.Nome, p.Nome, i.Nome, q.Texto
ORDER BY c.Nome, t.Nome, d.Nome;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
