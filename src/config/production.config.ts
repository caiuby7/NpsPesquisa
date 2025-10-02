// ========================================
// CONFIGURAÇÃO DE PRODUÇÃO
// ========================================

export const PRODUCTION_CONFIG = {
  API_URL: 'https://apiavaliacao.catolicasc.org.br/api',
  NODE_ENV: 'production',
  GENERATE_SOURCEMAP: false,
  BUILD_OPTIMIZATION: true,
};

// Configurações específicas para build de produção
export const BUILD_CONFIG = {
  // Otimizações de build
  MINIFY: true,
  COMPRESS: true,
  
  // Configurações de performance
  CHUNK_SPLITTING: true,
  TREE_SHAKING: true,
  
  // Configurações de segurança
  SOURCE_MAPS: false,
  DEBUG_INFO: false,
};
