#!/bin/bash
# Script para limpar cache e resolver problemas de ChunkLoadError
# Execute este script quando encontrar erros de carregamento de chunks

echo "Limpando cache e arquivos temporários..."

# Parar o servidor de desenvolvimento se estiver rodando
echo -e "\nParando processos do Node.js..."
pkill -f "react-scripts" || true

# Limpar pasta build
if [ -d "build" ]; then
    echo "Removendo pasta build..."
    rm -rf build
fi

# Limpar cache do npm
echo "Limpando cache do npm..."
npm cache clean --force

# Limpar node_modules e reinstalar (opcional, descomente se necessário)
# echo "Removendo node_modules..."
# rm -rf node_modules
# echo "Reinstalando dependências..."
# npm install

# Limpar cache do webpack (pasta .cache se existir)
if [ -d ".cache" ]; then
    echo "Removendo cache do webpack..."
    rm -rf .cache
fi

# Limpar arquivos temporários do TypeScript
find . -name "*.tsbuildinfo" -type f -delete

echo -e "\nLimpeza concluída!"
echo -e "\nPróximos passos:"
echo "1. Limpe o cache do navegador (Ctrl+Shift+Delete ou Cmd+Shift+Delete)"
echo "2. Execute 'npm start' para iniciar o servidor novamente"
echo "3. Se o problema persistir, descomente as linhas de reinstalação do node_modules acima"

