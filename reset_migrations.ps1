# Script PowerShell para resetar as migrações do Entity Framework
# ATENÇÃO: Este script irá remover todas as migrações e recriar o banco

Write-Host "=== RESET DE MIGRAÇÕES ENTITY FRAMEWORK ===" -ForegroundColor Red
Write-Host "ATENÇÃO: Este script irá remover TODAS as migrações!" -ForegroundColor Yellow
Write-Host "Certifique-se de fazer backup do banco de dados antes de continuar." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Deseja continuar? (digite 'SIM' para confirmar)"
if ($confirm -ne "SIM") {
    Write-Host "Operação cancelada pelo usuário." -ForegroundColor Green
    exit
}

Write-Host "Removendo pasta de migrações..." -ForegroundColor Yellow
Remove-Item -Path "NpsPesquisa.Api\Migrations" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Removendo banco de dados local..." -ForegroundColor Yellow
Remove-Item -Path "NpsPesquisaDb.mdf" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "NpsPesquisaDb_log.ldf" -Force -ErrorAction SilentlyContinue

Write-Host "Criando nova migração inicial..." -ForegroundColor Yellow
Set-Location "NpsPesquisa.Api"
dotnet ef migrations add InitialMigration

Write-Host "Aplicando migração..." -ForegroundColor Yellow
dotnet ef database update

Write-Host "=== RESET CONCLUÍDO ===" -ForegroundColor Green
Write-Host "Agora você pode executar a aplicação normalmente." -ForegroundColor Green
