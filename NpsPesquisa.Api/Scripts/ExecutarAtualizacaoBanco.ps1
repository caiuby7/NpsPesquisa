# Script PowerShell para executar a atualização do banco de dados
# Data: 2025-01-15
# Descrição: Executa o script SQL de atualização para integração TOTVS

param(
    [Parameter(Mandatory=$true)]
    [string]$ConnectionString,
    
    [Parameter(Mandatory=$false)]
    [switch]$Rollback = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$WhatIf = $false
)

# Configurar encoding para UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== Script de Atualização do Banco de Dados ===" -ForegroundColor Green
Write-Host "Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

if ($WhatIf) {
    Write-Host "MODO WHAT-IF: Nenhuma alteração será feita no banco de dados" -ForegroundColor Yellow
}

# Determinar qual script executar
$scriptFile = if ($Rollback) {
    "RollbackIntegracaoTotvs.sql"
} else {
    "AtualizarBancoParaIntegracaoTotvs.sql"
}

$scriptPath = Join-Path $PSScriptRoot $scriptFile

if (-not (Test-Path $scriptPath)) {
    Write-Error "Arquivo de script não encontrado: $scriptPath"
    exit 1
}

Write-Host "Executando script: $scriptFile" -ForegroundColor Cyan

try {
    # Executar o script SQL usando mysql client
    if ($WhatIf) {
        Write-Host "Comando que seria executado:" -ForegroundColor Yellow
        Write-Host "mysql -h [host] -u [user] -p[password] [database] < `"$scriptPath`"" -ForegroundColor Gray
    } else {
        # Extrair componentes da connection string
        $connectionString = $ConnectionString -replace "Server=", "host=" -replace "Database=", "database=" -replace "User Id=", "user=" -replace "Password=", "password="
        
        # Executar o script
        $result = mysql $connectionString < $scriptPath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Script executado com sucesso!" -ForegroundColor Green
            Write-Host "Resultado:" -ForegroundColor Cyan
            Write-Host $result
        } else {
            Write-Error "Erro ao executar o script: $result"
            exit 1
        }
    }
} catch {
    Write-Error "Erro ao executar o script: $($_.Exception.Message)"
    exit 1
}

Write-Host "=== Fim da execução ===" -ForegroundColor Green

