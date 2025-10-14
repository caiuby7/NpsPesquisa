# 🔧 Configuração de Ambientes - Frontend

## 📋 Resumo

O frontend está configurado para apontar para **PRODUÇÃO** por padrão:
- **URL da API:** `https://apiavaliacao.catolicasc.org.br/api`
- **Ambiente:** Produção

## 🚀 Como Alternar Entre Ambientes

### **Método 1: Script Automático (Recomendado)**

```bash
# Para PRODUÇÃO
node switch-environment.js prod

# Para DESENVOLVIMENTO  
node switch-environment.js dev

# Ver ambiente atual
node switch-environment.js
```

### **Método 2: Edição Manual**

Edite o arquivo `src/config/environment.ts`:

#### **Para PRODUÇÃO:**
```typescript
// 🚀 PRODUÇÃO
const API_URL = 'https://apiavaliacao.catolicasc.org.br/api';

// 🛠️ DESENVOLVIMENTO
// const API_URL = 'http://localhost:5000/api';
```

#### **Para DESENVOLVIMENTO:**
```typescript
// 🚀 PRODUÇÃO
// const API_URL = 'https://apiavaliacao.catolicasc.org.br/api';

// 🛠️ DESENVOLVIMENTO
const API_URL = 'http://localhost:5000/api';
```

### **Método 3: Variável de Ambiente**

```bash
# Windows (PowerShell)
$env:REACT_APP_API_URL="https://apiavaliacao.catolicasc.org.br/api"

# Windows (CMD)
set REACT_APP_API_URL=https://apiavaliacao.catolicasc.org.br/api

# Linux/Mac
export REACT_APP_API_URL=https://apiavaliacao.catolicasc.org.br/api
```

## 📁 Arquivos de Configuração

### **Principais:**
- `src/config/environment.ts` - Configuração principal
- `src/config/api.config.ts` - Configuração da API
- `src/config/api-urls.ts` - URLs centralizadas

### **Scripts:**
- `switch-environment.js` - Script para alternar ambientes
- `src/config/production.config.ts` - Configurações de produção

## 🔗 URLs Centralizadas

Todas as URLs da API estão centralizadas em `src/config/api-urls.ts`:

```typescript
export const API_URLS = {
  BASE: ENVIRONMENT.API_URL,
  AVALIACOES_DISPONIVEIS: `${ENVIRONMENT.API_URL}/AvaliacoesDisponiveis`,
  INSTITUICOES: `${ENVIRONMENT.API_URL}/instituicoes`,
  PERIODOS_LETIVOS: `${ENVIRONMENT.API_URL}/periodosletivos`,
  CURSOS: `${ENVIRONMENT.API_URL}/cursos`,
  TURMAS: `${ENVIRONMENT.API_URL}/turmas`,
  DISCIPLINAS: `${ENVIRONMENT.API_URL}/disciplinas`,
  PROFESSORES: `${ENVIRONMENT.API_URL}/professores`,
  COORDENADORES: `${ENVIRONMENT.API_URL}/coordenadores`,
  AVALIACAO_CRIAR: `${ENVIRONMENT.API_URL}/avaliacao/criar`,
  AVALIACAO_FILTROS: `${ENVIRONMENT.API_URL}/avaliacao/filtros/participantes`,
  // ... outras URLs
};
```

## ✅ Verificação da Configuração

### **1. Console do Navegador**
Abra o console (F12) e procure por:
```
🔧 Ambiente configurado: {
  API_URL: "https://apiavaliacao.catolicasc.org.br/api",
  IS_PRODUCTION: true,
  IS_DEVELOPMENT: false
}

🔗 URLs da API configuradas: {
  BASE: "https://apiavaliacao.catolicasc.org.br/api",
  ENVIRONMENT: "PRODUÇÃO"
}
```

### **2. Network Tab**
Verifique se as requisições estão sendo feitas para a URL correta:
- ✅ **Produção:** `https://apiavaliacao.catolicasc.org.br/api/*`
- ❌ **Desenvolvimento:** `http://localhost:5000/api/*`

### **3. Teste de Conectividade**
Faça login e verifique se:
- ✅ Dashboard carrega corretamente
- ✅ Avaliações aparecem
- ✅ Não há erros de CORS
- ✅ Requisições retornam dados

## 🔄 Processo de Deploy

### **Para Deploy em Produção:**

1. **Verificar Ambiente:**
   ```bash
   node switch-environment.js
   # Deve mostrar: 🚀 PRODUÇÃO: ✅ ATIVO
   ```

2. **Build de Produção:**
   ```bash
   npm run build
   ```

3. **Verificar Build:**
   - Abrir `build/index.html` no navegador
   - Verificar console para confirmar URL de produção

4. **Deploy:**
   - Fazer upload da pasta `build/` para o servidor
   - Configurar servidor web (nginx, apache, etc.)

### **Para Desenvolvimento Local:**

1. **Alterar para Desenvolvimento:**
   ```bash
   node switch-environment.js dev
   ```

2. **Iniciar Servidor:**
   ```bash
   npm start
   ```

3. **Verificar:**
   - URL deve ser `http://localhost:3000`
   - API deve apontar para `http://localhost:5000/api`

## 🚨 Troubleshooting

### **Problema: CORS Error**
- ✅ **Produção:** Backend deve aceitar requisições de `https://seudominio.com`
- ✅ **Desenvolvimento:** Backend deve aceitar requisições de `http://localhost:3000`

### **Problema: 404 Not Found**
- ✅ Verificar se a URL da API está correta
- ✅ Verificar se o backend está rodando
- ✅ Verificar se o endpoint existe

### **Problema: Token Inválido**
- ✅ Verificar se o token está sendo enviado
- ✅ Verificar se o token não expirou
- ✅ Verificar se o backend está validando o token

### **Problema: Variável de Ambiente Não Funciona**
- ✅ Reiniciar o servidor após definir a variável
- ✅ Verificar se a variável está no formato correto
- ✅ Verificar se não há espaços extras

## 📊 Status Atual

**✅ CONFIGURADO PARA PRODUÇÃO**

- **API URL:** `https://apiavaliacao.catolicasc.org.br/api`
- **Ambiente:** Produção
- **Status:** Pronto para deploy
- **URLs:** Centralizadas e configuradas
- **Scripts:** Disponíveis para alternância

## 🎯 Próximos Passos

1. **Teste em Produção:** Verificar se todas as funcionalidades estão funcionando
2. **Monitoramento:** Acompanhar logs de erro e performance
3. **Backup:** Manter configuração de desenvolvimento disponível
4. **Documentação:** Atualizar documentação de deploy conforme necessário

---

**Última atualização:** 14 de outubro de 2025  
**Status:** ✅ Configurado para Produção
