# Script para testar conectividade com servidores internos
Write-Host "=== TESTE DE CONECTIVIDADE SERVIDORES INTERNOS ===" -ForegroundColor Green

# Testar servidor de banco de dados interno
Write-Host "`n1. Testando servidor de banco interno (avaliacao.catolicasc.org.br)..." -ForegroundColor Yellow
Test-NetConnection -ComputerName "avaliacao.catolicasc.org.br" -Port 3306

# Testar servidor LDAP interno
Write-Host "`n2. Testando servidor LDAP interno (10.197.40.6:389)..." -ForegroundColor Yellow
Test-NetConnection -ComputerName "10.197.40.6" -Port 389

# Testar resolução DNS
Write-Host "`n3. Testando resolução DNS..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName "avaliacao.catolicasc.org.br" -ErrorAction Stop
    Write-Host "DNS resolvido com sucesso:" -ForegroundColor Green
    $dnsResult | Select-Object Name, Type, IPAddress | Format-Table
} catch {
    Write-Host "Erro na resolução DNS: $_" -ForegroundColor Red
}

# Testar ping
Write-Host "`n4. Testando ping para servidor LDAP interno..." -ForegroundColor Yellow
Test-Connection -ComputerName "10.197.40.6" -Count 3

Write-Host "`n=== TESTE CONCLUÍDO ===" -ForegroundColor Green
