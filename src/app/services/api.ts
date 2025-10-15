import axios from 'axios'
import Cookies from 'js-cookie'
import { API_CONFIG } from '../../config/api.config'

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
})

// Adiciona o token a cada requisição automaticamente
api.interceptors.request.use((config) => {
  const token = Cookies.get('token') || localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de resposta para tratar erros 401
api.interceptors.response.use(
  (response) => {
    return response
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
        
        // Usar replace para evitar voltar para a página anterior
        window.location.replace('/login');
      } else {
        console.log("🔒 Já está na página de login, não redirecionando");
      }
    }
    
    return Promise.reject(error);
  }
)