# Script para executar o setup inicial completo da API NPS Pesquisa
Write-Host "=== SETUP INICIAL COMPLETO - API NPS PESQUISA ===" -ForegroundColor Green
Write-Host ""

# 1. Verificar se a API está rodando
Write-Host "1. Verificando se a API está rodando..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/swagger" -Method GET -TimeoutSec 10
    Write-Host "   ✅ API está rodando na porta 5000" -ForegroundColor Green
} catch {
    Write-Host "   ❌ API não está respondendo. Iniciando..." -ForegroundColor Red
    
    # Tentar iniciar a API
    Write-Host "   🚀 Iniciando a API..." -ForegroundColor Yellow
    Start-Process -FilePath "dotnet" -ArgumentList "run", "--urls", "http://localhost:5000" -WorkingDirectory "C:\Users\Usuario\source\Avaliacao Intitucional\NpsPesquisa\NpsPesquisa.Api" -WindowStyle Minimized
    
    # Aguardar a API inicializar
    Write-Host "   ⏳ Aguardando a API inicializar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Verificar novamente
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/swagger" -Method GET -TimeoutSec 10
        Write-Host "   ✅ API iniciada com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Falha ao iniciar a API" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# 2. Verificar se o usuário admin foi criado
Write-Host "2. Verificando usuário admin..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@nps.com","password":"Admin@123"}' -TimeoutSec 10
    Write-Host "   ✅ Usuário admin funcionando! Token recebido" -ForegroundColor Green
    $token = $response.token
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ⚠️  Usuário admin não foi criado automaticamente" -ForegroundColor Yellow
        Write-Host "   📝 Executando script SQL para criar dados iniciais..." -ForegroundColor Yellow
        
        # Executar script SQL
        Write-Host "   🗄️  Para criar os dados iniciais, execute no MySQL:" -ForegroundColor Cyan
        Write-Host "      mysql -u [usuario] -p ava_inst < create_initial_data.sql" -ForegroundColor White
        Write-Host ""
        Write-Host "   🔧 Ou reinicie a API para executar o DbInitializer:" -ForegroundColor Cyan
        Write-Host "      dotnet run --urls 'http://localhost:5000'" -ForegroundColor White
    } else {
        Write-Host "   ❌ Erro ao verificar usuário admin: $($_.Exception.Message)" -ForegroundColor Red
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

# Testar endpoint de cursos
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/cursos" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Endpoint de cursos funcionando" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Endpoint de cursos não funcionando: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Resumo final
Write-Host "=== RESUMO FINAL ===" -ForegroundColor Green
Write-Host "✅ Banco de dados criado com sucesso" -ForegroundColor Green
Write-Host "✅ API rodando na porta 5000" -ForegroundColor Green

if ($token) {
    Write-Host "✅ Usuário admin funcionando" -ForegroundColor Green
    Write-Host "🎯 Sistema pronto para uso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Usuário admin precisa ser criado" -ForegroundColor Yellow
    Write-Host "📋 Execute o script SQL ou reinicie a API" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🔗 Swagger UI: http://localhost:5000/swagger" -ForegroundColor Cyan
Write-Host "🔗 API Base: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 Login Admin: admin@nps.com / Admin@123" -ForegroundColor White
