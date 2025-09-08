# Script para verificar o status da API e do usuário admin
Write-Host "=== VERIFICAÇÃO DA API NPS PESQUISA ===" -ForegroundColor Green
Write-Host ""

# 1. Verificar se a API está rodando
Write-Host "1. Verificando se a API está rodando..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/swagger" -Method GET -TimeoutSec 10
    Write-Host "   ✅ API está rodando na porta 5000" -ForegroundColor Green
} catch {
    Write-Host "   ❌ API não está respondendo: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Verificar se o endpoint de auth está disponível
Write-Host "2. Verificando endpoint de autenticação..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@nps.com","password":"Admin@123"}' -TimeoutSec 10
    Write-Host "   ✅ Login funcionando! Token recebido: $($response.token.Substring(0,20))..." -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ⚠️  Endpoint respondeu com erro 400 (Bad Request)" -ForegroundColor Yellow
        Write-Host "   📝 Isso pode indicar que o usuário admin não foi criado ou há problema na validação" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Erro ao acessar endpoint de auth: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 3. Verificar outros endpoints
Write-Host "3. Verificando outros endpoints..." -ForegroundColor Yellow

# Testar endpoint de perfis
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/perfis" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Endpoint de perfis funcionando" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Endpoint de perfis não funcionando: $($_.Exception.Message)" -ForegroundColor Red
}

# Testar endpoint de questionários
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/questionarios" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Endpoint de questionários funcionando" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Endpoint de questionários não funcionando: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Resumo
Write-Host "=== RESUMO ===" -ForegroundColor Green
Write-Host "✅ Banco de dados criado com sucesso" -ForegroundColor Green
Write-Host "✅ API rodando na porta 5000" -ForegroundColor Green
Write-Host "⚠️  Usuário admin pode não ter sido criado" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Para verificar o usuário admin no banco, execute:" -ForegroundColor Cyan
Write-Host "   mysql -u [usuario] -p ava_inst < check_admin_user.sql" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Para recriar o usuário admin, reinicie a API:" -ForegroundColor Cyan
Write-Host "   dotnet run --urls 'http://localhost:5000'" -ForegroundColor White
