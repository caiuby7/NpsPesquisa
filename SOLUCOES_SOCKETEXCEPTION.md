# Soluções para SocketException

## Problema Identificado
O erro `SocketException: Foi feita uma tentativa de acesso a um soquete de uma maneira que é proibida pelas permissões de acesso` pode estar ocorrendo em várias partes do sistema:

## Possíveis Causas

### 1. **Conexão Oracle TOTVS** (Mais Provável)
- **Servidor**: `200.135.232.1:1521`
- **Problema**: Conexão TCP bloqueada ou servidor indisponível
- **Solução**: Melhor tratamento de erros implementado

### 2. **Conexão LDAP Active Directory**
- **Servidor**: `192.168.40.10:389` ou `dc.catolicasc.org.br:389`
- **Problema**: Firewall ou conectividade de rede
- **Solução**: Tratamento específico para erros LDAP

### 3. **Conexão MySQL AWS**
- **Servidor**: `database-1.c9dpaerguibp.us-east-1.rds.amazonaws.com:3306`
- **Problema**: Limitações de rede ou credenciais

### 4. **Conexão SMTP**
- **Servidor**: `smtp.office365.com:587`
- **Problema**: Bloqueio de porta ou autenticação

## Soluções Implementadas

### ✅ 1. **Melhor Tratamento de Erros**
- Adicionado tratamento específico para `SocketException`
- Tratamento para erros Oracle específicos
- Logs mais detalhados para diagnóstico

### ✅ 2. **Middleware de Tratamento de Erros**
- Captura erros não tratados
- Retorna respostas HTTP apropriadas
- Logs centralizados de erros

### ✅ 3. **Configurações de Rede**
- Timeouts configurados
- Limites de conexão ajustados
- Configurações TLS/SSL otimizadas

### ✅ 4. **Script de Verificação**
- Script PowerShell para testar conectividade
- Verificação de todas as portas utilizadas

## Próximos Passos

### 1. **Executar Verificação de Rede**
```powershell
.\verificar_conectividade.ps1
```

### 2. **Verificar Logs da Aplicação**
- Procure por mensagens específicas de erro
- Identifique qual serviço está falhando

### 3. **Verificar Firewall**
- Porta 1521 (Oracle) deve estar liberada
- Porta 389 (LDAP) deve estar liberada
- Porta 3306 (MySQL) deve estar liberada
- Porta 587 (SMTP) deve estar liberada

### 4. **Verificar Permissões**
- Executar aplicação como administrador (se necessário)
- Verificar políticas de grupo da empresa

### 5. **Configurações Alternativas**
Se o problema persistir, considere:
- Usar conexões SSL/TLS
- Configurar proxy corporativo
- Usar IPs alternativos se disponíveis

## Códigos de Erro Oracle Comuns
- **12541**: TNS:no listener (servidor não está rodando)
- **12535**: TNS:operation timed out (timeout de conexão)
- **12170**: TNS:Connect timeout occurred (timeout de rede)

## Monitoramento
- Verifique os logs da aplicação regularmente
- Monitore a conectividade com os serviços externos
- Configure alertas para falhas de conexão
