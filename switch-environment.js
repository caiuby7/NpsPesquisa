#!/usr/bin/env node

/**
 * Script para alternar entre ambiente de desenvolvimento e produção
 * 
 * Uso:
 * node switch-environment.js dev    - Aponta para desenvolvimento
 * node switch-environment.js prod   - Aponta para produção
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, 'src/config/environment.ts');

const ENVIRONMENTS = {
  dev: {
    comment: '🛠️ DESENVOLVIMENTO',
    url: 'http://localhost:5000/api',
    active: true
  },
  prod: {
    comment: '🚀 PRODUÇÃO',
    url: 'https://apiavaliacao.catolicasc.org.br/api',
    active: false
  }
};

function switchEnvironment(targetEnv) {
  if (!ENVIRONMENTS[targetEnv]) {
    console.error(`❌ Ambiente inválido: ${targetEnv}`);
    console.log('Ambientes disponíveis: dev, prod');
    process.exit(1);
  }

  console.log(`🔄 Alterando para ambiente: ${targetEnv.toUpperCase()}`);

  // Ler arquivo atual
  let content = fs.readFileSync(ENV_FILE, 'utf8');

  // Atualizar URLs
  Object.keys(ENVIRONMENTS).forEach(env => {
    const envConfig = ENVIRONMENTS[env];
    const isActive = env === targetEnv;
    
    // Comentar/descomentar a URL
    const urlPattern = new RegExp(`(//\\s*)?const API_URL = '${envConfig.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}';`, 'g');
    
    if (isActive) {
      // Descomentar (ativar)
      content = content.replace(urlPattern, `const API_URL = '${envConfig.url}';`);
    } else {
      // Comentar (desativar)
      content = content.replace(urlPattern, `// const API_URL = '${envConfig.url}';`);
    }
  });

  // Escrever arquivo atualizado
  fs.writeFileSync(ENV_FILE, content);

  console.log(`✅ Ambiente alterado para: ${targetEnv.toUpperCase()}`);
  console.log(`📍 URL da API: ${ENVIRONMENTS[targetEnv].url}`);
  console.log('');
  console.log('📝 Próximos passos:');
  console.log('   1. Reinicie o servidor de desenvolvimento (npm start)');
  console.log('   2. Verifique o console do navegador para confirmar a URL');
  console.log('');
}

function showCurrentEnvironment() {
  const content = fs.readFileSync(ENV_FILE, 'utf8');
  
  console.log('🔍 Ambiente atual:');
  console.log('');
  
  let activeEnv = null;
  Object.keys(ENVIRONMENTS).forEach(env => {
    const envConfig = ENVIRONMENTS[env];
    const isActive = content.includes(`const API_URL = '${envConfig.url}';`);
    
    if (isActive) {
      activeEnv = { env, config: envConfig };
    }
  });
  
  if (activeEnv) {
    console.log(`   ${activeEnv.config.comment}: ✅ ATIVO`);
    console.log(`   URL: ${activeEnv.config.url}`);
    console.log('');
  } else {
    console.log('   ❌ Nenhum ambiente ativo encontrado');
    console.log('');
  }
}

// Verificar argumentos
const targetEnv = process.argv[2];

if (!targetEnv) {
  showCurrentEnvironment();
  console.log('💡 Uso: node switch-environment.js [dev|prod]');
  process.exit(0);
}

switchEnvironment(targetEnv);
