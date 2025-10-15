# 🔒 Redirecionamento Automático para Login (Erro 401)

## 📋 Resumo

Implementado redirecionamento automático para a página de login quando o backend retorna erro 401 (Unauthorized). O sistema agora limpa automaticamente os dados de autenticação e redireciona o usuário para login.

## ✅ Implementação

### **1. Interceptors do Axios Atualizados**

#### **Arquivo Principal:** `src/services/api.ts`
```typescript
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("🔒 Usuário não autorizado (401), limpando dados de autenticação");
      
      // Limpar todos os dados de autenticação
      Cookies.remove('token');
      Cookies.remove('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Verificar se já está na página de login para evitar loop
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/login' || currentPath === '/login-totvs';
      
      if (!isLoginPage) {
        console.log("🔄 Redirecionando para página de login");
        window.location.replace('/login');
      } else {
        console.log("🔒 Já está na página de login, não redirecionando");
      }
    }
    
    return Promise.reject(error);
  }
);
```

#### **Arquivo Alternativo:** `src/app/services/api.ts`
- Mesmo interceptor implementado para consistência
- Garante que todas as requisições Axios sejam tratadas

### **2. Utilitário para Fetch**

#### **Arquivo:** `src/utils/api-fetch.ts` (NOVO)
```typescript
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    // Adicionar token de autorização se disponível
    const token = Cookies.get('token') || localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Verificar se é erro 401
    if (response.status === 401) {
      console.log("🔒 Erro 401 detectado, limpando dados de autenticação");
      clearAuthData();
      
      if (shouldRedirectToLogin()) {
        redirectToLogin();
      }
      
      throw new Error('Unauthorized: Token expirado ou inválido');
    }

    return response;
  } catch (error) {
    throw error;
  }
}
```

### **3. Funções Utilitárias**

#### **Funções Disponíveis:**
- `apiFetch(url, options)` - Fetch genérico com tratamento de 401
- `apiGet(url, options)` - Requisição GET
- `apiPost(url, data, options)` - Requisição POST
- `apiPut(url, data, options)` - Requisição PUT
- `apiDelete(url, options)` - Requisição DELETE
- `apiFetchJson<T>(url, options)` - Fetch que retorna JSON automaticamente

## 🔄 Comportamento

### **✅ Quando Ocorre 401:**
1. **Limpeza Automática:**
   - Remove token dos cookies
   - Remove dados do usuário dos cookies
   - Remove token do localStorage
   - Remove dados do usuário do localStorage

2. **Redirecionamento Inteligente:**
   - Verifica se já está na página de login
   - Evita loops de redirecionamento
   - Usa `window.location.replace()` para não permitir voltar

3. **Logs Detalhados:**
   - Console mostra quando 401 é detectado
   - Logs de limpeza de dados
   - Logs de redirecionamento

### **✅ Páginas de Login Reconhecidas:**
- `/login` - Login normal
- `/login-totvs` - Login TOTVS

### **✅ Proteção Contra Loops:**
- Não redireciona se já estiver em página de login
- Evita redirecionamentos infinitos

## 📁 Arquivos Atualizados

### **Interceptors Axios:**
- ✅ `src/services/api.ts` - Interceptor principal atualizado
- ✅ `src/app/services/api.ts` - Interceptor alternativo adicionado

### **Utilitário Fetch:**
- ✅ `src/utils/api-fetch.ts` - Novo arquivo com funções utilitárias

### **Arquivos Convertidos:**
- ✅ `src/pages/dashboards/aluno-dashboard.tsx` - Usa `apiFetch`
- ✅ `src/pages/avaliacoes/criar-avaliacao.component.tsx` - Usa `apiFetchJson`

## 🎯 Cenários de Teste

### **Teste 1: Token Expirado**
1. Fazer login normalmente
2. Aguardar token expirar (ou simular)
3. Fazer qualquer requisição
4. **Resultado:** Redirecionamento automático para `/login`

### **Teste 2: Token Inválido**
1. Alterar token manualmente no localStorage
2. Fazer requisição
3. **Resultado:** Redirecionamento automático para `/login`

### **Teste 3: Já na Página de Login**
1. Estar na página `/login`
2. Fazer requisição que retorna 401
3. **Resultado:** Não redireciona (evita loop)

### **Teste 4: Requisições Fetch**
1. Usar `apiFetch` ou `apiFetchJson`
2. Simular 401
3. **Resultado:** Redirecionamento automático

## 🔍 Logs de Debug

### **Console do Navegador:**
```javascript
// Quando 401 é detectado:
🔒 Usuário não autorizado (401), limpando dados de autenticação
🔄 Redirecionando para página de login

// Se já estiver na página de login:
🔒 Já está na página de login, não redirecionando
```

### **Network Tab:**
- Requisição retorna 401
- Redirecionamento para `/login`
- Dados de autenticação limpos

## 🚨 Importante

### **⚠️ Requisições Axios:**
- **Cobertas automaticamente** pelos interceptors
- **Não precisa alterar** código existente
- **Funciona em todas** as requisições

### **⚠️ Requisições Fetch:**
- **Precisa usar** `apiFetch` ou funções utilitárias
- **Converter gradualmente** requisições existentes
- **Prioridade:** Requisições críticas primeiro

### **⚠️ Compatibilidade:**
- **Mantém funcionalidade** existente
- **Adiciona proteção** automática
- **Não quebra** código atual

## 🔄 Migração Gradual

### **Para Converter Requisições Fetch:**

#### **ANTES:**
```typescript
const response = await fetch(API_URLS.ENDPOINT, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

#### **DEPOIS:**
```typescript
const data = await apiFetchJson(API_URLS.ENDPOINT);
```

### **Benefícios da Conversão:**
- ✅ Tratamento automático de 401
- ✅ Código mais limpo
- ✅ Menos repetição
- ✅ Headers automáticos

## 📊 Status

**🎯 IMPLEMENTAÇÃO CONCLUÍDA**

- ✅ Interceptors Axios configurados
- ✅ Utilitário fetch criado
- ✅ Arquivos principais convertidos
- ✅ Proteção contra loops
- ✅ Logs de debug implementados
- ✅ Documentação completa

**Sistema protegido contra erros 401!** 🔒

---

**Data:** 14 de outubro de 2025  
**Status:** ✅ Concluído  
**Cobertura:** Axios + Fetch
