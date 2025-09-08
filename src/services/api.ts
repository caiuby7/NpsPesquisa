import axios from 'axios';
import Cookies from 'js-cookie';
import { API_CONFIG } from '../config/api.config';

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  console.log("🔐 Interceptor - Token encontrado:", !!token);
  console.log("🌐 URL da requisição:", config.url);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Token adicionado aos headers");
  } else {
    console.log("⚠️ Token não encontrado nos cookies");
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
    
    if (error.response?.status === 401) {
      console.log("🔒 Usuário não autorizado, removendo cookies");
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
); 