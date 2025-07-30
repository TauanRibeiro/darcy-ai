// LLM Providers integration for Darcy AI
const LLMProviders = {
    
    /**
     * Send message to selected LLM provider (via backend or direct)
     * @param {string} message - User message
     * @param {Object} options - Additional options
     * @returns {Promise<string>} - AI response
     */
    sendMessage: async (message, options = {}) => {
        const settings = Storage.settings.getAll();
        const useBackend = settings.USE_BACKEND !== false;
        
        try {
            if (useBackend) {
                return await LLMProviders.sendViaBackend(message, options);
            } else {
                return await LLMProviders.sendDirect(message, options);
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            
            // Fallback: try direct if backend failed
            if (useBackend) {
                console.log('Backend falhou, tentando conexão direta...');
                try {
                    return await LLMProviders.sendDirect(message, options);
                } catch (directError) {
                    throw new Error(`Backend e conexão direta falharam: ${error.message}`);
                }
            }
            
            throw error;
        }
    },
    
    /**
     * Send message via backend
     * @param {string} message - User message
     * @param {Object} options - Additional options
     * @returns {Promise<string>} - AI response
     */
    sendViaBackend: async (message, options = {}) => {
        const settings = Storage.settings.getAll();
        
        const payload = {
            message,
            provider: options.provider || settings.PROVIDER,
            model: options.model || settings.MODEL,
            context: options.context || 'general',
            webSearch: options.webSearch || false
        };
        
        const response = await Utils.api.post(
            `${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.CHAT}`,
            payload
        );
        
        if (response.error) {
            throw new Error(response.message || response.error);
        }
        
        return response.response;
    },
    
    /**
     * Send message directly to provider (fallback)
     * @param {string} message - User message
     * @param {Object} options - Additional options
     * @returns {Promise<string>} - AI response
     */
    sendDirect: async (message, options = {}) => {
        const settings = Storage.settings.getAll();
        const provider = options.provider || settings.PROVIDER;
        
        switch (provider) {
            case 'ollama':
                return await LLMProviders.ollama.sendMessage(message, options);
            case 'openai':
                return await LLMProviders.openai.sendMessage(message, options);
            case 'anthropic':
                return await LLMProviders.anthropic.sendMessage(message, options);
            case 'cohere':
                return await LLMProviders.cohere.sendMessage(message, options);
            default:
                throw new Error(`Provider não suportado: ${provider}`);
        }
    },
    
    /**
     * Get available models for provider
     * @param {string} provider - Provider name
     * @returns {Promise<Array>} - Available models
     */
    getModels: async (provider) => {
        const settings = Storage.settings.getAll();
        
        try {
            if (settings.USE_BACKEND !== false) {
                const response = await Utils.api.request(
                    `${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.MODELS.replace(':provider', provider)}`
                );
                const data = await response.json();
                return data.models || CONFIG.MODELS[provider] || [];
            }
        } catch (error) {
            console.warn('Erro ao buscar modelos via backend:', error.message);
        }
        
        // Fallback to static config
        return CONFIG.MODELS[provider] || [];
    },
    
    /**
     * Check if provider is available
     * @param {string} provider - Provider name
     * @returns {Promise<boolean>}
     */
    checkAvailability: async (provider) => {
        const settings = Storage.settings.getAll();
        
        try {
            if (settings.USE_BACKEND !== false) {
                const response = await Utils.api.request(
                    `${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.PROVIDERS}/check/${provider}`
                );
                const data = await response.json();
                return data.available;
            }
        } catch (error) {
            console.warn('Erro ao verificar provider via backend:', error.message);
        }
        
        // Fallback to direct check
        try {
            switch (provider) {
                case 'ollama':
                    return await LLMProviders.ollama.checkAvailability();
                case 'openai':
                case 'anthropic':
                case 'cohere':
                    const apiKey = Storage.apiKeys.get(provider);
                    return !!apiKey;
                default:
                    return false;
            }
        } catch (error) {
            console.error(`Erro ao verificar disponibilidade do ${provider}:`, error);
            return false;
        }
    },
    
    /**
     * Check backend health
     * @returns {Promise<boolean>}
     */
    checkBackendHealth: async () => {
        try {
            const response = await Utils.api.request(
                `${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.HEALTH}`,
                { timeout: 5000 }
            );
            return response.ok;
        } catch (error) {
            console.warn('Backend não disponível:', error.message);
            return false;
        }
    },
    
    // Ollama (Local) Provider - Direct connection fallback
    ollama: {
        /**
         * Send message to Ollama
         * @param {string} message - User message
         * @param {Object} options - Options
         * @returns {Promise<string>}
         */
        sendMessage: async (message, options = {}) => {
            const settings = Storage.settings.getAll();
            const model = options.model || settings.MODEL || 'llama2';
            
            const payload = {
                model: model,
                prompt: LLMProviders.buildPrompt(message, options),
                stream: false,
                options: {
                    temperature: options.temperature || settings.TEMPERATURE || 0.7,
                    num_predict: options.maxTokens || settings.MAX_TOKENS || 1000
                }
            };
            
            const response = await Utils.api.request(CONFIG.FALLBACK_ENDPOINTS.OLLAMA, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            return data.response || 'Desculpe, não consegui gerar uma resposta.';
        },
        
        /**
         * Check if Ollama is running
         * @returns {Promise<boolean>}
         */
        checkAvailability: async () => {
            try {
                const response = await Utils.api.request(
                    CONFIG.FALLBACK_ENDPOINTS.OLLAMA.replace('/api/generate', '/api/tags'),
                    { timeout: 5000 }
                );
                return response.ok;
            } catch {
                return false;
            }
        }
    },
    
    // OpenAI Provider - Direct connection fallback
    openai: {
        /**
         * Send message to OpenAI
         * @param {string} message - User message
         * @param {Object} options - Options
         * @returns {Promise<string>}
         */
        sendMessage: async (message, options = {}) => {
            const apiKey = Storage.apiKeys.get('openai');
            if (!apiKey) {
                throw new Error('Chave da API do OpenAI não configurada');
            }
            
            const settings = Storage.settings.getAll();
            const model = options.model || settings.MODEL || 'gpt-3.5-turbo';
            
            const payload = {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: LLMProviders.getSystemPrompt(options.context)
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: options.maxTokens || settings.MAX_TOKENS || 1000,
                temperature: options.temperature || settings.TEMPERATURE || 0.7
            };
            
            const response = await Utils.api.request(CONFIG.FALLBACK_ENDPOINTS.OPENAI, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            return data.choices?.[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
        }
    },
    
    // Anthropic (Claude) Provider - Direct connection fallback
    anthropic: {
        /**
         * Send message to Anthropic
         * @param {string} message - User message
         * @param {Object} options - Options
         * @returns {Promise<string>}
         */
        sendMessage: async (message, options = {}) => {
            const apiKey = Storage.apiKeys.get('anthropic');
            if (!apiKey) {
                throw new Error('Chave da API do Anthropic não configurada');
            }
            
            const settings = Storage.settings.getAll();
            const model = options.model || settings.MODEL || 'claude-3-haiku-20240307';
            
            const payload = {
                model: model,
                max_tokens: options.maxTokens || settings.MAX_TOKENS || 1000,
                temperature: options.temperature || settings.TEMPERATURE || 0.7,
                system: LLMProviders.getSystemPrompt(options.context),
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            };
            
            const response = await Utils.api.request(CONFIG.FALLBACK_ENDPOINTS.ANTHROPIC, {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            return data.content?.[0]?.text || 'Desculpe, não consegui gerar uma resposta.';
        }
    },
    
    // Cohere Provider - Direct connection fallback
    cohere: {
        /**
         * Send message to Cohere
         * @param {string} message - User message
         * @param {Object} options - Options
         * @returns {Promise<string>}
         */
        sendMessage: async (message, options = {}) => {
            const apiKey = Storage.apiKeys.get('cohere');
            if (!apiKey) {
                throw new Error('Chave da API do Cohere não configurada');
            }
            
            const settings = Storage.settings.getAll();
            const model = options.model || settings.MODEL || 'command';
            
            const payload = {
                model: model,
                prompt: LLMProviders.buildPrompt(message, options),
                max_tokens: options.maxTokens || settings.MAX_TOKENS || 1000,
                temperature: options.temperature || settings.TEMPERATURE || 0.7
            };
            
            const response = await Utils.api.request(CONFIG.FALLBACK_ENDPOINTS.COHERE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            return data.generations?.[0]?.text || 'Desculpe, não consegui gerar uma resposta.';
        }
    },
    
    /**
     * Build prompt with context
     * @param {string} message - User message
     * @param {Object} options - Options
     * @returns {string} - Complete prompt
     */
    buildPrompt: (message, options = {}) => {
        const systemPrompt = LLMProviders.getSystemPrompt(options.context);
        return `${systemPrompt}\n\nUsuário: ${message}\n\nAssistente:`;
    },
    
    /**
     * Get system prompt based on context
     * @param {string} context - Context type
     * @returns {string} - System prompt
     */
    getSystemPrompt: (context = 'general') => {
        switch (context) {
            case 'music':
                return CONFIG.EDUCATIONAL_PROMPTS.MUSIC_THEORY;
            case 'research':
                return CONFIG.EDUCATIONAL_PROMPTS.RESEARCH;
            case 'general':
            default:
                return CONFIG.EDUCATIONAL_PROMPTS.GENERAL_EDUCATION;
        }
    },
    
    /**
     * Process message with web search if needed
     * @param {string} message - User message
     * @param {Object} options - Options
     * @returns {Promise<string>}
     */
    processWithWebSearch: async (message, options = {}) => {
        // Check if message requests web search
        const needsWebSearch = message.toLowerCase().includes('buscar na web') || 
                              message.toLowerCase().includes('pesquisar na internet') ||
                              options.webSearch;
        
        if (needsWebSearch) {
            const settings = Storage.settings.getAll();
            
            // Try backend first
            if (settings.USE_BACKEND !== false) {
                try {
                    return await LLMProviders.sendViaBackend(message, {
                        ...options,
                        webSearch: true,
                        context: 'research'
                    });
                } catch (error) {
                    console.warn('Backend search failed, using fallback:', error.message);
                }
            }
            
            // Fallback to direct search
            try {
                const searchResults = await LLMProviders.webSearch.search(message);
                const enhancedMessage = `${message}\n\nResultados da pesquisa:\n${searchResults}`;
                
                return await LLMProviders.sendMessage(enhancedMessage, {
                    ...options,
                    context: 'research',
                    webSearch: false // Avoid infinite recursion
                });
            } catch (error) {
                console.error('Web search failed:', error);
                return await LLMProviders.sendMessage(message, options);
            }
        }
        
        return await LLMProviders.sendMessage(message, options);
    },
    
    // Web search utilities (fallback)
    webSearch: {
        /**
         * Search the web using DuckDuckGo Instant Answer API
         * @param {string} query - Search query
         * @returns {Promise<string>} - Search results
         */
        search: async (query) => {
            try {
                const searchQuery = query.replace(/.*?buscar na web:?\s*/i, '')
                                        .replace(/.*?pesquisar na internet:?\s*/i, '');
                
                const encodedQuery = encodeURIComponent(searchQuery);
                const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;
                
                const response = await Utils.api.request(url);
                const data = await response.json();
                
                let results = '';
                
                // Abstract
                if (data.Abstract) {
                    results += `**Resumo:** ${data.Abstract}\n\n`;
                }
                
                // Answer
                if (data.Answer) {
                    results += `**Resposta:** ${data.Answer}\n\n`;
                }
                
                // Related topics
                if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                    results += '**Tópicos relacionados:**\n';
                    data.RelatedTopics.slice(0, 3).forEach(topic => {
                        if (topic.Text) {
                            results += `• ${topic.Text}\n`;
                        }
                    });
                    results += '\n';
                }
                
                return results || 'Não foram encontrados resultados específicos para esta pesquisa.';
            } catch (error) {
                console.error('Erro na busca web:', error);
                return 'Erro ao realizar busca na web. Respondendo com base no conhecimento interno.';
            }
        }
    },
    
    /**
     * Process file content with AI (via backend or direct)
     * @param {File} file - File object
     * @param {string} action - Action to perform
     * @returns {Promise<string>}
     */
    processFile: async (file, action = 'analyze') => {
        const settings = Storage.settings.getAll();
        
        // Try backend first
        if (settings.USE_BACKEND !== false) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('action', action);
                
                const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.UPLOAD}`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                return data.analysis || data.content || 'Arquivo processado com sucesso.';
                
            } catch (error) {
                console.warn('Backend file processing failed:', error.message);
            }
        }
        
        // Fallback to client-side processing
        const fileContent = await Utils.file.readAsText(file);
        return await LLMProviders.processFileContent(fileContent, file.name, action);
    },
    
    /**
     * Process file content directly
     * @param {string} fileContent - File content
     * @param {string} fileName - File name
     * @param {string} action - Action to perform
     * @returns {Promise<string>}
     */
    processFileContent: async (fileContent, fileName, action = 'analyze') => {
        let prompt = '';
        
        switch (action) {
            case 'summarize':
                prompt = `Por favor, faça um resumo do seguinte documento "${fileName}":\n\n${fileContent}`;
                break;
            case 'explain':
                prompt = `Por favor, explique o conteúdo do seguinte documento "${fileName}" de forma didática:\n\n${fileContent}`;
                break;
            case 'analyze':
            default:
                prompt = `Por favor, analise o seguinte documento "${fileName}" e forneça insights educacionais:\n\n${fileContent}`;
                break;
        }
        
        return await LLMProviders.sendMessage(prompt, {
            context: 'research',
            maxTokens: 1500
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LLMProviders;
}
    
    // Ollama (Local) Provider
    ollama: {
        /**
         * Send message to Ollama
         * @param {string} message - User message
         * @param {Object} options - Options
         * @returns {Promise<string>}
         */
        sendMessage: async (message, options = {}) => {
            const settings = Storage.settings.getAll();
            const model = options.model || settings.MODEL || 'llama2';
            
            const payload = {
                model: model,
                prompt: LLMProviders.buildPrompt(message, options),
                stream: false,
                options: {
                    temperature: options.temperature || settings.TEMPERATURE || 0.7,
                    num_predict: options.maxTokens || settings.MAX_TOKENS || 1000
                }
            };
            
            const response = await Utils.api.request(CONFIG.ENDPOINTS.OLLAMA, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            return data.response || 'Desculpe, não consegui gerar uma resposta.';
        },
        
        /**
         * Check if Ollama is running
         * @returns {Promise<boolean>}
         */
        checkAvailability: async () => {
            try {
                const response = await Utils.api.request(CONFIG.ENDPOINTS.OLLAMA.replace('/api/generate', '/api/tags'));
                return response.ok;
            } catch {
                return false;
            }
        },
        
        /**
         * Get available models from Ollama
         * @returns {Promise<Array>}
         */
        getAvailableModels: async () => {
            try {
                const response = await Utils.api.request(CONFIG.ENDPOINTS.OLLAMA.replace('/api/generate', '/api/tags'));
                const data = await response.json();
                return data.models || [];
            } catch (error) {
                console.error('Erro ao buscar modelos do Ollama:', error);
                return [];
            }
        }
    },
    
    // OpenAI Provider
    openai: {
        /**
         * Send message to OpenAI
         * @param {string} message - User message
         * @param {Object} options - Options
         * @returns {Promise<string>}
         */
        sendMessage: async (message, options = {}) => {
            const apiKey = Storage.apiKeys.get('openai');
            if (!apiKey) {
                throw new Error('Chave da API do OpenAI não configurada');
            }
            
            const settings = Storage.settings.getAll();
            const model = options.model || settings.MODEL || 'gpt-3.5-turbo';
            
            const payload = {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: LLMProviders.getSystemPrompt(options.context)
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: options.maxTokens || settings.MAX_TOKENS || 1000,
                temperature: options.temperature || settings.TEMPERATURE || 0.7
            };
            
            const response = await Utils.api.request(CONFIG.ENDPOINTS.OPENAI, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            return data.choices?.[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
        }
    },
    
    // Anthropic (Claude) Provider
    anthropic: {
        /**
         * Send message to Anthropic
         * @param {string} message - User message
         * @param {Object} options - Options
         * @returns {Promise<string>}
         */
        sendMessage: async (message, options = {}) => {
            const apiKey = Storage.apiKeys.get('anthropic');
            if (!apiKey) {
                throw new Error('Chave da API do Anthropic não configurada');
            }
            
            const settings = Storage.settings.getAll();
            const model = options.model || settings.MODEL || 'claude-3-haiku-20240307';
            
            const payload = {
                model: model,
                max_tokens: options.maxTokens || settings.MAX_TOKENS || 1000,
                temperature: options.temperature || settings.TEMPERATURE || 0.7,
                system: LLMProviders.getSystemPrompt(options.context),
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            };
            
            const response = await Utils.api.request(CONFIG.ENDPOINTS.ANTHROPIC, {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            return data.content?.[0]?.text || 'Desculpe, não consegui gerar uma resposta.';
        }
    },
    
    // Cohere Provider
    cohere: {
        /**
         * Send message to Cohere
         * @param {string} message - User message
         * @param {Object} options - Options
         * @returns {Promise<string>}
         */
        sendMessage: async (message, options = {}) => {
            const apiKey = Storage.apiKeys.get('cohere');
            if (!apiKey) {
                throw new Error('Chave da API do Cohere não configurada');
            }
            
            const settings = Storage.settings.getAll();
            const model = options.model || settings.MODEL || 'command';
            
            const payload = {
                model: model,
                prompt: LLMProviders.buildPrompt(message, options),
                max_tokens: options.maxTokens || settings.MAX_TOKENS || 1000,
                temperature: options.temperature || settings.TEMPERATURE || 0.7
            };
            
            const response = await Utils.api.request(CONFIG.ENDPOINTS.COHERE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            return data.generations?.[0]?.text || 'Desculpe, não consegui gerar uma resposta.';
        }
    },
    
    /**
     * Build prompt with context
     * @param {string} message - User message
     * @param {Object} options - Options
     * @returns {string} - Complete prompt
     */
    buildPrompt: (message, options = {}) => {
        const systemPrompt = LLMProviders.getSystemPrompt(options.context);
        return `${systemPrompt}\n\nUsuário: ${message}\n\nAssistente:`;
    },
    
    /**
     * Get system prompt based on context
     * @param {string} context - Context type
     * @returns {string} - System prompt
     */
    getSystemPrompt: (context = 'general') => {
        switch (context) {
            case 'music':
                return CONFIG.EDUCATIONAL_PROMPTS.MUSIC_THEORY;
            case 'research':
                return CONFIG.EDUCATIONAL_PROMPTS.RESEARCH;
            case 'general':
            default:
                return CONFIG.EDUCATIONAL_PROMPTS.GENERAL_EDUCATION;
        }
    },
    
    /**
     * Process message with web search if needed
     * @param {string} message - User message
     * @param {Object} options - Options
     * @returns {Promise<string>}
     */
    processWithWebSearch: async (message, options = {}) => {
        // Check if message requests web search
        if (message.toLowerCase().includes('buscar na web') || 
            message.toLowerCase().includes('pesquisar na internet') ||
            options.webSearch) {
            
            // Extract search query
            const searchQuery = message.replace(/.*?buscar na web:?\s*/i, '')
                                    .replace(/.*?pesquisar na internet:?\s*/i, '');
            
            try {
                // Use DuckDuckGo Instant Answer API (free)
                const searchResults = await LLMProviders.webSearch.search(searchQuery);
                const enhancedMessage = `${message}\n\nResultados da pesquisa:\n${searchResults}`;
                
                return await LLMProviders.sendMessage(enhancedMessage, {
                    ...options,
                    context: 'research'
                });
            } catch (error) {
                console.error('Erro na busca web:', error);
                return await LLMProviders.sendMessage(message, options);
            }
        }
        
        return await LLMProviders.sendMessage(message, options);
    },
    
    // Web search utilities
    webSearch: {
        /**
         * Search the web using DuckDuckGo Instant Answer API
         * @param {string} query - Search query
         * @returns {Promise<string>} - Search results
         */
        search: async (query) => {
            try {
                const encodedQuery = encodeURIComponent(query);
                const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;
                
                const response = await Utils.api.request(url);
                const data = await response.json();
                
                let results = '';
                
                // Abstract
                if (data.Abstract) {
                    results += `Resumo: ${data.Abstract}\n\n`;
                }
                
                // Related topics
                if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                    results += 'Tópicos relacionados:\n';
                    data.RelatedTopics.slice(0, 3).forEach(topic => {
                        if (topic.Text) {
                            results += `- ${topic.Text}\n`;
                        }
                    });
                }
                
                return results || 'Não foram encontrados resultados específicos para esta pesquisa.';
            } catch (error) {
                console.error('Erro na busca web:', error);
                return 'Erro ao realizar busca na web. Respondendo com base no conhecimento interno.';
            }
        }
    },
    
    /**
     * Process file content with AI
     * @param {string} fileContent - File content
     * @param {string} fileName - File name
     * @param {string} action - Action to perform
     * @returns {Promise<string>}
     */
    processFile: async (fileContent, fileName, action = 'analyze') => {
        const fileExtension = Utils.file.getExtension(fileName);
        
        let prompt = '';
        switch (action) {
            case 'summarize':
                prompt = `Por favor, faça um resumo do seguinte documento "${fileName}":\n\n${fileContent}`;
                break;
            case 'explain':
                prompt = `Por favor, explique o conteúdo do seguinte documento "${fileName}" de forma didática:\n\n${fileContent}`;
                break;
            case 'analyze':
            default:
                prompt = `Por favor, analise o seguinte documento "${fileName}" e forneça insights educacionais:\n\n${fileContent}`;
                break;
        }
        
        return await LLMProviders.sendMessage(prompt, {
            context: 'research',
            maxTokens: 1500
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LLMProviders;
}
