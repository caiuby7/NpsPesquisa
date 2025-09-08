# Configuração da API

## URL da API

O frontend está configurado para usar a API local por padrão:

- **Desenvolvimento Local**: `http://localhost:5000/api`
- **Produção**: Configurável via variável de ambiente

## Configuração

### 1. Desenvolvimento Local (Padrão)
A API está configurada para usar `localhost:5000` automaticamente quando não há variável de ambiente definida.

### 2. Configuração via Variável de Ambiente
Para alterar a URL da API, você pode definir a variável de ambiente:

```bash
# Windows (PowerShell)
$env:REACT_APP_API_URL="https://sua-api.com/api"

# Windows (CMD)
set REACT_APP_API_URL=https://sua-api.com/api

# Linux/Mac
export REACT_APP_API_URL=https://sua-api.com/api
```

### 3. Arquivo .env.local (Recomendado para desenvolvimento)
Crie um arquivo `.env.local` na raiz do projeto:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Arquivos de Configuração

- **`src/config/api.config.ts`** - Configuração centralizada da API
- **`src/app/services/api.ts`** - Cliente Axios principal
- **`src/services/api.ts`** - Cliente Axios alternativo

## Estrutura da URL

A URL base é automaticamente concatenada com os endpoints:

```
Base: http://localhost:5000/api
Endpoint: /Questionario
URL Final: http://localhost:5000/api/Questionario
```

## Verificação

Para verificar se a configuração está correta, abra o console do navegador na página do dashboard. Você verá a mensagem:

```
API Base URL: http://localhost:5000/api
```

## Troubleshooting

### Problema: API não responde
1. Verifique se o backend está rodando na porta 5000
2. Verifique se não há firewall bloqueando a porta
3. Verifique se a URL está correta no console

### Problema: CORS
1. Verifique se o backend está configurado para aceitar requisições de `localhost:3000`
2. Verifique se o middleware de CORS está ativo

### Problema: Variável de ambiente não funciona
1. Reinicie o servidor de desenvolvimento após definir a variável
2. Verifique se o nome da variável está correto: `REACT_APP_API_URL`
3. Verifique se não há espaços extras na definição
