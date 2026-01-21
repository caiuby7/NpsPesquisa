# Script para limpar cache e resolver problemas de ChunkLoadError
# Execute este script quando encontrar erros de carregamento de chunks

Write-Host "Limpando cache e arquivos temporários..." -ForegroundColor Yellow

# Parar o servidor de desenvolvimento se estiver rodando
Write-Host "`nParando processos do Node.js..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpar pasta build
if (Test-Path "build") {
    Write-Host "Removendo pasta build..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "build"
}

# Limpar cache do npm
Write-Host "Limpando cache do npm..." -ForegroundColor Cyan
npm cache clean --force

# Limpar node_modules e reinstalar (opcional, descomente se necessário)
# Write-Host "Removendo node_modules..." -ForegroundColor Cyan
# Remove-Item -Recurse -Force "node_modules"
# Write-Host "Reinstalando dependências..." -ForegroundColor Cyan
# npm install

# Limpar cache do webpack (pasta .cache se existir)
if (Test-Path ".cache") {
    Write-Host "Removendo cache do webpack..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force ".cache"
}

# Limpar arquivos temporários do TypeScript
Get-ChildItem -Path . -Filter "*.tsbuildinfo" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force

Write-Host "`nLimpeza concluída!" -ForegroundColor Green
Write-Host "`nPróximos passos:" -ForegroundColor Yellow
Write-Host "1. Limpe o cache do navegador (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "2. Execute 'npm start' para iniciar o servidor novamente" -ForegroundColor White
Write-Host "3. Se o problema persistir, descomente as linhas de reinstalação do node_modules acima" -ForegroundColor White

