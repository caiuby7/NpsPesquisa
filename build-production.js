#!/usr/bin/env node

/**
 * Script de Build para Produção
 * Configura as variáveis de ambiente e executa o build otimizado
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build de produção...');

// Configurar variáveis de ambiente para produção
process.env.NODE_ENV = 'production';
process.env.REACT_APP_ENV = 'production';
process.env.REACT_APP_API_URL = 'https://apiavaliacao.catolicasc.org.br/api';
process.env.GENERATE_SOURCEMAP = 'false';

console.log('📋 Configurações de produção:');
console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  - REACT_APP_ENV: ${process.env.REACT_APP_ENV}`);
console.log(`  - REACT_APP_API_URL: ${process.env.REACT_APP_API_URL}`);
console.log(`  - GENERATE_SOURCEMAP: ${process.env.GENERATE_SOURCEMAP}`);

try {
  // Não limpar build anterior para evitar erros
  // const buildDir = path.join(__dirname, 'build');
  // if (fs.existsSync(buildDir)) {
  //   console.log('🧹 Limpando build anterior...');
  //   fs.rmSync(buildDir, { recursive: true, force: true });
  // }

  // Executar build
  console.log('🔨 Executando build...');
  execSync('react-scripts build', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      REACT_APP_ENV: 'production',
      REACT_APP_API_URL: 'https://apiavaliacao.catolicasc.org.br/api',
      NODE_ENV: 'production',
      GENERATE_SOURCEMAP: 'false'
    }
  });

  console.log('✅ Build de produção concluído com sucesso!');
  console.log('📁 Arquivos gerados em: ./build/');
  
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
