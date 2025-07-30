# 🤖 Darcy AI - Tutor Educacional com Sistema Modular de LLMs

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TauanRibeiro/darcy-ai)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-green)](https://github.com)
[![Version](https://img.shields.io/badge/Version-2.1.0-blue)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](https://github.com)

> **Darcy AI** é um tutor educacional inteligente com **sistema modular de múltiplas LLMs gratuitas**, equipes especializadas CrewAI, avatar gamificado e capacidades multimodais completas. Funciona 100% sem API keys usando fallback automático entre provedores.

## 🎯 Características Principais

### 🤖 Sistema Modular de LLMs (NOVO!)
- **Múltiplos Provedores**: Ollama Local, Groq, Together AI, Hugging Face, Cohere, Perplexity
- **Fallback Automático**: Se um provedor falha, usa outro automaticamente
- **Health Monitoring**: Monitora saúde dos provedores em tempo real
- **Seleção Inteligente**: Escolhe o melhor provedor para cada tipo de consulta
- **100% Gratuito**: Funciona sem nenhuma API key usando simulação inteligente

### 👥 Sistema CrewAI Multi-Agente
- **Equipe de Ensino**: Especializada em criar lições e explicações didáticas
- **Equipe de Pesquisa**: Busca informações e analisa dados academicamente
- **Equipe Criativa**: Gera projetos e atividades inovadoras
- **Equipe de Avaliação**: Cria testes e avalia progresso construtivamente
- **Fluxos Inteligentes**: Combinação automática de equipes conforme necessário

### 🎮 Sistema de Avatar Gamificado
- **Personalidade Dinâmica**: Avatar com estados emocionais e reações
- **Sistema de XP**: Progressão por níveis baseada em interações 
- **Animações**: Respiração, pensamento, fala e reações visuais
- **Integração com LLMs**: Avatar reage às atividades dos diferentes provedores

### 🎙️ Capacidades Multimodais  
- **Entrada de Áudio**: Reconhecimento de voz em tempo real
- **Entrada de Texto**: Chat tradicional com markdown
- **Processamento de Arquivos**: PDF, Excel, Word, imagens, vídeos
- **Backend Modular**: API inteligente com orquestração de múltiplas LLMs

## 🤖 Provedores LLM Suportados

### 🏠 Ollama Local (Recomendado)
- **Status**: Automático (se instalado)
- **Modelos**: llama3.1, mistral, codellama, phi3, gemma2, qwen2
- **Vantagens**: Privacidade total, sem limites, funciona offline
- **Instalação**: [ollama.com](https://ollama.com)

### ⚡ Groq (Rápido)
- **Status**: Gratuito com limitações
- **Modelos**: llama-3.1-70b, llama-3.1-8b, mixtral-8x7b
- **Vantagens**: Velocidade extrema, boa qualidade
- **Limitações**: ~30 requests/minuto

### 🤗 Hugging Face (Gratuito)
- **Status**: Completamente gratuito
- **Modelos**: DialoGPT, BlenderBot, Flan-T5
- **Vantagens**: Sem custos, muitos modelos
- **Limitações**: Velocidade variável

### 🤖 Together AI (Créditos Gratuitos)
- **Status**: $25 mensais gratuitos
- **Modelos**: Llama-3-70b, Mixtral-8x7B, Nous-Hermes
- **Vantagens**: Modelos avançados, boa performance

### 🧠 Cohere (Trial)
- **Status**: Trial gratuito
- **Modelos**: Command, Command-Light
- **Vantagens**: Boa para texto, API simples

### 🔍 Perplexity AI
- **Status**: Uso gratuito limitado
- **Modelos**: Llama-3.1-Sonar (com busca web)  
- **Vantagens**: Acesso a informações em tempo real

### 🎯 Simulação Inteligente (Fallback)
- **Status**: Sempre disponível
- **Funcionalidade**: Respostas educacionais contextuais
- **Vantagens**: Nunca falha, educacionalmente otimizada

## 🚀 Instalação e Deploy

### Opção 1: Deploy Online (Recomendado)

1. **Fork este repositório** no GitHub
2. **Clique no botão "Deploy with Vercel"** acima
3. **Configure suas chaves de API** nas variáveis de ambiente da Vercel:
   - `OPENAI_API_KEY` (opcional)
   - `ANTHROPIC_API_KEY` (opcional)
4. **Pronto!** Sua instância do Darcy AI estará online

### Opção 2: Executar Localmente

#### Pré-requisitos
- Node.js 18+
- Git

#### Passos
```bash
# 1. Clone o repositório
git clone https://github.com/TauanRibeiro/darcy-ai.git
cd darcy-ai

# 2. Instale as dependências do backend
cd backend
npm install

# 3. Configure as variáveis de ambiente (opcional)
cp .env.example .env
# Edite o .env com suas chaves de API

# 4. Inicie o backend
npm start

# 5. Em outro terminal, sirva o frontend
cd ..
python -m http.server 8000
# ou use: npx serve .

# 6. Acesse http://localhost:8000
```

## 📁 Estrutura do Projeto

```
darcy-ai/
├── index.html                    # Página principal
├── style.css                     # Estilos principais
├── script.js                     # Inicialização da app
├── package.json                  # Configuração do projeto
├── vercel.json                   # Configuração para deploy
├── .gitignore                    # Arquivos ignorados pelo Git
├── js/                           # Módulos JavaScript
│   ├── config.js                 # Configurações
│   ├── utils.js                  # Utilitários
│   ├── storage.js                # Gerenciamento local
│   ├── ui-manager.js             # Interface do usuário
│   ├── chat-interface.js         # Sistema de chat
│   ├── llm-providers.js          # Integrações LLM
│   ├── avatar-system.js          # Avatar gamificado
│   ├── multimodal-system.js      # Entrada multimodal
│   ├── crew-ai-integration.js    # Sistema CrewAI
│   └── crew-ai-chat-interface.js # Interface CrewAI
├── css/                          # Estilos específicos
│   ├── avatar-multimodal.css     # Estilos do avatar
│   └── crew-ai-styles.css        # Estilos do CrewAI
└── backend/                      # Servidor Node.js
    ├── package.json              # Dependências do backend
    ├── server.js                 # Servidor principal
    └── crew-ai-logic.js          # Lógica dos agentes
```

## 🤖 Como Usar o CrewAI

### Modos de Conversação

1. **Darcy Individual**: Modo tradicional de chat
2. **Equipe de Ensino**: Para lições estruturadas e explicações
3. **Equipe de Pesquisa**: Para buscar informações e analisar dados
4. **Equipe Criativa**: Para projetos e atividades inovadoras
5. **Equipe de Avaliação**: Para testes e feedback de progresso

### Exemplos de Uso

```
💬 "Explique física quântica" (Equipe de Ensino)
🔍 "Pesquise sobre energia renovável" (Equipe de Pesquisa)  
🎨 "Crie um projeto sobre o sistema solar" (Equipe Criativa)
📊 "Avalie meu conhecimento em matemática" (Equipe de Avaliação)
```

## ⚙️ Configuração Avançada

### Variáveis de Ambiente

Para usar APIs de IA em nuvem, configure estas variáveis:

```env
# OpenAI (opcional)
OPENAI_API_KEY=sk-...

# Anthropic Claude (opcional)
ANTHROPIC_API_KEY=sk-ant-...

# Cohere (opcional)
COHERE_API_KEY=...
```

### Ollama Local (Gratuito)

Para usar IA local sem chaves de API:

```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelos
ollama pull llama2
ollama pull mistral

# Verificar se está funcionando
curl http://localhost:11434/api/tags
```

## 🔧 Desenvolvimento

### Requisitos
- Node.js 18+
- Navegador moderno
- Git

### Scripts Úteis

```bash
# Desenvolvimento local
npm run dev

# Build para produção  
npm run build

# Deploy na Vercel
vercel --prod
```

### Arquitetura

O projeto usa uma arquitetura moderna **Frontend + Backend**:

- **Frontend**: Interface web com JavaScript vanilla
- **Backend**: API Node.js para orquestração de agentes
- **CrewAI**: Sistema de agentes especializados
- **Deploy**: Configurado para Vercel (frontend + serverless functions)

## 🎯 Roadmap

### ✅ Versão 2.1 (Atual)
- [x] **Sistema CrewAI** completo
- [x] **Backend Node.js** para orquestração
- [x] **Deploy na Vercel** com um clique
- [x] **Avatar gamificado** integrado

### 🚧 Versão 2.2 (Em Breve)
- [ ] **Ferramentas reais** para agentes (APIs externas)
- [ ] **Processamento de arquivos** no backend
- [ ] **Análise de documentos** com IA
- [ ] **Geração de conteúdo** interativo

### 🔮 Versão 3.0 (Futuro)
- [ ] **Editor de equipes** pela comunidade
- [ ] **Integração com LMS** (Moodle, Google Classroom)
- [ ] **Analytics** de aprendizado
- [ ] **Modo colaborativo** em tempo real

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
3. **Commit** suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. **Push** para a branch: `git push origin feature/nova-funcionalidade`
5. **Abra** um Pull Request

### Diretrizes de Contribuição

- Use **ESLint** para formatação
- Escreva testes para novas funcionalidades
- Documente mudanças no CHANGELOG.md
- Siga o padrão de commits convencionais

## 📜 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎓 Sobre o Projeto

**Darcy AI** foi criado como parte de uma pesquisa acadêmica da **Universidade de Brasília**, com foco em:

- **Democratização** do acesso à educação com IA
- **Open Source** para transparência e colaboração
- **Eficiência** para funcionar com recursos limitados
- **Acessibilidade** para todos os tipos de usuários

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/TauanRibeiro/darcy-ai/issues)
- **Discussões**: [GitHub Discussions](https://github.com/TauanRibeiro/darcy-ai/discussions)
- **Email**: darcy.ai@unb.br
- **Discord**: [Servidor da Comunidade](https://discord.gg/darcy-ai)

## 🙏 Agradecimentos

- **UnB** - Universidade de Brasília
- **Ollama** - Por tornar LLMs locais acessíveis
- **VLibras** - Acessibilidade em Libras
- **Comunidade Open Source** - Por todas as bibliotecas utilizadas

---

<div align="center">
  <strong>Feito com ❤️ para democratizar a educação com IA</strong>
  <br>
  <sub>Universidade de Brasília - 2024</sub>
</div>
