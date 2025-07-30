// Configuration file for Darcy AI
const CONFIG = {
    // App Information
    APP_NAME: 'Darcy AI',
    VERSION: '2.0.0',
    DESCRIPTION: 'Tutor Educacional Open Source',
    
    // Backend Configuration - Detecção automática de ambiente
    BACKEND_URL: (() => {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Ambiente local (desenvolvimento)
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }
        
        // Ambiente de produção no Vercel
        if (hostname.includes('vercel.app')) {
            return `${protocol}//${hostname}`;
        }
        
        // Ambiente de produção personalizado
        if (hostname.includes('darcy-ai')) {
            return `${protocol}//${hostname}`;
        }
        
        // Fallback para desenvolvimento
        return 'http://localhost:3000';
    })(),
    
    // API Endpoints (Backend)
    ENDPOINTS: {
        CHAT: '/api/chat',
        UPLOAD: '/api/upload',
        SEARCH: '/api/search',
        HEALTH: '/api/health',
        PROVIDERS: '/api/providers',
        MODELS: '/api/providers/:provider/models'
    },
    
    // Fallback Endpoints (Direct API calls)
    FALLBACK_ENDPOINTS: {
        OLLAMA: 'http://localhost:11434/api/generate',
        OPENAI: 'https://api.openai.com/v1/chat/completions',
        ANTHROPIC: 'https://api.anthropic.com/v1/messages',
        COHERE: 'https://api.cohere.ai/v1/generate'
    },
    
    // Default Settings
    DEFAULTS: {
        PROVIDER: 'ollama',
        MODEL: 'llama2',
        MAX_TOKENS: 1000,
        TEMPERATURE: 0.7,
        VOICE_ENABLED: false,
        SAVE_HISTORY: true,
        THEME: 'light',
        USE_BACKEND: true // Usar backend por padrão
    },
    
    // Models by Provider
    MODELS: {
        ollama: [
            { id: 'llama2', name: 'Llama 2', size: '7B' },
            { id: 'llama2:13b', name: 'Llama 2', size: '13B' },
            { id: 'codellama', name: 'Code Llama', size: '7B' },
            { id: 'mistral', name: 'Mistral', size: '7B' },
            { id: 'neural-chat', name: 'Neural Chat', size: '7B' }
        ],
        openai: [
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
            { id: 'gpt-4', name: 'GPT-4' },
            { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo' }
        ],
        anthropic: [
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
            { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
            { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' }
        ],
        cohere: [
            { id: 'command', name: 'Command' },
            { id: 'command-nightly', name: 'Command Nightly' }
        ]
    },
    
    // File Upload Settings
    FILE_UPLOAD: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: {
            documents: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'],
            images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            audio: ['mp3', 'wav', 'ogg', 'm4a'],
            video: ['mp4', 'webm', 'avi', 'mov']
        }
    },
    
    // UI Settings
    UI: {
        MAX_MESSAGE_LENGTH: 2000,
        TYPING_DELAY: 50,
        AUTO_SCROLL_DELAY: 100,
        TOAST_DURATION: 3000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },
    
    // Educational Prompts
    EDUCATIONAL_PROMPTS: {
        MUSIC_THEORY: `Você é o Darcy, um tutor especializado em educação musical. 
                       Responda de forma didática, com exemplos práticos e sempre incentive o aprendizado.
                       Use uma linguagem acessível mas tecnicamente correta.`,
        
        GENERAL_EDUCATION: `Você é o Darcy, um tutor educacional especializado em pedagogia. 
                           Adapte sua resposta ao nível do estudante e use metodologias ativas de ensino.
                           Sempre forneça exemplos práticos e exercícios quando apropriado.`,
        
        RESEARCH: `Você é o Darcy, um assistente de pesquisa acadêmica. 
                   Forneça informações precisas, fontes confiáveis quando possível, 
                   e ajude a estruturar o pensamento crítico sobre o tema.`
    },
    
    // Quick Actions
    QUICK_ACTIONS: [
        {
            id: 'web-search',
            icon: '🔍',
            label: 'Buscar na Web',
            prompt: 'Busque informações na web sobre: '
        },
        {
            id: 'explain',
            icon: '💡',
            label: 'Explicar Conceito',
            prompt: 'Explique de forma didática o conceito de: '
        },
        {
            id: 'practice',
            icon: '🎯',
            label: 'Exercícios',
            prompt: 'Crie exercícios práticos sobre: '
        },
        {
            id: 'summarize',
            icon: '📋',
            label: 'Resumir',
            prompt: 'Faça um resumo estruturado sobre: '
        }
    ],
    
    // Storage Keys
    STORAGE_KEYS: {
        SETTINGS: 'darcy_settings',
        CHAT_HISTORY: 'darcy_chat_history',
        API_KEYS: 'darcy_api_keys',
        THEME: 'darcy_theme',
        BACKEND_STATUS: 'darcy_backend_status'
    },
    
    // Error Messages
    ERROR_MESSAGES: {
        NETWORK: 'Erro de conexão. Verifique sua internet e tente novamente.',
        BACKEND_UNAVAILABLE: 'Backend indisponível. Usando modo offline.',
        RATE_LIMIT: 'Muitas requisições. Aguarde um momento e tente novamente.',
        FILE_TOO_LARGE: 'Arquivo muito grande. Tamanho máximo: 10MB',
        UNSUPPORTED_FILE: 'Tipo de arquivo não suportado.',
        PROCESSING_ERROR: 'Erro ao processar requisição. Tente novamente.'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
