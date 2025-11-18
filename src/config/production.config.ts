// ========================================
// CONFIGURAÇÃO DE PRODUÇÃO - DEPRECATED
// ========================================
// ⚠️  ATENÇÃO: Este arquivo está DEPRECATED!
// Use o arquivo environment.ts como única fonte de configuração

import { ENVIRONMENT } from './environment';

export const PRODUCTION_CONFIG = {
  API_URL: ENVIRONMENT.API_URL,
  NODE_ENV: ENVIRONMENT.NODE_ENV,
  GENERATE_SOURCEMAP: !ENVIRONMENT.IS_PRODUCTION,
  BUILD_OPTIMIZATION: ENVIRONMENT.IS_PRODUCTION,
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
