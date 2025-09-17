-- Script para atualizar o banco de dados para integração com TOTVS
-- Data: 2025-01-15
-- Descrição: Adiciona campos de contexto para integração com TOTVS

USE ava_inst;

-- 1. A coluna Matricula permanece no banco de dados
-- A propriedade RA no modelo C# é [NotMapped] e retorna o valor de Matricula
-- Não é necessário alterar a estrutura da tabela alunos

-- 2. Adicionar campos de contexto na tabela participantesquestionarios
ALTER TABLE participantesquestionarios 
ADD COLUMN CursoId INT NULL,
ADD COLUMN TurmaId INT NULL,
ADD COLUMN DisciplinaId INT NULL,
ADD COLUMN ProfessorId INT NULL,
ADD COLUMN InstituicaoId INT NULL,
ADD COLUMN PeriodoLetivoId INT NULL,
ADD COLUMN TipoItemAvaliado INT NULL,
ADD COLUMN NomeItemEspecifico VARCHAR(200) NULL,
ADD COLUMN ItemAvaliadoId INT NULL;

-- 3. Adicionar campos de contexto na tabela respostasquestoes
ALTER TABLE respostasquestoes 
ADD COLUMN CursoId INT NULL,
ADD COLUMN TurmaId INT NULL,
ADD COLUMN DisciplinaId INT NULL,
ADD COLUMN ProfessorId INT NULL,
ADD COLUMN InstituicaoId INT NULL,
ADD COLUMN ItemAvaliadoId INT NULL;

-- 4. Adicionar campo Codigo na tabela turmas
ALTER TABLE turmas 
ADD COLUMN Codigo TEXT NULL;

-- 5. Adicionar campo Codigo na tabela instituicoes
ALTER TABLE instituicoes 
ADD COLUMN Codigo TEXT NULL;

-- 6. Criar índices para performance na tabela participantesquestionarios
CREATE INDEX IX_participantesquestionarios_CursoId ON participantesquestionarios(CursoId);
CREATE INDEX IX_participantesquestionarios_TurmaId ON participantesquestionarios(TurmaId);
CREATE INDEX IX_participantesquestionarios_DisciplinaId ON participantesquestionarios(DisciplinaId);
CREATE INDEX IX_participantesquestionarios_ProfessorId ON participantesquestionarios(ProfessorId);
CREATE INDEX IX_participantesquestionarios_InstituicaoId ON participantesquestionarios(InstituicaoId);
CREATE INDEX IX_participantesquestionarios_PeriodoLetivoId ON participantesquestionarios(PeriodoLetivoId);

-- 7. Criar índices para performance na tabela respostasquestoes
CREATE INDEX IX_respostasquestoes_CursoId ON respostasquestoes(CursoId);
CREATE INDEX IX_respostasquestoes_TurmaId ON respostasquestoes(TurmaId);
CREATE INDEX IX_respostasquestoes_DisciplinaId ON respostasquestoes(DisciplinaId);
CREATE INDEX IX_respostasquestoes_ProfessorId ON respostasquestoes(ProfessorId);
CREATE INDEX IX_respostasquestoes_InstituicaoId ON respostasquestoes(InstituicaoId);
CREATE INDEX IX_respostasquestoes_ItemAvaliadoId ON respostasquestoes(ItemAvaliadoId);

-- 8. Criar índice único para evitar duplicatas em respostasquestoes
CREATE UNIQUE INDEX IX_respostasquestoes_RespostaId_QuestaoId_ItemAvaliadoId 
ON respostasquestoes(RespostaId, QuestaoId, ItemAvaliadoId);

-- 9. Adicionar foreign keys para participantesquestionarios
ALTER TABLE participantesquestionarios 
ADD CONSTRAINT FK_participantesquestionarios_cursos_CursoId 
FOREIGN KEY (CursoId) REFERENCES cursos(Id) ON DELETE SET NULL;

ALTER TABLE participantesquestionarios 
ADD CONSTRAINT FK_participantesquestionarios_turmas_TurmaId 
FOREIGN KEY (TurmaId) REFERENCES turmas(Id) ON DELETE SET NULL;

ALTER TABLE participantesquestionarios 
ADD CONSTRAINT FK_participantesquestionarios_disciplinas_DisciplinaId 
FOREIGN KEY (DisciplinaId) REFERENCES disciplinas(Id) ON DELETE SET NULL;

ALTER TABLE participantesquestionarios 
ADD CONSTRAINT FK_participantesquestionarios_professores_ProfessorId 
FOREIGN KEY (ProfessorId) REFERENCES professores(Id) ON DELETE SET NULL;

ALTER TABLE participantesquestionarios 
ADD CONSTRAINT FK_participantesquestionarios_instituicoes_InstituicaoId 
FOREIGN KEY (InstituicaoId) REFERENCES instituicoes(Id) ON DELETE SET NULL;

ALTER TABLE participantesquestionarios 
ADD CONSTRAINT FK_participantesquestionarios_periodosletivos_PeriodoLetivoId 
FOREIGN KEY (PeriodoLetivoId) REFERENCES periodosletivos(Id) ON DELETE SET NULL;

-- 10. Adicionar foreign keys para respostasquestoes
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

-- 11. Verificar se as alterações foram aplicadas corretamente
SELECT 'Verificação das alterações aplicadas:' as Status;

-- Verificar se a coluna RA existe na tabela alunos
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ava_inst' 
AND TABLE_NAME = 'alunos' 
AND COLUMN_NAME = 'RA';

-- Verificar se os campos de contexto foram adicionados em participantesquestionarios
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ava_inst' 
AND TABLE_NAME = 'participantesquestionarios' 
AND COLUMN_NAME IN ('CursoId', 'TurmaId', 'DisciplinaId', 'ProfessorId', 'InstituicaoId', 'PeriodoLetivoId', 'TipoItemAvaliado', 'NomeItemEspecifico', 'ItemAvaliadoId')
ORDER BY COLUMN_NAME;

-- Verificar se os campos de contexto foram adicionados em respostasquestoes
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ava_inst' 
AND TABLE_NAME = 'respostasquestoes' 
AND COLUMN_NAME IN ('CursoId', 'TurmaId', 'DisciplinaId', 'ProfessorId', 'InstituicaoId', 'ItemAvaliadoId')
ORDER BY COLUMN_NAME;

-- Verificar se os índices foram criados
SELECT INDEX_NAME, TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'ava_inst' 
AND TABLE_NAME IN ('participantesquestionarios', 'respostasquestoes')
AND INDEX_NAME LIKE 'IX_%'
ORDER BY TABLE_NAME, INDEX_NAME;

SELECT 'Script executado com sucesso!' as Resultado;
