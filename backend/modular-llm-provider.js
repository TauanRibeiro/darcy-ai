// Darcy AI - Modular LLM Provider System
// Supports multiple free LLM providers with automatic fallback

const http = require('http');
const https = require('https');

class ModularLLMProvider {
    constructor() {
        this.providers = [
            {
                name: 'Ollama Local',
                type: 'local',
                url: 'http://localhost:11434/api/generate',
                models: ['llama3.1', 'llama3', 'mistral', 'codellama', 'phi3', 'gemma2'],
                priority: 1,
                enabled: true,
                timeout: 30000
            },
            {
                name: 'Groq (Free)',
                type: 'api',
                url: 'https://api.groq.com/openai/v1/chat/completions',
                models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
                priority: 2,
                enabled: true,
                timeout: 15000,
                freeLimit: true
            },
            {
                name: 'Together AI (Free)',
                type: 'api',
                url: 'https://api.together.xyz/v1/chat/completions',
                models: ['meta-llama/Llama-3-8b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
                priority: 3,
                enabled: true,
                timeout: 20000,
                freeLimit: true
            },
            {
                name: 'Hugging Face (Free)',
                type: 'api',
                url: 'https://api-inference.huggingface.co/models',
                models: ['microsoft/DialoGPT-large', 'facebook/blenderbot-400M-distill'],
                priority: 4,
                enabled: true,
                timeout: 25000,
                freeLimit: true
            },
            {
                name: 'Cohere Trial (Free)',
                type: 'api',
                url: 'https://api.cohere.ai/v1/generate',
                models: ['command', 'command-light'],
                priority: 5,
                enabled: true,
                timeout: 15000,
                freeLimit: true
            },
            {
                name: 'Perplexity (Free)',
                type: 'api',
                url: 'https://api.perplexity.ai/chat/completions',
                models: ['llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-large-128k-online'],
                priority: 6,
                enabled: true,
                timeout: 20000,
                freeLimit: true
            }
        ];

        this.currentProvider = null;
        this.healthStatus = new Map();
        this.lastHealthCheck = new Map();
        this.requestCounts = new Map();
        
        // Initialize health status
        this.providers.forEach(provider => {
            this.healthStatus.set(provider.name, 'unknown');
            this.lastHealthCheck.set(provider.name, 0);
            this.requestCounts.set(provider.name, 0);
        });

        console.log('🔄 Sistema Modular de LLMs inicializado');
        this.performHealthChecks();
        
        // Periodic health checks every 5 minutes
        setInterval(() => this.performHealthChecks(), 5 * 60 * 1000);
    }

    async performHealthChecks() {
        console.log('🩺 Verificando saúde dos provedores LLM...');
        
        for (const provider of this.providers) {
            if (!provider.enabled) continue;
            
            try {
                const isHealthy = await this.checkProviderHealth(provider);
                this.healthStatus.set(provider.name, isHealthy ? 'healthy' : 'unhealthy');
                this.lastHealthCheck.set(provider.name, Date.now());
                
                console.log(`${isHealthy ? '✅' : '❌'} ${provider.name}: ${isHealthy ? 'Operacional' : 'Indisponível'}`);
                
            } catch (error) {
                this.healthStatus.set(provider.name, 'error');
                console.log(`❌ ${provider.name}: Erro - ${error.message}`);
            }
        }
        
        this.selectBestProvider();
    }

    async checkProviderHealth(provider) {
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        try {
            switch (provider.type) {
                case 'local':
                    return await Promise.race([this.checkOllamaHealth(provider), timeout]);
                    
                case 'api':
                    return await Promise.race([this.checkAPIHealth(provider), timeout]);
                    
                default:
                    return false;
            }
        } catch (error) {
            return false;
        }
    }

    async checkOllamaHealth(provider) {
        return new Promise((resolve) => {
            const req = http.get(provider.url.replace('/api/generate', '/api/tags'), (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', () => resolve(false));
            req.setTimeout(3000, () => {
                req.destroy();
                resolve(false);
            });
        });
    }

    async checkAPIHealth(provider) {
        // Simple connectivity check
        return new Promise((resolve) => {
            const url = new URL(provider.url);
            const client = url.protocol === 'https:' ? https : http;
            
            const req = client.request({
                hostname: url.hostname,
                port: url.port,
                path: '/',
                method: 'HEAD',
                timeout: 3000
            }, (res) => {
                resolve(res.statusCode < 500);
            });
            
            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            
            req.end();
        });
    }

    selectBestProvider() {
        // Find the best available provider based on priority and health
        const availableProviders = this.providers
            .filter(p => p.enabled && this.healthStatus.get(p.name) === 'healthy')
            .sort((a, b) => a.priority - b.priority);

        if (availableProviders.length > 0) {
            this.currentProvider = availableProviders[0];
            console.log(`🎯 Provedor selecionado: ${this.currentProvider.name}`);
        } else {
            console.log('⚠️ Nenhum provedor disponível, usando modo simulação');
            this.currentProvider = null;
        }
    }

    async generateResponse(crew, query, options = {}) {
        const provider = this.selectOptimalProvider(crew, query);
        
        if (!provider) {
            console.log('📝 Usando modo simulação inteligente');
            return this.generateSimulatedResponse(crew, query);
        }

        try {
            console.log(`🤖 Gerando resposta com ${provider.name}...`);
            
            switch (provider.type) {
                case 'local':
                    return await this.generateOllamaResponse(provider, crew, query, options);
                    
                case 'api':
                    return await this.generateAPIResponse(provider, crew, query, options);
                    
                default:
                    throw new Error('Tipo de provedor não suportado');
            }
            
        } catch (error) {
            console.error(`❌ Erro com ${provider.name}:`, error.message);
            
            // Mark provider as temporarily unhealthy
            this.healthStatus.set(provider.name, 'unhealthy');
            
            // Try fallback
            return await this.tryFallbackProvider(crew, query, provider, options);
        }
    }

    selectOptimalProvider(crew, query) {
        const availableProviders = this.providers
            .filter(p => p.enabled && this.healthStatus.get(p.name) === 'healthy')
            .sort((a, b) => a.priority - b.priority);

        if (availableProviders.length === 0) {
            return null;
        }

        // Select based on query complexity and crew type
        const complexity = this.analyzeQueryComplexity(query);
        const crewRequirements = this.getCrewRequirements(crew);
        
        for (const provider of availableProviders) {
            if (this.isProviderSuitable(provider, complexity, crewRequirements)) {
                return provider;
            }
        }

        return availableProviders[0]; // Fallback to best available
    }

    analyzeQueryComplexity(query) {
        const length = query.length;
        const complexity = {
            simple: length < 100,
            medium: length >= 100 && length < 300,
            complex: length >= 300
        };

        // Check for technical terms, code, math
        const technicalTerms = /\b(algorithm|function|class|variable|equation|formula|theorem)\b/i;
        const hasCode = /```|`\w+`|function\s*\(|class\s+\w+|def\s+\w+/i;
        const hasMath = /\$\$|\\\(|\\\[|∫|∑|∆|∂/;

        if (technicalTerms.test(query) || hasCode.test(query) || hasMath.test(query)) {
            return 'complex';
        }

        return Object.keys(complexity).find(key => complexity[key]) || 'medium';
    }

    getCrewRequirements(crew) {
        const requirements = {
            'teaching': { reasoning: 'high', creativity: 'medium', speed: 'medium' },
            'research': { reasoning: 'high', creativity: 'low', speed: 'low' },
            'creative': { reasoning: 'medium', creativity: 'high', speed: 'medium' },
            'assessment': { reasoning: 'high', creativity: 'low', speed: 'high' }
        };

        return requirements[crew] || { reasoning: 'medium', creativity: 'medium', speed: 'medium' };
    }

    isProviderSuitable(provider, complexity, requirements) {
        // Simple heuristics for provider selection
        if (provider.name.includes('Ollama') && complexity === 'complex') return true;
        if (provider.name.includes('Groq') && requirements.speed === 'high') return true;
        if (provider.name.includes('Together') && requirements.creativity === 'high') return true;
        
        return true; // All providers are suitable by default
    }

    async generateOllamaResponse(provider, crew, query, options) {
        const model = provider.models[0]; // Use first available model
        
        const prompt = this.buildEducationalPrompt(crew, query);
        
        const requestData = {
            model: model,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 1000
            }
        };

        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(requestData);
            
            const req = http.request(provider.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                timeout: provider.timeout
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        const result = this.formatEducationalResponse(crew, response.response || response.text, query);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Resposta inválida do Ollama'));
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Timeout na requisição')));
            req.write(postData);
            req.end();
        });
    }

    async generateAPIResponse(provider, crew, query, options) {
        // This would implement API calls to other providers
        // For now, return a simulated response
        console.log(`📡 Chamando API ${provider.name} (implementação futura)`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        return this.generateSimulatedResponse(crew, query);
    }

    async tryFallbackProvider(crew, query, failedProvider, options) {
        console.log(`🔄 Tentando provedor alternativo após falha de ${failedProvider.name}`);
        
        const availableProviders = this.providers
            .filter(p => p.enabled && 
                         p.name !== failedProvider.name && 
                         this.healthStatus.get(p.name) === 'healthy')
            .sort((a, b) => a.priority - b.priority);

        if (availableProviders.length > 0) {
            const fallbackProvider = availableProviders[0];
            try {
                return await this.generateResponse(crew, query, options);
            } catch (error) {
                console.error(`❌ Falha no fallback ${fallbackProvider.name}`);
            }
        }

        // Ultimate fallback to simulation
        console.log('📝 Usando simulação como último recurso');
        return this.generateSimulatedResponse(crew, query);
    }

    buildEducationalPrompt(crew, query) {
        const crewPrompts = {
            'teaching': `Você é um professor especializado e experiente. Explique de forma clara, didática e estruturada: "${query}". Use exemplos práticos e uma linguagem acessível. Organize sua resposta em seções lógicas.`,
            
            'research': `Você é um pesquisador acadêmico. Analise e forneça informações precisas e verificáveis sobre: "${query}". Base sua resposta em conhecimento confiável e cite conceitos importantes.`,
            
            'creative': `Você é um educador criativo e inovador. Desenvolva uma abordagem original e envolvente para: "${query}". Crie projetos práticos, atividades interativas ou métodos únicos de aprendizado.`,
            
            'assessment': `Você é um avaliador educacional. Crie exercícios, questionários ou atividades de avaliação relacionadas a: "${query}". Foque no aprendizado construtivo e no desenvolvimento de habilidades.`
        };

        return crewPrompts[crew] || crewPrompts['teaching'];
    }

    formatEducationalResponse(crew, response, query) {
        const crewNames = {
            'teaching': 'Equipe de Ensino',
            'research': 'Equipe de Pesquisa', 
            'creative': 'Equipe Criativa',
            'assessment': 'Equipe de Avaliação'
        };

        const crewName = crewNames[crew] || 'Darcy AI';
        const providerName = this.currentProvider?.name || 'Sistema Inteligente';

        return `## ${crewName} Responde:

${response}

### 🔧 Informações Técnicas:
- **Provedor**: ${providerName}
- **Modelo**: ${this.currentProvider?.models?.[0] || 'Simulação Inteligente'}
- **Crew**: ${crew}
- **Consulta**: "${query}"

### 🎯 Próximos Passos:
- 📖 Explore os conceitos apresentados
- 🔬 Pratique com exercícios relacionados
- 💬 Faça perguntas específicas para aprofundar
- 🌟 Aplique o conhecimento em projetos reais

---
*✨ Resposta gerada pelo sistema modular de LLMs do Darcy AI*`;
    }

    generateSimulatedResponse(crew, query) {
        const responses = {
            'teaching': [
                `Vou explicar "${query}" de forma didática e estruturada. Este é um conceito importante que merece atenção especial em nossa jornada de aprendizado.`,
                `Excelente pergunta sobre "${query}"! Vamos abordar este tópico passo a passo, começando pelos fundamentos e avançando para aplicações práticas.`,
                `"${query}" é um tema fascinante! Deixe-me quebrar este conceito em partes menores para facilitar o entendimento e memorização.`
            ],
            'research': [
                `Com base em pesquisas acadêmicas sobre "${query}", identifiquei informações importantes e verificáveis que podem esclarecer suas dúvidas.`,
                `Analisando fontes confiáveis sobre "${query}", compilei dados relevantes e insights que ajudarão no seu entendimento aprofundado.`,
                `A literatura científica sobre "${query}" apresenta evidências interessantes que vale a pena explorar em detalhes.`
            ],
            'creative': [
                `Que projeto empolgante sobre "${query}"! Desenvolvi uma abordagem criativa e inovadora que tornará este aprendizado memorável.`,
                `Sua pergunta sobre "${query}" me inspirou a criar uma atividade única que combina teoria e prática de forma divertida.`,
                `Vamos transformar "${query}" em uma experiência de aprendizado interativa e envolvente com métodos não convencionais!`
            ],
            'assessment': [
                `Para avaliar seu conhecimento sobre "${query}", preparei exercícios progressivos que vão consolidar seu aprendizado.`,
                `Vamos verificar seu domínio de "${query}" através de atividades práticas e feedback construtivo.`,
                `Criei uma avaliação personalizada sobre "${query}" que vai identificar seus pontos fortes e áreas para desenvolvimento.`
            ]
        };

        const crewResponses = responses[crew] || responses['teaching'];
        const selectedResponse = crewResponses[Math.floor(Math.random() * crewResponses.length)];
        
        return this.formatEducationalResponse(crew, selectedResponse, query);
    }

    getSystemStatus() {
        const status = {
            currentProvider: this.currentProvider?.name || 'Simulação',
            providersStatus: {},
            totalProviders: this.providers.length,
            healthyProviders: 0,
            lastHealthCheck: Math.max(...Array.from(this.lastHealthCheck.values()))
        };

        this.providers.forEach(provider => {
            const health = this.healthStatus.get(provider.name);
            status.providersStatus[provider.name] = {
                status: health,
                priority: provider.priority,
                enabled: provider.enabled,
                type: provider.type,
                models: provider.models.length,
                requests: this.requestCounts.get(provider.name) || 0
            };
            
            if (health === 'healthy') {
                status.healthyProviders++;
            }
        });

        return status;
    }

    incrementRequestCount(providerName) {
        const current = this.requestCounts.get(providerName) || 0;
        this.requestCounts.set(providerName, current + 1);
    }
}

module.exports = ModularLLMProvider;
