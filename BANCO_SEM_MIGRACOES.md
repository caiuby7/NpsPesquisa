# Gerenciamento de Banco sem Migrações Automáticas

## Problema Resolvido
O sistema foi configurado para **não usar migrações automáticas** do Entity Framework para evitar conflitos como o erro:
```
Cannot drop index 'IX_respostasquestoes_RespostaId': needed in a foreign key constraint
```

## Configurações Implementadas

### 1. **DbInitializer.cs**
- Substituído `context.Database.MigrateAsync()` por `context.Database.EnsureCreatedAsync()`
- Adicionado fallback para migrações caso `EnsureCreated` falhe
- Tratamento de erros mais robusto

### 2. **Program.cs**
- Inicialização do banco sem migrações automáticas
- Uso de `EnsureCreated` em vez de `Migrate`

### 3. **appsettings.Development.json**
- Configuração específica para desabilitar migrações em desenvolvimento

## Como Funciona Agora

### **EnsureCreated vs Migrate**
- **EnsureCreated**: Cria o banco e tabelas baseado no modelo atual (sem histórico de migrações)
- **Migrate**: Aplica migrações sequencialmente (pode causar conflitos)

### **Vantagens**
✅ Não há conflitos de migrações  
✅ Inicialização mais rápida  
✅ Menos problemas de compatibilidade  
✅ Funciona bem em ambientes de desenvolvimento  

### **Desvantagens**
❌ Perde histórico de mudanças no banco  
❌ Não preserva dados ao recriar o banco  
❌ Requer cuidado ao fazer mudanças no modelo  

## Scripts Disponíveis

### **1. Gerenciar Banco**
```powershell
# Ver status do banco
.\gerenciar_banco_sem_migrations.ps1 -Action status

# Criar banco
.\gerenciar_banco_sem_migrations.ps1 -Action create

# Recriar banco (remove dados existentes)
.\gerenciar_banco_sem_migrations.ps1 -Action recreate

# Backup
.\gerenciar_banco_sem_migrations.ps1 -Action backup

# Restore
.\gerenciar_banco_sem_migrations.ps1 -Action restore
```

### **2. Correção Manual de Índices**
```sql
-- Execute se necessário
source corrigir_indice_respostaquestao.sql
```

## Quando Usar Migrações vs EnsureCreated

### **Use EnsureCreated quando:**
- Em desenvolvimento
- Banco pode ser recriado sem problemas
- Há conflitos frequentes de migrações
- Equipe pequena com mudanças frequentes

### **Use Migrate quando:**
- Em produção com dados importantes
- Precisa preservar histórico de mudanças
- Múltiplos ambientes (dev, staging, prod)
- Equipe grande com controle de versão rigoroso

## Comandos Úteis

### **Verificar Status do Banco**
```bash
# Conectividade
Test-NetConnection -ComputerName "database-1.c9dpaerguibp.us-east-1.rds.amazonaws.com" -Port 3306

# Verificar índices no MySQL
SHOW INDEX FROM respostasquestoes;
```

### **Recriar Banco Local**
```powershell
# Remove arquivos locais
Remove-Item "NpsPesquisaDb.mdf" -Force
Remove-Item "NpsPesquisaDb_log.ldf" -Force

# Executa aplicação para recriar
dotnet run --project NpsPesquisa.Api
```

## Backup e Restore

### **Backup MySQL**
```bash
mysqldump -h database-1.c9dpaerguibp.us-east-1.rds.amazonaws.com -u admin -p ava_inst > backup.sql
```

### **Restore MySQL**
```bash
mysql -h database-1.c9dpaerguibp.us-east-1.rds.amazonaws.com -u admin -p ava_inst < backup.sql
```

## Monitoramento

### **Logs Importantes**
- Verifique logs da aplicação para erros de inicialização
- Monitore conectividade com banco remoto
- Verifique se índices foram criados corretamente

### **Indicadores de Problema**
- Erro "Cannot drop index" - problema de chave estrangeira
- Erro de conectividade - problema de rede
- Erro de timeout - banco sobrecarregado

## Volta às Migrações (se necessário)

Se quiser voltar a usar migrações:

1. **Descomente as linhas de migração** nos arquivos
2. **Execute**: `dotnet ef migrations add NomeDaMigracao`
3. **Aplique**: `dotnet ef database update`

⚠️ **Atenção**: Isso pode causar conflitos novamente!
