// ========================================
// CONFIGURAÇÃO DE AMBIENTE - ALTERE AQUI
// ========================================

// 🚀 PRODUÇÃO
// const API_URL = 'https://apiavaliacao.catolicasc.org.br/api';

// 🛠️ DESENVOLVIMENTO
const API_URL = 'http://localhost:5000/api';

// ========================================
// EXPORTANDO CONFIGURAÇÕES
// ========================================
export const ENVIRONMENT = {
  API_URL,
  IS_PRODUCTION: API_URL.includes('catolicasc.org.br'),
  IS_DEVELOPMENT: API_URL.includes('localhost'),
};

// Log da configuração atual
console.log("🔧 Ambiente configurado:", {
  API_URL: ENVIRONMENT.API_URL,
  IS_PRODUCTION: ENVIRONMENT.IS_PRODUCTION,
  IS_DEVELOPMENT: ENVIRONMENT.IS_DEVELOPMENT
});
