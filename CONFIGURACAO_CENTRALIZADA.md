# 🔧 Configuração Centralizada da API

## ⚠️ IMPORTANTE: ÚNICA FONTE DE VERDADE

**TODAS as configurações de URL da API devem vir do arquivo `src/config/environment.ts`**

## 📁 Arquivo Principal

```
src/config/environment.ts
```

Este é o **ÚNICO** lugar onde a URL da API deve ser definida.

## 🚀 Como Usar

### 1. Importar a configuração
```typescript
import { ENVIRONMENT } from '../config/environment';
```

### 2. Usar a URL da API
```typescript
const API_URL = ENVIRONMENT.API_URL;
```

### 3. Verificar ambiente
```typescript
if (ENVIRONMENT.IS_DEVELOPMENT) {
  console.log('Modo desenvolvimento');
}
```

## 🔄 Detecção Automática de Ambiente

A configuração detecta automaticamente o ambiente baseado em:

1. **Variável de ambiente**: `process.env.NODE_ENV`
2. **Variável customizada**: `process.env.REACT_APP_ENV`
3. **Hostname**: `window.location.hostname.includes('catolicasc.org.br')`

## 📋 Configurações Disponíveis

```typescript
export const ENVIRONMENT = {
  // URL da API - ÚNICA FONTE DE VERDADE
  API_URL: string,
  
  // Flags de ambiente
  IS_PRODUCTION: boolean,
  IS_DEVELOPMENT: boolean,
  
  // Configurações adicionais
  NODE_ENV: string,
  DEBUG: boolean,
  
  // Timeout e configurações de API
  API_TIMEOUT: number,
  API_RETRY_ATTEMPTS: number,
  API_RETRY_DELAY: number,
};
```

## ❌ O QUE NÃO FAZER

```typescript
// ❌ ERRADO - URL hardcoded
const API_URL = 'https://apiavaliacao.catolicasc.org.br/api';

// ❌ ERRADO - Múltiplas fontes
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ❌ ERRADO - Configuração duplicada
const API_URL = 'http://localhost:5000/api';
```

## ✅ O QUE FAZER

```typescript
// ✅ CORRETO - Usar configuração centralizada
import { ENVIRONMENT } from '../config/environment';
const API_URL = ENVIRONMENT.API_URL;
```

## 🔧 Alterando o Ambiente

### Para Desenvolvimento
```bash
# No arquivo .env
REACT_APP_API_URL=http://localhost:5000/api
```

### Para Produção
```bash
# No arquivo .env
REACT_APP_API_URL=https://apiavaliacao.catolicasc.org.br/api
```

## 📝 Arquivos Atualizados

- ✅ `src/config/environment.ts` - Configuração centralizada
- ✅ `src/config/api.config.ts` - Usa configuração centralizada
- ✅ `src/pages/login-totvs/totvs-login.service.ts` - Usa configuração centralizada
- ✅ `src/pages/participantes-formulario/[id].tsx` - Usa configuração centralizada
- ✅ `src/app/pages/*/` - Todos os componentes Next.js atualizados
- ✅ `src/config/production.config.ts` - Usa configuração centralizada

## 🎯 Benefícios

1. **Consistência**: Todas as URLs vêm do mesmo lugar
2. **Manutenibilidade**: Mudança em um lugar afeta toda a aplicação
3. **Detecção automática**: Ambiente detectado automaticamente
4. **Debug**: Logs automáticos em desenvolvimento
5. **Flexibilidade**: Suporte a variáveis de ambiente

## 🚨 Troubleshooting

### Problema: URL ainda apontando para produção
**Solução**: Limpar cache do navegador e reiniciar o servidor de desenvolvimento

### Problema: Configuração não está sendo aplicada
**Solução**: Verificar se o import está correto e se não há URLs hardcoded

### Problema: Ambiente não detectado corretamente
**Solução**: Verificar variáveis de ambiente e hostname
