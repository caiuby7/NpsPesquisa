import { ENVIRONMENT } from './environment';

// ========================================
// CONFIGURAÇÃO DA API - CENTRALIZADA
// ========================================
// ⚠️  IMPORTANTE: Todas as configurações vêm do environment.ts

export const API_CONFIG = {
  // URL base da API - ÚNICA FONTE DE VERDADE
  BASE_URL: ENVIRONMENT.API_URL,
  
  // Timeout das requisições
  TIMEOUT: ENVIRONMENT.API_TIMEOUT,
  
  // Configurações de retry
  RETRY_ATTEMPTS: ENVIRONMENT.API_RETRY_ATTEMPTS,
  RETRY_DELAY: ENVIRONMENT.API_RETRY_DELAY,
};

// Re-exportar configurações do environment para compatibilidade
export const ENV_CONFIG = {
  IS_DEVELOPMENT: ENVIRONMENT.IS_DEVELOPMENT,
  IS_PRODUCTION: ENVIRONMENT.IS_PRODUCTION,
  API_URL: ENVIRONMENT.API_URL,
  DEBUG: ENVIRONMENT.DEBUG,
};

// Log apenas em desenvolvimento
if (ENVIRONMENT.IS_DEVELOPMENT) {
  console.log("🔧 API Config carregada:", {
    BASE_URL: API_CONFIG.BASE_URL,
    TIMEOUT: API_CONFIG.TIMEOUT,
    ENVIRONMENT: ENVIRONMENT
  });
}
