# Darcy AI - Instruções de Instalação e Teste

## 📋 Pré-requisitos

1. **Node.js** (versão 16 ou superior)
2. **npm** (versão 8 ou superior)
3. **Git** (opcional, para clonar o repositório)

### Para funcionalidades completas:
- **Ollama** (para LLM local) - [Instalar Ollama](https://ollama.ai)
- **FFmpeg** (para processamento de áudio) - [Instalar FFmpeg](https://ffmpeg.org/download.html)

## 🚀 Instalação

### 1. Frontend
O frontend funciona diretamente no navegador. Abra `index.html` em qualquer navegador moderno ou use um servidor local:

```bash
# Usando Python (se disponível)
python -m http.server 8000

# Usando Node.js (se disponível)
npx serve .

# Usando Live Server no VS Code
# Instale a extensão "Live Server" e clique em "Go Live"
```

### 2. Backend (Opcional - para funcionalidades avançadas)

```bash
# 1. Navegue para a pasta do backend
cd backend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Edite o arquivo .env com suas configurações
# Use seu editor preferido para configurar as chaves de API
notepad .env  # Windows
# ou
code .env     # VS Code
```

### 3. Configuração do arquivo .env

Edite o arquivo `backend/.env` com suas configurações:

```env
# Configurações do servidor
PORT=3001
NODE_ENV=development

# URLs dos LLM providers
OLLAMA_URL=http://localhost:11434
OPENAI_API_URL=https://api.openai.com/v1
ANTHROPIC_API_URL=https://api.anthropic.com/v1
COHERE_API_URL=https://api.cohere.ai/v1

# Chaves de API (opcional - configure apenas as que você vai usar)
OPENAI_API_KEY=sua_chave_openai_aqui
ANTHROPIC_API_KEY=sua_chave_anthropic_aqui
COHERE_API_KEY=sua_chave_cohere_aqui

# Configurações de upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,docx,txt,jpg,jpeg,png,gif,mp3,wav,m4a

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## ▶️ Execução

### Modo Frontend-Only (Funcionalidade básica)
1. Abra `index.html` no navegador
2. Configure um provider (Ollama local ou chaves de API na seção "Configurações")
3. Comece a usar o Darcy AI!

### Modo Completo (Frontend + Backend)

```bash
# Terminal 1: Inicie o backend
cd backend
npm start
# ou para desenvolvimento com auto-reload:
npm run dev

# Terminal 2: Sirva o frontend (se necessário)
# Abra index.html no navegador ou use um servidor local
python -m http.server 8000
```

## 🧪 Testes

### Teste Frontend
1. Abra `index.html` no navegador
2. Vá para "Configurações" e configure um provider
3. Teste uma conversa simples
4. Teste upload de arquivo (se backend estiver rodando)
5. Teste busca na web

### Teste Backend
```bash
cd backend

# Teste de saúde da API
curl http://localhost:3001/api/health

# Teste de providers disponíveis
curl http://localhost:3001/api/providers

# Executar testes automatizados (se configurados)
npm test
```

### Testes de Funcionalidades

#### 1. Teste de Chat Básico
- Envie uma mensagem simples como "Olá, como você pode me ajudar?"
- Verifique se a resposta é adequada

#### 2. Teste de Upload de Arquivo
- Faça upload de um arquivo PDF ou Word
- Verifique se o conteúdo é processado corretamente

#### 3. Teste de Busca na Web
- Digite uma pergunta começando com "Buscar na web:"
- Verifique se os resultados são incorporados na resposta

#### 4. Teste de Diferentes Providers
- Configure diferentes providers (Ollama, OpenAI, etc.)
- Teste a mudança entre eles

## 🔧 Configuração Avançada

### Ollama Local
```bash
# Instalar Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Baixar um modelo (exemplo: Llama 2)
ollama pull llama2

# Verificar modelos instalados
ollama list

# Testar Ollama
curl http://localhost:11434/api/generate \
  -d '{
    "model": "llama2",
    "prompt": "Why is the sky blue?",
    "stream": false
  }'
```

### FFmpeg (para processamento de áudio)
```bash
# Windows (usando Chocolatey)
choco install ffmpeg

# Windows (usando Scoop)
scoop install ffmpeg

# Linux (Ubuntu/Debian)
sudo apt update && sudo apt install ffmpeg

# macOS (usando Homebrew)
brew install ffmpeg
```

## 📊 Estrutura do Projeto

```
darcy/
├── index.html              # Interface principal
├── style.css              # Estilos principais
├── script.js              # Script principal
├── js/                    # Módulos JavaScript
│   ├── config.js         # Configurações
│   ├── storage.js        # Gerenciamento de dados
│   ├── llm-providers.js  # Integração com LLMs
│   ├── chat-interface.js # Interface de chat
│   ├── file-handler.js   # Manipulação de arquivos
│   ├── settings-panel.js # Painel de configurações
│   ├── ui-manager.js     # Gerenciamento da UI
│   └── utils.js          # Utilitários
├── icons/                 # Ícones da aplicação
├── backend/              # Backend Node.js (opcional)
│   ├── server.js         # Servidor principal
│   ├── services/         # Serviços do backend
│   ├── middleware/       # Middlewares
│   ├── .env.example      # Exemplo de configuração
│   └── package.json      # Dependências do backend
└── README.md             # Este arquivo
```

## ❗ Solução de Problemas

### Backend não inicia
```bash
# Verifique se as dependências estão instaladas
cd backend && npm install

# Verifique se a porta está disponível
netstat -an | findstr :3001

# Verifique os logs
npm start
```

### Ollama não conecta
```bash
# Verifique se o Ollama está rodando
curl http://localhost:11434/api/tags

# Reinicie o serviço Ollama
ollama serve
```

### Upload de arquivos não funciona
- Certifique-se de que o backend está rodando na porta 3001
- Verifique os tipos de arquivo permitidos no `.env`
- Confirme o limite de tamanho dos arquivos

### Erro de CORS
- Certifique-se de que o backend está configurado corretamente
- Verifique se as origens permitidas estão corretas

## 🔄 Atualizações

Para atualizar o projeto:

```bash
# Atualize as dependências do backend
cd backend
npm update

# Limpe o cache se necessário
npm cache clean --force
```

## 📞 Suporte

Se você encontrar problemas:

1. Verifique este README primeiro
2. Consulte os logs do console do navegador (F12)
3. Verifique os logs do backend (terminal onde npm start foi executado)
4. Certifique-se de que todas as dependências estão instaladas
5. Verifique se as portas necessárias estão disponíveis

## 🎯 Próximos Passos

Após a instalação bem-sucedida:

1. **Configure seus providers favoritos** na seção "Configurações"
2. **Experimente diferentes contextos** (Educação Geral, Teoria Musical, Pesquisa)
3. **Teste upload de diferentes tipos de arquivo**
4. **Explore as funcionalidades de busca na web**
5. **Personalize a interface** conforme suas necessidades

---

**Darcy AI** - Seu tutor educacional inteligente e personalizado! 🚀
