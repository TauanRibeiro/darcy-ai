# Darcy AI - Configuração de Produção
# ==================================

# Este arquivo contém todas as configurações necessárias para implantar
# o Darcy AI em um ambiente de produção online.

# --- Arquivos Principais para Deploy ---

## Frontend (Arquivos Estáticos)
- index.html
- script.js
- style.css
- js/ (todos os arquivos)
- css/ (todos os arquivos)
- manifest.json

## Backend Node.js
- backend/server.js (principal)
- backend/package.json
- backend/package-lock.json
- backend/*.js (todos os módulos)

## Backend Python (Opcional - para funcionalidades avançadas)
- python/darcy_api_bridge.py (servidor Flask)
- python/darcy_python_core.py
- python/requirements.txt
- python/*.py (todos os módulos)

# --- Variáveis de Ambiente Necessárias ---

## Para o Backend Node.js:
PORT=3000                    # Porta do servidor (será definida automaticamente em produção)
NODE_ENV=production          # Ambiente de produção

## Para o Backend Python (se usado):
PORT=5000                    # Porta do Flask (será definida automaticamente em produção)
FLASK_ENV=production         # Ambiente Flask de produção

# --- Configurações de Rede ---

## CORS (Cross-Origin Resource Sharing)
# O backend já está configurado para aceitar requisições de:
# - http://localhost:8000 (desenvolvimento local)
# - https://darcy-ai-*.vercel.app (Vercel - domínios gerados automaticamente)
# - Qualquer subdomínio do Vercel

## URLs da API
# O frontend usa js/config.js para definir a URL da API:
# - Desenvolvimento: http://localhost:3000
# - Produção: será configurado automaticamente

# --- Dependências Externas ---

## Node.js (Backend JavaScript)
- express: Servidor web
- cors: Configuração de CORS
- axios: Cliente HTTP (se necessário)

## Python (Backend Python - Opcional)
- flask: Servidor web Python
- flask-cors: CORS para Flask
- aiohttp: Cliente HTTP assíncrono
- pandas, numpy: Análise de dados
- PyPDF2, pymupdf: Processamento de PDF
- Pillow: Processamento de imagens
- pytesseract: OCR (opcional - pode não estar disponível em produção)

# --- Limitações em Ambiente de Produção ---

## OCR (Reconhecimento de Texto em Imagens)
- Funcionalidade dependente do Tesseract OCR
- Pode não estar disponível em serviços de hospedagem gratuitos
- O código foi modificado para ser gracioso quando OCR não está disponível

## Processamento de Arquivos
- Upload de arquivos funciona normalmente
- PDFs são processados corretamente
- Imagens são analisadas, mas OCR pode estar indisponível

# --- Plataformas de Deploy Recomendadas ---

## Frontend (Arquivos Estáticos)
1. **Vercel** (Recomendado)
   - Deploy automático via GitHub
   - CDN global
   - HTTPS automático
   - Domínio gratuito

2. **Netlify**
   - Similar ao Vercel
   - Integração com Git

3. **GitHub Pages**
   - Gratuito para repositórios públicos
   - Limitado a sites estáticos

## Backend Node.js
1. **Vercel** (Recomendado para este projeto)
   - Suporte nativo a Node.js
   - Serverless functions
   - Integração perfeita com frontend

2. **Heroku**
   - Plano gratuito disponível
   - Fácil configuração
   - Suporte a add-ons

3. **Railway**
   - Alternativa moderna ao Heroku
   - Deploy via GitHub

## Backend Python (Opcional)
1. **Railway** (Recomendado para Python)
   - Suporte nativo a Python
   - Deploy fácil

2. **Heroku**
   - Buildpack Python disponível

3. **PythonAnywhere**
   - Especializado em Python
   - Flask nativo

# --- Arquivos de Configuração de Deploy ---

## vercel.json (para Vercel)
```json
{
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

## package.json (root - para deploy conjunto)
```json
{
  "name": "darcy-ai",
  "version": "1.0.0",
  "scripts": {
    "start": "node backend/server.js",
    "build": "echo 'No build step required for static files'"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

# --- Checklist de Deploy ---

## Pré-Deploy
- [ ] Testar localmente com start_darcy.bat
- [ ] Verificar se todas as dependências estão em package.json
- [ ] Confirmar que js/config.js aponta para URL correta
- [ ] Testar funcionalidades principais

## Deploy Frontend
- [ ] Fazer push do código para GitHub
- [ ] Conectar repositório ao Vercel/Netlify
- [ ] Configurar domínio customizado (opcional)
- [ ] Testar site online

## Deploy Backend
- [ ] Verificar variáveis de ambiente
- [ ] Fazer deploy do backend separadamente (se necessário)
- [ ] Atualizar js/config.js com URL do backend
- [ ] Testar APIs online

## Pós-Deploy
- [ ] Testar todas as funcionalidades online
- [ ] Verificar logs de erro
- [ ] Configurar monitoramento (opcional)
- [ ] Documentar URLs finais

# --- URLs Finais (Exemplo) ---
# Frontend: https://darcy-ai.vercel.app
# Backend API: https://darcy-api.vercel.app
# (URLs reais serão geradas durante o deploy)
