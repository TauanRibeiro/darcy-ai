const axios = require('axios');

class LLMService {
    constructor() {
        this.providers = {
            ollama: {
                baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
                enabled: true
            },
            openai: {
                baseUrl: 'https://api.openai.com/v1',
                enabled: !!process.env.OPENAI_API_KEY
            },
            anthropic: {
                baseUrl: 'https://api.anthropic.com/v1',
                enabled: !!process.env.ANTHROPIC_API_KEY
            },
            cohere: {
                baseUrl: 'https://api.cohere.ai/v1',
                enabled: !!process.env.COHERE_API_KEY
            }
        };
    }
    
    /**
     * Processar mensagem com LLM
     */
    async processMessage(message, options = {}) {
        const { provider = 'ollama', model = 'llama2', context = 'general' } = options;
        
        try {
            switch (provider) {
                case 'ollama':
                    return await this.processWithOllama(message, model, context);
                case 'openai':
                    return await this.processWithOpenAI(message, model, context);
                case 'anthropic':
                    return await this.processWithAnthropic(message, model, context);
                case 'cohere':
                    return await this.processWithCohere(message, model, context);
                default:
                    throw new Error(`Provider não suportado: ${provider}`);
            }
        } catch (error) {
            console.error(`Erro com ${provider}:`, error.message);
            
            // Fallback para Ollama se disponível
            if (provider !== 'ollama' && this.providers.ollama.enabled) {
                console.log('Tentando fallback para Ollama...');
                return await this.processWithOllama(message, 'llama2', context);
            }
            
            throw error;
        }
    }
    
    /**
     * Processar com Ollama
     */
    async processWithOllama(message, model, context) {
        const systemPrompt = this.getSystemPrompt(context);
        
        const response = await axios.post(`${this.providers.ollama.baseUrl}/api/generate`, {
            model,
            prompt: `${systemPrompt}\n\nUsuário: ${message}\n\nAssistente:`,
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 1000
            }
        });
        
        return response.data.response || 'Desculpe, não consegui gerar uma resposta.';
    }
    
    /**
     * Processar com OpenAI
     */
    async processWithOpenAI(message, model, context) {
        const systemPrompt = this.getSystemPrompt(context);
        
        const response = await axios.post(`${this.providers.openai.baseUrl}/chat/completions`, {
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            max_tokens: 1000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
    }
    
    /**
     * Processar com Anthropic
     */
    async processWithAnthropic(message, model, context) {
        const systemPrompt = this.getSystemPrompt(context);
        
        const response = await axios.post(`${this.providers.anthropic.baseUrl}/messages`, {
            model,
            max_tokens: 1000,
            temperature: 0.7,
            system: systemPrompt,
            messages: [
                { role: 'user', content: message }
            ]
        }, {
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
        });
        
        return response.data.content[0]?.text || 'Desculpe, não consegui gerar uma resposta.';
    }
    
    /**
     * Processar com Cohere
     */
    async processWithCohere(message, model, context) {
        const systemPrompt = this.getSystemPrompt(context);
        
        const response = await axios.post(`${this.providers.cohere.baseUrl}/generate`, {
            model,
            prompt: `${systemPrompt}\n\nUsuário: ${message}\n\nAssistente:`,
            max_tokens: 1000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data.generations[0]?.text || 'Desculpe, não consegui gerar uma resposta.';
    }
    
    /**
     * Verificar disponibilidade do provider
     */
    async checkProvider(provider) {
        try {
            switch (provider) {
                case 'ollama':
                    const response = await axios.get(`${this.providers.ollama.baseUrl}/api/tags`, {
                        timeout: 5000
                    });
                    return response.status === 200;
                    
                case 'openai':
                    return !!process.env.OPENAI_API_KEY;
                    
                case 'anthropic':
                    return !!process.env.ANTHROPIC_API_KEY;
                    
                case 'cohere':
                    return !!process.env.COHERE_API_KEY;
                    
                default:
                    return false;
            }
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Obter modelos disponíveis
     */
    async getAvailableModels(provider) {
        try {
            switch (provider) {
                case 'ollama':
                    const response = await axios.get(`${this.providers.ollama.baseUrl}/api/tags`);
                    return response.data.models.map(model => ({
                        id: model.name,
                        name: model.name,
                        size: model.size
                    }));
                    
                case 'openai':
                    return [
                        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
                        { id: 'gpt-4', name: 'GPT-4' },
                        { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo' }
                    ];
                    
                case 'anthropic':
                    return [
                        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
                        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
                        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' }
                    ];
                    
                case 'cohere':
                    return [
                        { id: 'command', name: 'Command' },
                        { id: 'command-nightly', name: 'Command Nightly' }
                    ];
                    
                default:
                    return [];
            }
        } catch (error) {
            console.error(`Erro ao obter modelos do ${provider}:`, error.message);
            return [];
        }
    }
    
    /**
     * Obter prompt do sistema baseado no contexto
     */
    getSystemPrompt(context) {
        const prompts = {
            music: `Você é o Darcy, um tutor especializado em educação musical. 
                    Responda de forma didática, com exemplos práticos e sempre incentive o aprendizado.
                    Use uma linguagem acessível mas tecnicamente correta. 
                    Quando apropriado, inclua exercícios práticos e sugestões de estudo.`,
            
            research: `Você é o Darcy, um assistente de pesquisa acadêmica. 
                      Forneça informações precisas, metodologias confiáveis, 
                      e ajude a estruturar o pensamento crítico sobre o tema.
                      Sempre que possível, sugira fontes acadêmicas confiáveis.`,
            
            general: `Você é o Darcy, um tutor educacional especializado em pedagogia. 
                     Adapte sua resposta ao nível do estudante e use metodologias ativas de ensino.
                     Sempre forneça exemplos práticos e exercícios quando apropriado.
                     Seja encorajador e mantenha o foco no aprendizado.`
        };
        
        return prompts[context] || prompts.general;
    }
}

module.exports = new LLMService();
