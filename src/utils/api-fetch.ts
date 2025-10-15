/**
 * Utilitário para fazer requisições fetch com tratamento automático de erro 401
 * Redireciona automaticamente para login quando o token expira
 */

import Cookies from 'js-cookie';

/**
 * Função para limpar dados de autenticação
 */
function clearAuthData() {
  console.log("🔒 Limpando dados de autenticação");
  Cookies.remove('token');
  Cookies.remove('user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Função para verificar se deve redirecionar para login
 */
function shouldRedirectToLogin(): boolean {
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath === '/login' || currentPath === '/login-totvs';
  return !isLoginPage;
}

/**
 * Função para redirecionar para login
 */
function redirectToLogin() {
  console.log("🔄 Redirecionando para página de login");
  window.location.replace('/login');
}

/**
 * Wrapper para fetch com tratamento automático de 401
 * @param url - URL da requisição
 * @param options - Opções do fetch
 * @returns Promise<Response>
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    // Adicionar token de autorização se disponível
    const token = Cookies.get('token') || localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
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
      
      // Rejeitar a promise para que o código que chama possa tratar o erro
      throw new Error('Unauthorized: Token expirado ou inválido');
    }

    return response;
  } catch (error) {
    // Se for erro de rede ou outro erro, rejeitar normalmente
    throw error;
  }
}

/**
 * Função para fazer requisições GET com tratamento de 401
 */
export async function apiGet(url: string, options: RequestInit = {}): Promise<Response> {
  return apiFetch(url, {
    method: 'GET',
    ...options,
  });
}

/**
 * Função para fazer requisições POST com tratamento de 401
 */
export async function apiPost(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
  return apiFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * Função para fazer requisições PUT com tratamento de 401
 */
export async function apiPut(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
  return apiFetch(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * Função para fazer requisições DELETE com tratamento de 401
 */
export async function apiDelete(url: string, options: RequestInit = {}): Promise<Response> {
  return apiFetch(url, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * Função para fazer requisições e retornar JSON automaticamente
 */
export async function apiFetchJson<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}
