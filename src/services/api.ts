import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL } from '../config/api-url';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutos
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token') || localStorage.getItem('token');
  console.log("🔐 Interceptor - Token encontrado:", !!token);
  console.log("🌐 URL da requisição:", config.url);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Token adicionado aos headers");
  } else {
    console.log("⚠️ Token não encontrado nos cookies nem localStorage");
  }
  
  return config;
}, (error) => {
  console.error("❌ Erro no interceptor de request:", error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    console.log("✅ Resposta recebida:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Erro na resposta:", error.response?.status, error.config?.url);
    console.error("📋 Dados do erro:", error.response?.data);
    
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
    
    // Preservar os dados de erro para que possam ser acessados no catch
    return Promise.reject(error);
  }
); 
