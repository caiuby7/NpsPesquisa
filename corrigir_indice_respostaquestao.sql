-- Script para corrigir o problema do índice IX_respostasquestoes_RespostaId
-- Este script deve ser executado no banco de dados antes de executar as migrações

-- 1. Verificar se o índice existe
SELECT 
    INDEX_NAME,
    TABLE_NAME,
    COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.STATISTICS 
WHERE 
    TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'respostasquestoes' 
    AND INDEX_NAME = 'IX_respostasquestoes_RespostaId';

-- 2. Se o índice não existir, criá-lo
CREATE INDEX IF NOT EXISTS IX_respostasquestoes_RespostaId 
ON respostasquestoes(RespostaId);

-- 3. Verificar se a chave estrangeira existe
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE 
    TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'respostasquestoes' 
    AND CONSTRAINT_NAME = 'FK_respostasquestoes_respostas_RespostaId';

-- 4. Se a chave estrangeira não existir, criá-la
ALTER TABLE respostasquestoes 
ADD CONSTRAINT FK_respostasquestoes_respostas_RespostaId 
FOREIGN KEY (RespostaId) REFERENCES respostas(Id) ON DELETE CASCADE;

-- 5. Verificar o resultado final
SHOW INDEX FROM respostasquestoes WHERE Key_name = 'IX_respostasquestoes_RespostaId';
