// Darcy AI - Frontend Configuration for Modular LLM System
// Updated configuration for the enhanced backend

window.DarcyConfig = {
    // Backend API Configuration
    API: {
        BASE_URL: window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : 'https://darcy-ai-seven.vercel.app',
        
        ENDPOINTS: {
            CREW_EXECUTE: '/api/v1/crew/execute',
            CREW_EXECUTE_VERCEL: '/api/index',
            STATUS: '/api/status',
            HEALTH: '/api/health',
            PROVIDERS: '/api/providers'
        },
        
        TIMEOUT: 30000,
        MAX_RETRIES: 3
    },

    // Crew Configuration
    CREWS: {
        teaching: {
            name: 'Equipe de Ensino',
            icon: '👨‍🏫',
            color: '#4F46E5',
            description: 'Especializada em explicações didáticas e estruturadas',
            capabilities: ['Ensino estruturado', 'Exemplos práticos', 'Metodologia clara'],
            avatar: {
                mood: 'teaching',
                animation: 'explaining'
            }
        },
        research: {
            name: 'Equipe de Pesquisa',
            icon: '🔍',
            color: '#059669',
            description: 'Focada em análise acadêmica e informações verificáveis',
            capabilities: ['Pesquisa acadêmica', 'Análise de dados', 'Verificação de fontes'],
            avatar: {
                mood: 'researching',
                animation: 'analyzing'
            }
        },
        creative: {
            name: 'Equipe Criativa',
            icon: '🎨',
            color: '#DC2626',
            description: 'Desenvolve projetos inovadores e atividades envolventes',
            capabilities: ['Projetos inovadores', 'Atividades interativas', 'Metodologias únicas'],
            avatar: {
                mood: 'creative',
                animation: 'creating'
            }
        },
        assessment: {
            name: 'Equipe de Avaliação',
            icon: '📊',
            color: '#7C3AED',
            description: 'Cria avaliações construtivas e feedback personalizado',
            capabilities: ['Avaliação formativa', 'Exercícios progressivos', 'Feedback construtivo'],
            avatar: {
                mood: 'evaluating',
                animation: 'assessing'
            }
        }
    },

    // LLM Providers Information (for UI display)
    PROVIDERS: {
        'Ollama Local': {
            icon: '🏠',
            color: '#10B981',
            status: 'recommended',
            description: 'IA local - sem necessidade de internet'
        },
        'Groq API': {
            icon: '⚡',
            color: '#F59E0B',
            status: 'fast',
            description: 'API rápida - gratuita com limitações'
        },
        'Together AI': {
            icon: '🤖',
            color: '#8B5CF6',
            status: 'powerful',
            description: 'Modelos avançados - créditos gratuitos'
        },
        'Hugging Face': {
            icon: '🤗',
            color: '#EF4444',
            status: 'free',
            description: 'Completamente gratuito - velocidade variável'
        },
        'Simulação': {
            icon: '🧠',
            color: '#6B7280',
            status: 'fallback',
            description: 'Modo inteligente quando LLMs não estão disponíveis'
        }
    },

    // UI Configuration
    UI: {
        THEMES: {
            default: {
                primary: '#4F46E5',
                secondary: '#10B981',
                accent: '#F59E0B',
                background: '#F8FAFC',
                surface: '#FFFFFF',
                text: '#1F2937'
            },
            dark: {
                primary: '#6366F1',
                secondary: '#34D399',
                accent: '#FBBF24',
                background: '#111827',
                surface: '#1F2937',
                text: '#F9FAFB'
            }
        },
        
        ANIMATIONS: {
            duration: {
                fast: 200,
                normal: 300,
                slow: 500
            },
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        
        NOTIFICATIONS: {
            duration: 5000,
            position: 'top-right'
        }
    },

    // Feature Flags
    FEATURES: {
        MODULAR_LLM: true,
        PROVIDER_SWITCHING: true,
        HEALTH_MONITORING: true,
        FALLBACK_MODE: true,
        VOICE_INTERFACE: true,
        FILE_UPLOAD: true,
        AVATAR_SYSTEM: true,
        GAMIFICATION: true
    },

    // Performance Configuration
    PERFORMANCE: {
        DEBOUNCE_DELAY: 300,
        CACHE_TTL: 300000, // 5 minutes
        MAX_MESSAGE_LENGTH: 10000,
        TYPING_INDICATOR_DELAY: 1000
    },

    // Educational Content
    EDUCATIONAL: {
        WELCOME_MESSAGES: [
            "🎓 Olá! Sou o Darcy AI, seu tutor inteligente com sistema modular de IA.",
            "🤖 Agora uso múltiplos provedores LLM para oferecer as melhores respostas.",
            "🔄 Se um provedor não estiver disponível, automaticamente uso outro!",
            "👥 Escolha uma equipe especializada ou converse comigo diretamente."
        ],
        
        QUICK_ACTIONS: [
            { text: "Explique um conceito", crew: "teaching", icon: "👨‍🏫" },
            { text: "Pesquise informações", crew: "research", icon: "🔍" },
            { text: "Crie um projeto", crew: "creative", icon: "🎨" },
            { text: "Avalie conhecimento", crew: "assessment", icon: "📊" }
        ],
        
        EXAMPLES: {
            teaching: [
                "Explique física quântica de forma simples",
                "Como funciona a fotossíntese?",
                "Ensine-me sobre inteligência artificial"
            ],
            research: [
                "Pesquise sobre energia renovável",
                "Analise dados sobre mudanças climáticas",
                "Verifique informações sobre vacinas"
            ],
            creative: [
                "Crie um projeto sobre o sistema solar",
                "Desenvolva uma atividade de matemática divertida",
                "Proponha um experimento de química"
            ],
            assessment: [
                "Avalie meu conhecimento em história",
                "Crie exercícios de português",
                "Teste minha compreensão de biologia"
            ]
        }
    },

    // Error Messages
    ERRORS: {
        NETWORK: "Erro de conexão. Verifique sua internet e tente novamente.",
        TIMEOUT: "A solicitação demorou muito. Tente novamente ou use outro provedor.",
        INVALID_CREW: "Equipe não encontrada. Escolha entre: Ensino, Pesquisa, Criativa ou Avaliação.",
        SERVER_ERROR: "Erro interno do servidor. Nosso sistema tentará usar outro provedor automaticamente.",
        NO_PROVIDERS: "Todos os provedores LLM estão indisponíveis. Usando modo simulação inteligente.",
        RATE_LIMIT: "Muitas solicitações. Aguarde alguns segundos antes de tentar novamente."
    },

    // Success Messages  
    SUCCESS: {
        PROVIDER_SWITCHED: "Mudança de provedor bem-sucedida",
        FALLBACK_ACTIVATED: "Provedor principal indisponível, usando alternativo",
        CONNECTION_RESTORED: "Conexão restaurada com sucesso"
    },

    // Development Configuration
    DEV: {
        DEBUG: window.location.hostname === 'localhost',
        LOG_LEVEL: 'info',
        MOCK_RESPONSES: false,
        SIMULATION_DELAY: 2000
    }
};

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.DarcyConfig;
}
