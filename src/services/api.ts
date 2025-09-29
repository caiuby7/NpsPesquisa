import axios from 'axios';
import Cookies from 'js-cookie';
import { API_CONFIG } from '../config/api.config';

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
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
      console.log("🔒 Usuário não autorizado, removendo cookies e localStorage");
      Cookies.remove('token');
      Cookies.remove('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Só redirecionar para login se não estiver em uma página de questionário
      const currentPath = window.location.pathname;
      const isQuestionarioPage = currentPath.includes('/questionario/') || currentPath.includes('/responder/');
      
      if (!isQuestionarioPage) {
        window.location.href = '/login';
      } else {
        console.log("🔒 Em página de questionário, não redirecionando para login");
      }
    }
    
    // Preservar os dados de erro para que possam ser acessados no catch
    return Promise.reject(error);
  }
); 
