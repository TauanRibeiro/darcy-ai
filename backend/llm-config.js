// Darcy AI - LLM Providers Configuration
// Configuration for all supported free LLM providers

module.exports = {
    // Default settings
    defaults: {
        timeout: 30000,
        maxRetries: 3,
        temperature: 0.7,
        maxTokens: 1000
    },

    // Educational prompts for different crews
    crewPrompts: {
        teaching: {
            systemPrompt: "Você é um professor especializado e experiente. Sua missão é explicar conceitos de forma clara, didática e estruturada. Use linguagem acessível, exemplos práticos e organize suas respostas em seções lógicas.",
            temperature: 0.6,
            maxTokens: 1200
        },
        research: {
            systemPrompt: "Você é um pesquisador acadêmico rigoroso. Forneça informações precisas, verificáveis e bem fundamentadas. Base suas respostas em conhecimento confiável e cite conceitos importantes quando relevante.",
            temperature: 0.4,
            maxTokens: 1500
        },
        creative: {
            systemPrompt: "Você é um educador criativo e inovador. Desenvolva abordagens originais e envolventes para o aprendizado. Crie projetos práticos, atividades interativas e métodos únicos de ensino.",
            temperature: 0.8,
            maxTokens: 1000
        },
        assessment: {
            systemPrompt: "Você é um especialista em avaliação educacional. Crie exercícios, questionários e atividades que promovam o aprendizado construtivo. Foque no desenvolvimento de habilidades e feedback positivo.",
            temperature: 0.5,
            maxTokens: 800
        }
    },

    // Provider-specific configurations
    providers: {
        ollama: {
            name: 'Ollama Local',
            endpoint: 'http://localhost:11434/api/generate',
            healthEndpoint: 'http://localhost:11434/api/tags',
            models: {
                default: 'llama3.1',
                alternatives: ['llama3', 'mistral', 'codellama', 'phi3', 'gemma2', 'qwen2'],
                specialized: {
                    teaching: 'phi3',
                    research: 'llama3.1',
                    creative: 'mistral',
                    assessment: 'gemma2'
                }
            },
            priority: 1,
            type: 'local',
            free: true
        },

        deepseek: {
            name: 'DeepSeek Local',
            endpoint: 'http://localhost:8000/v1/chat/completions',
            healthEndpoint: 'http://localhost:8000/v1/models',
            models: {
                default: 'deepseek-coder',
                alternatives: ['deepseek-chat', 'deepseek-math'],
                specialized: {
                    teaching: 'deepseek-chat',
                    research: 'deepseek-chat',
                    creative: 'deepseek-coder',
                    assessment: 'deepseek-math'
                }
            },
            priority: 2,
            type: 'local',
            free: true,
            description: 'DeepSeek - IA chinesa de código aberto especializada em coding e matemática'
        },

        groq: {
            name: 'Groq API',
            endpoint: 'https://api.groq.com/openai/v1/chat/completions',
            models: {
                default: 'llama-3.1-8b-instant',
                alternatives: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
                specialized: {
                    teaching: 'llama-3.1-8b-instant',
                    research: 'llama-3.1-70b-versatile', 
                    creative: 'mixtral-8x7b-32768',
                    assessment: 'gemma2-9b-it'
                }
            },
            priority: 3,
            type: 'api',
            free: true,
            rateLimit: {
                requests: 30,
                window: 60000 // 1 minute
            }
        },

        together: {
            name: 'Together AI',
            endpoint: 'https://api.together.xyz/v1/chat/completions',
            models: {
                default: 'meta-llama/Llama-3-8b-chat-hf',
                alternatives: [
                    'meta-llama/Llama-3-70b-chat-hf',
                    'mistralai/Mixtral-8x7B-Instruct-v0.1',
                    'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO'
                ],
                specialized: {
                    teaching: 'meta-llama/Llama-3-8b-chat-hf',
                    research: 'meta-llama/Llama-3-70b-chat-hf',
                    creative: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                    assessment: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO'
                }
            },
            priority: 4,
            type: 'api',
            free: true,
            credits: '$25 free monthly'
        },

        huggingface: {
            name: 'Hugging Face',
            endpoint: 'https://api-inference.huggingface.co/models',
            models: {
                default: 'microsoft/DialoGPT-large',
                alternatives: [
                    'facebook/blenderbot-400M-distill',
                    'microsoft/DialoGPT-medium',
                    'google/flan-t5-large'
                ],
                specialized: {
                    teaching: 'google/flan-t5-large',
                    research: 'microsoft/DialoGPT-large',
                    creative: 'facebook/blenderbot-400M-distill',
                    assessment: 'microsoft/DialoGPT-medium'
                }
            },
            priority: 5,
            type: 'api',
            free: true,
            note: 'Rate limited, but completely free'
        },

        cohere: {
            name: 'Cohere',
            endpoint: 'https://api.cohere.ai/v1/generate',
            models: {
                default: 'command',
                alternatives: ['command-light', 'command-nightly'],
                specialized: {
                    teaching: 'command',
                    research: 'command',
                    creative: 'command-nightly',
                    assessment: 'command-light'
                }
            },
            priority: 6,
            type: 'api',
            free: true,
            trial: 'Free trial with usage limits'
        },

        perplexity: {
            name: 'Perplexity AI',
            endpoint: 'https://api.perplexity.ai/chat/completions',
            models: {
                default: 'llama-3.1-sonar-small-128k-online',
                alternatives: [
                    'llama-3.1-sonar-large-128k-online',
                    'llama-3.1-sonar-small-128k-chat',
                    'llama-3.1-sonar-large-128k-chat'
                ],
                specialized: {
                    teaching: 'llama-3.1-sonar-small-128k-chat',
                    research: 'llama-3.1-sonar-large-128k-online',
                    creative: 'llama-3.1-sonar-small-128k-chat',
                    assessment: 'llama-3.1-sonar-small-128k-chat'
                }
            },
            priority: 7,
            type: 'api',
            free: true,
            features: ['web_search', 'real_time_data']
        }
    },

    // Fallback simulation responses
    simulationResponses: {
        teaching: [
            "Como especialista em educação, vou explicar este conceito de forma clara e progressiva, começando pelos fundamentos e avançando para aplicações práticas.",
            "Excelente pergunta! Vou abordar este tópico de forma estruturada, usando exemplos que facilitam a compreensão e memorização.",
            "Este é um tema fundamental! Deixe-me criar uma explicação didática que conecta teoria e prática de forma natural."
        ],
        research: [
            "Com base em análise acadêmica rigorosa, identifiquei informações importantes e verificáveis sobre este tópico.",
            "A literatura científica apresenta evidências consistentes que esclarecem os aspectos principais desta questão.",
            "Através de pesquisa sistemática, compilei dados relevantes e insights que fundamentam uma compreensão sólida."
        ],
        creative: [
            "Que oportunidade empolgante para inovação pedagógica! Desenvolvi uma abordagem original que torna o aprendizado memorável.",
            "Sua pergunta me inspirou a criar uma atividade única que combina criatividade e rigor acadêmico.",
            "Vamos transformar este conceito em uma experiência de aprendizado interativa e envolvente!"
        ],
        assessment: [
            "Para consolidar seu aprendizado, criei exercícios progressivos que avaliam e reforçam seu conhecimento.",
            "Vamos verificar seu domínio através de atividades práticas com feedback construtivo e personalizado.",
            "Desenvolvi uma avaliação formativa que identifica seus pontos fortes e oportunidades de crescimento."
        ]
    },

    // Quality indicators for provider selection
    qualityMetrics: {
        reasoning: {
            high: ['ollama', 'groq', 'together'],
            medium: ['cohere', 'perplexity'],
            low: ['huggingface']
        },
        creativity: {
            high: ['together', 'groq', 'perplexity'],
            medium: ['ollama', 'cohere'],
            low: ['huggingface']
        },
        speed: {
            high: ['groq', 'cohere'],
            medium: ['ollama', 'together', 'perplexity'],
            low: ['huggingface']
        },
        reliability: {
            high: ['ollama'],
            medium: ['groq', 'together', 'cohere'],
            low: ['huggingface', 'perplexity']
        }
    },

    // Installation instructions for local setup
    installation: {
        ollama: {
            windows: [
                "1. Baixe o instalador: https://ollama.com/download/windows",
                "2. Execute o instalador como administrador",
                "3. Abra o terminal e execute: ollama pull llama3.1",
                "4. Teste com: ollama run llama3.1"
            ],
            linux: [
                "1. Execute: curl -fsSL https://ollama.com/install.sh | sh",
                "2. Baixe modelos: ollama pull llama3.1",
                "3. Inicie: ollama serve",
                "4. Teste: ollama run llama3.1"
            ],
            mac: [
                "1. Baixe o app: https://ollama.com/download/mac",
                "2. Instale e execute o Ollama.app",
                "3. No terminal: ollama pull llama3.1",
                "4. Teste: ollama run llama3.1"
            ]
        },
        deepseek: {
            all: [
                "1. Clone: git clone https://github.com/deepseek-ai/DeepSeek-Coder",
                "2. Instalar dependências: pip install -r requirements.txt",
                "3. Baixar modelo: huggingface-cli download deepseek-ai/deepseek-coder-6.7b-instruct",
                "4. Executar: python -m vllm.entrypoints.openai.api_server --model deepseek-ai/deepseek-coder-6.7b-instruct --port 8000",
                "5. Teste: curl http://localhost:8000/v1/models"
            ],
            docker: [
                "1. Pull image: docker pull vllm/vllm-openai",
                "2. Run: docker run --gpus all -v ~/.cache/huggingface:/root/.cache/huggingface --env HUGGING_FACE_HUB_TOKEN=your_token -p 8000:8000 --ipc=host vllm/vllm-openai --model deepseek-ai/deepseek-coder-6.7b-instruct",
                "3. Teste: curl http://localhost:8000/v1/models"
            ]
        },
        models: {
            recommended: [
                "ollama pull llama3.1    # Melhor modelo geral",
                "ollama pull phi3        # Rápido para ensino",
                "ollama pull mistral     # Ótimo para criatividade",
                "ollama pull codellama   # Especializado em código"
            ],
            optional: [
                "ollama pull gemma2      # Google, boa precisão",
                "ollama pull qwen2       # Multilíngue, incluindo português"
            ]
        }
    }
};
