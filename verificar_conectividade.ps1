# Script para verificar conectividade de rede
Write-Host "=== VERIFICAÇÃO DE CONECTIVIDADE ===" -ForegroundColor Green

# Verificar Oracle TOTVS
Write-Host "`n1. Testando conexão Oracle TOTVS (200.135.232.1:1521)..." -ForegroundColor Yellow
Test-NetConnection -ComputerName "200.135.232.1" -Port 1521

# Verificar LDAP Interno
Write-Host "`n2. Testando conexão LDAP Interno (10.197.40.6:389)..." -ForegroundColor Yellow
Test-NetConnection -ComputerName "10.197.40.6" -Port 389

# Verificar MySQL Interno
Write-Host "`n3. Testando conexão MySQL Interno (avaliacao.catolicasc.org.br:3306)..." -ForegroundColor Yellow
Test-NetConnection -ComputerName "avaliacao.catolicasc.org.br" -Port 3306

# Verificar SMTP
Write-Host "`n4. Testando conexão SMTP (smtp.office365.com:587)..." -ForegroundColor Yellow
Test-NetConnection -ComputerName "smtp.office365.com" -Port 587

Write-Host "`n=== VERIFICAÇÃO CONCLUÍDA ===" -ForegroundColor Green
