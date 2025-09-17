-- Script de rollback para reverter alterações da integração TOTVS
-- Data: 2025-01-15
-- Descrição: Reverte as alterações feitas para integração com TOTVS

USE ava_inst;

-- 1. Remover foreign keys de respostasquestoes
ALTER TABLE respostasquestoes 
DROP FOREIGN KEY IF EXISTS FK_respostasquestoes_cursos_CursoId;

ALTER TABLE respostasquestoes 
DROP FOREIGN KEY IF EXISTS FK_respostasquestoes_turmas_TurmaId;

ALTER TABLE respostasquestoes 
DROP FOREIGN KEY IF EXISTS FK_respostasquestoes_disciplinas_DisciplinaId;

ALTER TABLE respostasquestoes 
DROP FOREIGN KEY IF EXISTS FK_respostasquestoes_professores_ProfessorId;

ALTER TABLE respostasquestoes 
DROP FOREIGN KEY IF EXISTS FK_respostasquestoes_instituicoes_InstituicaoId;

-- 2. Remover foreign keys de participantesquestionarios
ALTER TABLE participantesquestionarios 
DROP FOREIGN KEY IF EXISTS FK_participantesquestionarios_cursos_CursoId;

ALTER TABLE participantesquestionarios 
DROP FOREIGN KEY IF EXISTS FK_participantesquestionarios_turmas_TurmaId;

ALTER TABLE participantesquestionarios 
DROP FOREIGN KEY IF EXISTS FK_participantesquestionarios_disciplinas_DisciplinaId;

ALTER TABLE participantesquestionarios 
DROP FOREIGN KEY IF EXISTS FK_participantesquestionarios_professores_ProfessorId;

ALTER TABLE participantesquestionarios 
DROP FOREIGN KEY IF EXISTS FK_participantesquestionarios_instituicoes_InstituicaoId;

ALTER TABLE participantesquestionarios 
DROP FOREIGN KEY IF EXISTS FK_participantesquestionarios_periodosletivos_PeriodoLetivoId;

-- 3. Remover índices de respostasquestoes
DROP INDEX IF EXISTS IX_respostasquestoes_CursoId ON respostasquestoes;
DROP INDEX IF EXISTS IX_respostasquestoes_TurmaId ON respostasquestoes;
DROP INDEX IF EXISTS IX_respostasquestoes_DisciplinaId ON respostasquestoes;
DROP INDEX IF EXISTS IX_respostasquestoes_ProfessorId ON respostasquestoes;
DROP INDEX IF EXISTS IX_respostasquestoes_InstituicaoId ON respostasquestoes;
DROP INDEX IF EXISTS IX_respostasquestoes_ItemAvaliadoId ON respostasquestoes;
DROP INDEX IF EXISTS IX_respostasquestoes_RespostaId_QuestaoId_ItemAvaliadoId ON respostasquestoes;

-- 4. Remover índices de participantesquestionarios
DROP INDEX IF EXISTS IX_participantesquestionarios_CursoId ON participantesquestionarios;
DROP INDEX IF EXISTS IX_participantesquestionarios_TurmaId ON participantesquestionarios;
DROP INDEX IF EXISTS IX_participantesquestionarios_DisciplinaId ON participantesquestionarios;
DROP INDEX IF EXISTS IX_participantesquestionarios_ProfessorId ON participantesquestionarios;
DROP INDEX IF EXISTS IX_participantesquestionarios_InstituicaoId ON participantesquestionarios;
DROP INDEX IF EXISTS IX_participantesquestionarios_PeriodoLetivoId ON participantesquestionarios;

-- 5. Remover colunas de contexto de respostasquestoes
ALTER TABLE respostasquestoes 
DROP COLUMN IF EXISTS CursoId,
DROP COLUMN IF EXISTS TurmaId,
DROP COLUMN IF EXISTS DisciplinaId,
DROP COLUMN IF EXISTS ProfessorId,
DROP COLUMN IF EXISTS InstituicaoId,
DROP COLUMN IF EXISTS ItemAvaliadoId;

-- 6. Remover colunas de contexto de participantesquestionarios
ALTER TABLE participantesquestionarios 
DROP COLUMN IF EXISTS CursoId,
DROP COLUMN IF EXISTS TurmaId,
DROP COLUMN IF EXISTS DisciplinaId,
DROP COLUMN IF EXISTS ProfessorId,
DROP COLUMN IF EXISTS InstituicaoId,
DROP COLUMN IF EXISTS PeriodoLetivoId,
DROP COLUMN IF EXISTS TipoItemAvaliado,
DROP COLUMN IF EXISTS NomeItemEspecifico,
DROP COLUMN IF EXISTS ItemAvaliadoId;

-- 7. Remover campo Codigo da tabela turmas
ALTER TABLE turmas 
DROP COLUMN IF EXISTS Codigo;

-- 8. Remover campo Codigo da tabela instituicoes
ALTER TABLE instituicoes 
DROP COLUMN IF EXISTS Codigo;

-- 9. A coluna Matricula permanece no banco de dados
-- Não é necessário alterar a estrutura da tabela alunos

-- 10. Recriar índice original de respostasquestoes
CREATE INDEX IX_respostasquestoes_RespostaId ON respostasquestoes(RespostaId);

-- 11. Verificar se o rollback foi aplicado corretamente
SELECT 'Verificação do rollback aplicado:' as Status;

-- Verificar se a coluna Matricula existe na tabela alunos
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ava_inst' 
AND TABLE_NAME = 'alunos' 
AND COLUMN_NAME = 'Matricula';

-- Verificar se os campos de contexto foram removidos de participantesquestionarios
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ava_inst' 
AND TABLE_NAME = 'participantesquestionarios' 
AND COLUMN_NAME IN ('CursoId', 'TurmaId', 'DisciplinaId', 'ProfessorId', 'InstituicaoId', 'PeriodoLetivoId', 'TipoItemAvaliado', 'NomeItemEspecifico', 'ItemAvaliadoId')
ORDER BY COLUMN_NAME;

-- Verificar se os campos de contexto foram removidos de respostasquestoes
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ava_inst' 
AND TABLE_NAME = 'respostasquestoes' 
AND COLUMN_NAME IN ('CursoId', 'TurmaId', 'DisciplinaId', 'ProfessorId', 'InstituicaoId', 'ItemAvaliadoId')
ORDER BY COLUMN_NAME;

SELECT 'Rollback executado com sucesso!' as Resultado;
