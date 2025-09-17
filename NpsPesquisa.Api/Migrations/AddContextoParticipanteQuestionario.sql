-- Migração para adicionar campos de contexto na tabela ParticipanteQuestionario
-- Esta migração resolve o problema de não salvar o contexto de disciplina quando
-- adicionamos participantes a questionários específicos

-- Adicionar colunas de contexto
ALTER TABLE ParticipanteQuestionario 
ADD COLUMN CursoId INT NULL,
ADD COLUMN TurmaId INT NULL,
ADD COLUMN DisciplinaId INT NULL,
ADD COLUMN ProfessorId INT NULL,
ADD COLUMN InstituicaoId INT NULL,
ADD COLUMN PeriodoLetivoId INT NULL,
ADD COLUMN TipoItemAvaliado INT NULL,
ADD COLUMN NomeItemEspecifico VARCHAR(200) NULL,
ADD COLUMN ItemAvaliadoId INT NULL;

-- Adicionar foreign keys
ALTER TABLE ParticipanteQuestionario 
ADD CONSTRAINT FK_ParticipanteQuestionario_Curso 
    FOREIGN KEY (CursoId) REFERENCES Cursos(Id) ON DELETE SET NULL;

ALTER TABLE ParticipanteQuestionario 
ADD CONSTRAINT FK_ParticipanteQuestionario_Turma 
    FOREIGN KEY (TurmaId) REFERENCES Turmas(Id) ON DELETE SET NULL;

ALTER TABLE ParticipanteQuestionario 
ADD CONSTRAINT FK_ParticipanteQuestionario_Disciplina 
    FOREIGN KEY (DisciplinaId) REFERENCES Disciplinas(Id) ON DELETE SET NULL;

ALTER TABLE ParticipanteQuestionario 
ADD CONSTRAINT FK_ParticipanteQuestionario_Professor 
    FOREIGN KEY (ProfessorId) REFERENCES Professores(Id) ON DELETE SET NULL;

ALTER TABLE ParticipanteQuestionario 
ADD CONSTRAINT FK_ParticipanteQuestionario_Instituicao 
    FOREIGN KEY (InstituicaoId) REFERENCES Instituicoes(Id) ON DELETE SET NULL;

ALTER TABLE ParticipanteQuestionario 
ADD CONSTRAINT FK_ParticipanteQuestionario_PeriodoLetivo 
    FOREIGN KEY (PeriodoLetivoId) REFERENCES PeriodosLetivos(Id) ON DELETE SET NULL;

-- Adicionar índices para melhor performance
CREATE INDEX IX_ParticipanteQuestionario_CursoId ON ParticipanteQuestionario(CursoId);
CREATE INDEX IX_ParticipanteQuestionario_TurmaId ON ParticipanteQuestionario(TurmaId);
CREATE INDEX IX_ParticipanteQuestionario_DisciplinaId ON ParticipanteQuestionario(DisciplinaId);
CREATE INDEX IX_ParticipanteQuestionario_ProfessorId ON ParticipanteQuestionario(ProfessorId);
CREATE INDEX IX_ParticipanteQuestionario_InstituicaoId ON ParticipanteQuestionario(InstituicaoId);
CREATE INDEX IX_ParticipanteQuestionario_PeriodoLetivoId ON ParticipanteQuestionario(PeriodoLetivoId);
CREATE INDEX IX_ParticipanteQuestionario_TipoItemAvaliado ON ParticipanteQuestionario(TipoItemAvaliado);

-- Comentários para documentação
COMMENT ON COLUMN ParticipanteQuestionario.CursoId IS 'ID do curso usado como filtro ao adicionar o participante';
COMMENT ON COLUMN ParticipanteQuestionario.TurmaId IS 'ID da turma usada como filtro ao adicionar o participante';
COMMENT ON COLUMN ParticipanteQuestionario.DisciplinaId IS 'ID da disciplina usada como filtro ao adicionar o participante';
COMMENT ON COLUMN ParticipanteQuestionario.ProfessorId IS 'ID do professor usado como filtro ao adicionar o participante';
COMMENT ON COLUMN ParticipanteQuestionario.InstituicaoId IS 'ID da instituição usada como filtro ao adicionar o participante';
COMMENT ON COLUMN ParticipanteQuestionario.PeriodoLetivoId IS 'ID do período letivo usado como filtro ao adicionar o participante';
COMMENT ON COLUMN ParticipanteQuestionario.TipoItemAvaliado IS 'Tipo do item avaliado (Curso, Turma, Disciplina, etc.)';
COMMENT ON COLUMN ParticipanteQuestionario.NomeItemEspecifico IS 'Nome do item específico sendo avaliado';
COMMENT ON COLUMN ParticipanteQuestionario.ItemAvaliadoId IS 'ID do item específico sendo avaliado';
