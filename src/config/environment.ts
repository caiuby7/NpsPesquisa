// ========================================
// CONFIGURAÇÃO CENTRALIZADA DE AMBIENTE
// ========================================
// ⚠️  IMPORTANTE: Este é o ÚNICO lugar onde a URL da API deve ser definida!

// Configurações de ambiente
const ENV_CONFIG = {
  // 🚀 PRODUÇÃO
  PRODUCTION: {
    API_URL: 'https://apiavaliacao.catolicasc.org.br/api',
    NODE_ENV: 'production',
    DEBUG: false
  },
  
  // 🛠️ DESENVOLVIMENTO
  DEVELOPMENT: {
    API_URL: 'http://localhost:5000/api',
    NODE_ENV: 'development',
    DEBUG: true
  }
};

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isProdHost =
  hostname !== '' &&
  hostname !== 'localhost' &&
  hostname !== '127.0.0.1' &&
  hostname !== '0.0.0.0';

const isProduction =
  process.env.REACT_APP_ENV === 'production' ||
  isProdHost;

// Selecionar configuração baseada no ambiente
const resolveApiUrl = () => {
  if (isProdHost) {
    return ENV_CONFIG.PRODUCTION.API_URL;
  }

  return process.env.REACT_APP_API_URL || ENV_CONFIG.DEVELOPMENT.API_URL;
};

const currentConfig = isProduction ? ENV_CONFIG.PRODUCTION : ENV_CONFIG.DEVELOPMENT;

// ========================================
// CONFIGURAÇÃO FINAL - ÚNICA FONTE DE VERDADE
// ========================================
export const ENVIRONMENT = {
  // URL da API - ÚNICA FONTE DE VERDADE
  API_URL: resolveApiUrl(),
  
  // Flags de ambiente
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: !isProduction,
  
  // Configurações adicionais
  NODE_ENV: currentConfig.NODE_ENV,
  DEBUG: currentConfig.DEBUG,
  
  // Timeout e configurações de API
  API_TIMEOUT: 120000, // 2 minutos
  API_RETRY_ATTEMPTS: 3,
  API_RETRY_DELAY: 1000,
};

// Log da configuração atual (sempre)
console.log("🔧 CONFIGURAÇÃO CENTRALIZADA CARREGADA:", {
  API_URL: ENVIRONMENT.API_URL,
  IS_PRODUCTION: ENVIRONMENT.IS_PRODUCTION,
  IS_DEVELOPMENT: ENVIRONMENT.IS_DEVELOPMENT,
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  REACT_APP_ENV: process.env.REACT_APP_ENV,
  HOSTNAME: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
  CURRENT_CONFIG: currentConfig.API_URL
});
