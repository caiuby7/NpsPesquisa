-- Script para adicionar a coluna ItemAvaliadoId na tabela respostasquestoes
-- Execute este script no seu banco de dados MySQL

USE ava_inst;

-- Adicionar a coluna ItemAvaliadoId se ela não existir
ALTER TABLE respostasquestoes 
ADD COLUMN IF NOT EXISTS ItemAvaliadoId INT NULL 
COMMENT 'ID do item específico sendo avaliado (disciplina, turma, etc.)';

-- Adicionar índice único composto para permitir múltiplas respostas para a mesma questão
-- com diferentes itens avaliados
ALTER TABLE respostasquestoes 
ADD UNIQUE INDEX IF NOT EXISTS IX_respostasquestoes_RespostaId_QuestaoId_ItemAvaliadoId 
(RespostaId, QuestaoId, ItemAvaliadoId);

-- Verificar se a coluna foi adicionada corretamente
DESCRIBE respostasquestoes;

-- Mostrar os índices da tabela
SHOW INDEX FROM respostasquestoes;
