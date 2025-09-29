import { ENVIRONMENT } from './environment';

// Configuração da API
export const API_CONFIG = {
  // URL base da API - centralizada no arquivo environment.ts
  BASE_URL: process.env.REACT_APP_API_URL || ENVIRONMENT.API_URL,
  
  // Timeout das requisições (em milissegundos)
  TIMEOUT: 120000, // 2 minutos para operações do TOTVS
  
  // Configurações de retry
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Configurações de ambiente
export const ENV_CONFIG = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  API_URL: API_CONFIG.BASE_URL,
};

// Log da configuração atual
console.log("🔧 Configuração da API:", {
  BASE_URL: API_CONFIG.BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  ENVIRONMENT: ENVIRONMENT
});
