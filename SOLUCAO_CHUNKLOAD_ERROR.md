# Solução para ChunkLoadError - Chakra UI

## Problema

Erro de carregamento de chunk do webpack relacionado ao Chakra UI:
```
Loading chunk vendors-node_modules_chakra-ui_react_dist_esm_box_box_mjs-node_modules_chakra-ui_react_dist_e-c8a7a7 failed.
ChunkLoadError
```

## Causas Comuns

1. **Cache desatualizado**: O navegador ou webpack está tentando carregar chunks antigos
2. **Build corrompido**: Arquivos de build podem estar desatualizados ou corrompidos
3. **Diretiva incompatível**: A diretiva `"use client"` do Next.js foi encontrada em um projeto Create React App
4. **Tema não configurado**: O ChakraProvider não estava usando o tema customizado

## Soluções Aplicadas

### 1. Correção do Provider do Chakra UI

**Arquivo**: `src/components/ui/provider.tsx`

**Problema**: A diretiva `"use client"` é específica do Next.js e não é compatível com Create React App.

**Solução**: Removida a diretiva e adicionada a importação do tema customizado:

```typescript
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../../theme";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}
```

### 2. Script de Limpeza de Cache

Criados scripts para limpar cache e resolver problemas de chunks:

- **Windows**: `clear-cache.ps1`
- **Linux/Mac**: `clear-cache.sh`

**Como usar**:
```powershell
# Windows
.\clear-cache.ps1

# Linux/Mac
chmod +x clear-cache.sh
./clear-cache.sh
```

O script faz:
- Para processos do Node.js em execução
- Remove a pasta `build`
- Limpa o cache do npm
- Remove cache do webpack (se existir)
- Remove arquivos temporários do TypeScript

## Passos para Resolver o Erro

### Passo 1: Limpar Cache do Projeto

Execute o script de limpeza:
```powershell
cd form-builder
.\clear-cache.ps1
```

### Passo 2: Limpar Cache do Navegador

1. Abra as ferramentas de desenvolvedor (F12)
2. Clique com o botão direito no botão de atualizar
3. Selecione "Esvaziar cache e atualizar forçadamente" (ou similar)
   
   **OU**

1. Pressione `Ctrl + Shift + Delete` (Windows) ou `Cmd + Shift + Delete` (Mac)
2. Selecione "Imagens e arquivos em cache"
3. Clique em "Limpar dados"

### Passo 3: Reiniciar o Servidor

```bash
npm start
```

### Passo 4: Se o Problema Persistir

Se o erro continuar, pode ser necessário reinstalar as dependências:

1. Edite o script `clear-cache.ps1`
2. Descomente as linhas que removem e reinstalam `node_modules`:
   ```powershell
   Remove-Item -Recurse -Force "node_modules"
   npm install
   ```
3. Execute o script novamente

## Prevenção

Para evitar este problema no futuro:

1. **Sempre limpe o cache** após mudanças significativas no código
2. **Use Hard Refresh** (Ctrl+Shift+R) durante o desenvolvimento
3. **Mantenha as dependências atualizadas** regularmente
4. **Não misture diretivas** de diferentes frameworks (Next.js vs Create React App)

## Verificação

Após aplicar as correções, verifique:

- ✅ O servidor inicia sem erros
- ✅ A aplicação carrega corretamente no navegador
- ✅ Não há erros de chunk no console do navegador
- ✅ Os componentes do Chakra UI renderizam corretamente

## Notas Técnicas

- O projeto usa **Create React App** (react-scripts), não Next.js
- A diretiva `"use client"` é específica do Next.js 13+ com App Router
- O Chakra UI v2.8.2 está configurado com um tema customizado
- O lazy loading de componentes pode causar problemas de chunk se o cache estiver desatualizado

