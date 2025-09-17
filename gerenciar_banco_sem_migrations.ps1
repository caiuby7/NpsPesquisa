# Script para gerenciar o banco de dados sem usar migrações automáticas
# Este script oferece opções para criar, recriar e gerenciar o banco

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("create", "recreate", "backup", "restore", "status")]
    [string]$Action = "status"
)

Write-Host "=== GERENCIADOR DE BANCO SEM MIGRAÇÕES ===" -ForegroundColor Green

switch ($Action) {
    "create" {
        Write-Host "Criando banco de dados usando EnsureCreated..." -ForegroundColor Yellow
        Set-Location "NpsPesquisa.Api"
        dotnet run --no-build
    }
    
    "recreate" {
        Write-Host "Recriando banco de dados..." -ForegroundColor Yellow
        Write-Host "Removendo arquivos de banco local..." -ForegroundColor Red
        Remove-Item -Path "NpsPesquisaDb.mdf" -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "NpsPesquisaDb_log.ldf" -Force -ErrorAction SilentlyContinue
        
        Write-Host "Criando novo banco..." -ForegroundColor Yellow
        Set-Location "NpsPesquisa.Api"
        dotnet run --no-build
    }
    
    "backup" {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupFile = "backup_banco_$timestamp.sql"
        Write-Host "Criando backup do banco em: $backupFile" -ForegroundColor Yellow
        
        # Aqui você pode adicionar comandos específicos para backup do MySQL
        Write-Host "Para fazer backup do MySQL, use:" -ForegroundColor Cyan
        Write-Host "mysqldump -h database-1.c9dpaerguibp.us-east-1.rds.amazonaws.com -u admin -p ava_inst > $backupFile" -ForegroundColor White
    }
    
    "restore" {
        Write-Host "Para restaurar um backup do MySQL, use:" -ForegroundColor Cyan
        Write-Host "mysql -h database-1.c9dpaerguibp.us-east-1.rds.amazonaws.com -u admin -p ava_inst < backup_file.sql" -ForegroundColor White
    }
    
    "status" {
        Write-Host "=== STATUS DO BANCO ===" -ForegroundColor Yellow
        
        # Verificar arquivos locais
        if (Test-Path "NpsPesquisaDb.mdf") {
            $file = Get-Item "NpsPesquisaDb.mdf"
            Write-Host "Banco local encontrado: $($file.Name) ($($file.Length / 1MB) MB)" -ForegroundColor Green
        } else {
            Write-Host "Banco local não encontrado" -ForegroundColor Red
        }
        
        # Verificar conectividade com banco remoto
        Write-Host "`nTestando conectividade com banco remoto..." -ForegroundColor Yellow
        try {
            Test-NetConnection -ComputerName "database-1.c9dpaerguibp.us-east-1.rds.amazonaws.com" -Port 3306
        } catch {
            Write-Host "Erro ao testar conectividade: $_" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== OPERAÇÃO CONCLUÍDA ===" -ForegroundColor Green
