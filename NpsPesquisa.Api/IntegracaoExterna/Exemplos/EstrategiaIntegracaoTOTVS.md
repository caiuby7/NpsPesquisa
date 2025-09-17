# Estratégia de Integração TOTVS

## 🎯 **Recomendação: Abordagem Híbrida**

### **🔄 Background Service (Principal)**
- **Frequência**: A cada 6 horas
- **Escopo**: Sincronização completa do período letivo atual
- **Objetivo**: Manter dados sempre atualizados automaticamente

### **🎯 Filtro de Participantes (Complementar)**
- **Trigger**: Quando usuário filtrar participantes
- **Escopo**: Sincronização sob demanda com filtros específicos
- **Objetivo**: Dados em tempo real para filtros específicos

## 📊 **Comparação das Abordagens**

| Aspecto | Background Service | Filtro de Participantes |
|---------|-------------------|-------------------------|
| **Automação** | ✅ Totalmente automático | ❌ Manual |
| **Performance** | ✅ Não bloqueia UI | ⚠️ Pode ser lento |
| **Dados Atualizados** | ✅ Sempre atualizados | ✅ Tempo real |
| **Controle** | ❌ Menos controle | ✅ Controle total |
| **Recursos** | ✅ Otimizado | ⚠️ Pode ser custoso |
| **Confiabilidade** | ✅ Retry automático | ❌ Depende do usuário |

## ⚙️ **Implementação Recomendada**

### **1. Background Service (TotvsBackgroundService)**

```csharp
public class TotvsBackgroundService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Aguardar 6 horas
            await Task.Delay(TimeSpan.FromHours(6), stoppingToken);
            
            // Sincronizar apenas se há questionários ativos
            if (await TemQuestionariosAtivos())
            {
                var periodoAtual = await ObterPeriodoLetivoAtual();
                await _totvsService.SincronizarAlunosAsync(periodoAtual);
                await _totvsService.SincronizarProfessoresAsync(periodoAtual);
            }
        }
    }
}
```

**Características:**
- ✅ **Inteligente**: Só sincroniza se há questionários ativos
- ✅ **Eficiente**: Foca no período letivo atual
- ✅ **Confiável**: Retry automático em caso de falha
- ✅ **Logs**: Rastreamento completo de execuções

### **2. Endpoint Melhorado para Filtros**

```csharp
[HttpGet("participantes/disponiveis-para-questionario/{questionarioId}")]
public async Task<ActionResult> GetParticipantesDisponiveis(
    int questionarioId,
    [FromQuery] bool sincronizarTOTVS = false,
    [FromQuery] bool forcarSincronizacao = false)
{
    if (sincronizarTOTVS)
    {
        // Verificar se precisa sincronizar
        var precisaSincronizar = forcarSincronizacao || 
            DadosSaoAntigos();
            
        if (precisaSincronizar)
        {
            await _totvsService.SincronizarAlunosAsync(periodoLetivo);
            await _totvsService.SincronizarProfessoresAsync(periodoLetivo);
        }
    }
    
    // Filtrar participantes...
}
```

**Características:**
- ✅ **Opcional**: Sincronização sob demanda
- ✅ **Inteligente**: Verifica se dados são recentes
- ✅ **Flexível**: Permite forçar sincronização
- ✅ **Filtros**: Múltiplos critérios de filtro

## 🚀 **Benefícios da Abordagem Híbrida**

### **1. Melhor dos Dois Mundos**
- **Automação**: Dados sempre atualizados via background
- **Flexibilidade**: Sincronização sob demanda quando necessário

### **2. Performance Otimizada**
- **Background**: Processa em horários de baixo uso
- **Sob Demanda**: Apenas quando realmente necessário

### **3. Experiência do Usuário**
- **Transparente**: Usuário não precisa se preocupar com sincronização
- **Controle**: Pode forçar atualização quando necessário

### **4. Confiabilidade**
- **Redundância**: Duas formas de manter dados atualizados
- **Fallback**: Se background falhar, usuário pode forçar sincronização

## 📋 **Configuração Recomendada**

### **appsettings.json**
```json
{
  "TotvsBackgroundService": {
    "IntervaloHoras": 6,
    "SincronizarApenasComQuestionariosAtivos": true,
    "LogDetalhado": true
  },
  "TotvsSincronizacao": {
    "TimeoutMinutos": 30,
    "RetryTentativas": 3,
    "CacheValidadeHoras": 2
  }
}
```

### **Registro no Program.cs**
```csharp
// Background Services
builder.Services.AddHostedService<LembreteBackgroundService>();
builder.Services.AddHostedService<TotvsBackgroundService>();

// TOTVS Service
builder.Services.AddScoped<ITotvsService, TotvsService>();
```

## 🎯 **Cenários de Uso**

### **Cenário 1: Uso Normal**
1. **Background Service** sincroniza a cada 6 horas
2. **Usuário** filtra participantes normalmente
3. **Dados** sempre atualizados automaticamente

### **Cenário 2: Dados Urgentes**
1. **Usuário** precisa de dados muito recentes
2. **Marca** `sincronizarTOTVS=true` no filtro
3. **Sistema** sincroniza sob demanda
4. **Retorna** dados em tempo real

### **Cenário 3: Problema no Background**
1. **Background Service** falha por algum motivo
2. **Usuário** percebe dados desatualizados
3. **Marca** `forcarSincronizacao=true`
4. **Sistema** força sincronização imediatamente

## 📊 **Monitoramento**

### **Logs do Background Service**
```
[INFO] Iniciando sincronização automática com TOTVS...
[INFO] Sincronizando dados do período letivo: 2024/1
[INFO] Sincronização TOTVS concluída - Alunos: 1250, Professores: 85
[INFO] Aguardando 6 horas para próxima sincronização...
```

### **Logs do Filtro de Participantes**
```
[INFO] Iniciando sincronização TOTVS sob demanda para questionário 123
[INFO] Dados TOTVS são recentes, pulando sincronização
[INFO] Retornando 45 participantes disponíveis
```

## 🎯 **Conclusão**

A **abordagem híbrida** oferece:

- ✅ **Automação** para manutenção contínua
- ✅ **Flexibilidade** para necessidades específicas  
- ✅ **Performance** otimizada
- ✅ **Confiabilidade** com redundância
- ✅ **Experiência** superior do usuário

**Esta estratégia garante que os dados TOTVS estejam sempre atualizados, com a flexibilidade de sincronização sob demanda quando necessário!** 🚀
