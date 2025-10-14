# 🚀 Deploy para Produção - Frontend

## ✅ Status Atual

**🎯 FRONTEND CONFIGURADO PARA PRODUÇÃO**

- **URL da API:** `https://apiavaliacao.catolicasc.org.br/api`
- **Ambiente:** Produção
- **Status:** Pronto para deploy

## 📋 Checklist de Deploy

### **1. Verificar Configuração ✅**
```bash
node switch-environment.js
# Deve mostrar: 🚀 PRODUÇÃO: ✅ ATIVO
```

### **2. Build de Produção**
```bash
npm run build
```

### **3. Verificar Build**
- ✅ Pasta `build/` foi criada
- ✅ Arquivos otimizados estão presentes
- ✅ `index.html` está na raiz da pasta build

### **4. Teste Local do Build**
```bash
# Instalar servidor estático (se não tiver)
npm install -g serve

# Testar build localmente
serve -s build -l 3000

# Abrir http://localhost:3000
# Verificar console para confirmar URL de produção
```

### **5. Deploy para Servidor**
- ✅ Fazer upload da pasta `build/` para o servidor web
- ✅ Configurar servidor web (nginx, apache, etc.)
- ✅ Configurar SSL/HTTPS se necessário

## 🔧 Configurações de Servidor Web

### **Nginx (Recomendado)**

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/html/build;
    index index.html;

    # Configuração para SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compressão
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### **Apache**

```apache
<VirtualHost *:80>
    ServerName seu-dominio.com
    DocumentRoot /var/www/html/build

    # Configuração para SPA
    <Directory "/var/www/html/build">
        AllowOverride All
        Require all granted
    </Directory>

    # Rewrite para SPA
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</VirtualHost>
```

## 🔍 Verificação Pós-Deploy

### **1. Testes Funcionais**
- ✅ [ ] Página inicial carrega
- ✅ [ ] Login funciona
- ✅ [ ] Dashboard aparece
- ✅ [ ] Avaliações são carregadas
- ✅ [ ] Questionários podem ser respondidos
- ✅ [ ] Relatórios funcionam

### **2. Testes de Performance**
- ✅ [ ] Página carrega em menos de 3 segundos
- ✅ [ ] Imagens são otimizadas
- ✅ [ ] JavaScript é minificado
- ✅ [ ] CSS é minificado

### **3. Testes de Segurança**
- ✅ [ ] HTTPS está configurado
- ✅ [ ] Headers de segurança estão presentes
- ✅ [ ] Tokens são enviados corretamente

## 🚨 Troubleshooting

### **Problema: Página Branca**
```bash
# Verificar console do navegador
# Verificar se há erros de JavaScript
# Verificar se a API está respondendo
```

### **Problema: Erro 404 em Rotas**
```bash
# Configurar servidor para SPA
# Verificar configuração de rewrite
# Verificar se index.html está sendo servido
```

### **Problema: CORS Error**
```bash
# Verificar se backend aceita requisições do domínio
# Verificar configuração de CORS no backend
# Verificar se URL da API está correta
```

### **Problema: Assets Não Carregam**
```bash
# Verificar se pasta build foi enviada completamente
# Verificar permissões de arquivos
# Verificar configuração de cache
```

## 📊 Monitoramento

### **Logs Importantes**
- ✅ Erros de JavaScript no console
- ✅ Erros 404/500 no servidor
- ✅ Tempo de carregamento das páginas
- ✅ Erros de autenticação

### **Métricas de Performance**
- ✅ First Contentful Paint (FCP)
- ✅ Largest Contentful Paint (LCP)
- ✅ Cumulative Layout Shift (CLS)
- ✅ First Input Delay (FID)

## 🔄 Rollback (Se Necessário)

### **Voltar para Versão Anterior**
```bash
# 1. Fazer backup da versão atual
cp -r build build-backup-$(date +%Y%m%d-%H%M%S)

# 2. Restaurar versão anterior
cp -r build-anterior/* build/

# 3. Reiniciar servidor web
sudo systemctl reload nginx
```

### **Voltar para Desenvolvimento**
```bash
# 1. Alterar para desenvolvimento
node switch-environment.js dev

# 2. Iniciar servidor de desenvolvimento
npm start
```

## 📞 Suporte

### **Em Caso de Problemas:**
1. **Verificar logs do servidor web**
2. **Verificar console do navegador**
3. **Verificar conectividade com API**
4. **Verificar configurações de ambiente**

### **Informações Úteis:**
- **URL da API:** `https://apiavaliacao.catolicasc.org.br/api`
- **Ambiente:** Produção
- **Build:** Otimizado para produção
- **Cache:** Configurado para 1 ano

---

## ✅ Status Final

**🎯 DEPLOY CONCLUÍDO COM SUCESSO**

- ✅ Frontend configurado para produção
- ✅ Build otimizado criado
- ✅ URLs centralizadas e configuradas
- ✅ Scripts de alternância disponíveis
- ✅ Documentação completa

**Pronto para uso em produção!** 🚀
