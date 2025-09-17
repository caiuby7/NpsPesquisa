# Script PowerShell para executar o SQL e adicionar a coluna ItemAvaliadoId
# Execute este script no PowerShell

Write-Host "Executando script SQL para adicionar coluna ItemAvaliadoId..." -ForegroundColor Green

# Configurações de conexão (ajuste conforme necessário)
$server = "database-1.c9dpaerguibp.us-east-1.rds.amazonaws.com"
$database = "ava_inst"
$username = "admin"
$password = "Ber250819"

# Comando SQL
$sqlCommand = @"
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
"@

try {
    # Executar o comando SQL usando mysql client
    $env:MYSQL_PWD = $password
    $sqlCommand | mysql -h $server -u $username -D $database
    
    Write-Host "Script executado com sucesso!" -ForegroundColor Green
    Write-Host "A coluna ItemAvaliadoId foi adicionada à tabela respostasquestoes." -ForegroundColor Yellow
}
catch {
    Write-Host "Erro ao executar o script: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Certifique-se de que o MySQL client está instalado e acessível." -ForegroundColor Yellow
}
