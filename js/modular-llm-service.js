// Darcy AI - Modular LLM Service
// Frontend service for communicating with the modular backend

class ModularLLMService {
    constructor() {
        this.config = window.DarcyConfig;
        this.currentProvider = null;
        this.healthStatus = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
        
        console.log('🔧 Serviço Modular LLM inicializado');
        this.initialize();
    }

    async initialize() {
        try {
            await this.checkSystemHealth();
            await this.fetchProviderStatus();
            
            // Set up periodic health checks
            setInterval(() => this.checkSystemHealth(), 60000); // Every minute
            
        } catch (error) {
            console.warn('⚠️ Erro na inicialização do sistema:', error.message);
        }
    }

    async checkSystemHealth() {
        try {
            const response = await this.makeRequest('/api/health', { method: 'GET' });
            
            if (response.ok) {
                const health = await response.json();
                this.updateSystemStatus(health);
                return health;
            }
        } catch (error) {
            console.warn('🩺 Health check falhou:', error.message);
            return { status: 'unknown', fallbackAvailable: true };
        }
    }

    async fetchProviderStatus() {
        try {
            const response = await this.makeRequest('/api/providers', { method: 'GET' });
            
            if (response.ok) {
                const providers = await response.json();
                this.updateProviderStatus(providers);
                return providers;
            }
        } catch (error) {
            console.warn('📡 Falha ao buscar status dos provedores:', error.message);
            return null;
        }
    }

    updateSystemStatus(health) {
        const statusIndicator = document.getElementById('system-status');
        if (statusIndicator) {
            statusIndicator.className = `system-status ${health.status}`;
            statusIndicator.textContent = health.status === 'healthy' ? '🟢' : '🟡';
            statusIndicator.title = `Sistema: ${health.status} | Provedores: ${health.providers || 0}`;
        }

        // Update global status
        window.DarcySystemStatus = health;
    }

    updateProviderStatus(providers) {
        this.currentProvider = providers.current;
        
        // Update UI if provider status panel exists
        const providerPanel = document.getElementById('provider-status-panel');
        if (providerPanel) {
            this.renderProviderStatus(providerPanel, providers);
        }

        // Show provider notification if changed
        if (this.currentProvider && this.lastProvider !== this.currentProvider) {
            this.showProviderNotification(this.currentProvider);
            this.lastProvider = this.currentProvider;
        }
    }

    renderProviderStatus(panel, providers) {
        const providerConfig = this.config.PROVIDERS;
        
        panel.innerHTML = `
            <div class="provider-header">
                <h3>🤖 Provedores LLM</h3>
                <span class="provider-count">${providers.summary.healthy}/${providers.summary.total} ativos</span>
            </div>
            
            <div class="current-provider">
                <div class="provider-info">
                    <span class="provider-icon">${providerConfig[providers.current]?.icon || '🤖'}</span>
                    <div class="provider-details">
                        <strong>${providers.current || 'Simulação'}</strong>
                        <small>${providerConfig[providers.current]?.description || 'Modo inteligente'}</small>
                    </div>
                </div>
            </div>
            
            <div class="providers-list">
                ${Object.entries(providers.providers).map(([name, status]) => `
                    <div class="provider-item ${status.status}">
                        <span class="provider-icon">${providerConfig[name]?.icon || '🔧'}</span>
                        <span class="provider-name">${name}</span>
                        <span class="provider-status ${status.status}">
                            ${status.status === 'healthy' ? '✅' : status.status === 'unhealthy' ? '❌' : '⚠️'}
                        </span>
                    </div>
                `).join('')}
            </div>
            
            ${providers.recommendations.length > 0 ? `
                <div class="provider-recommendations">
                    <h4>💡 Recomendações</h4>
                    ${providers.recommendations.map(rec => `<p>${rec}</p>`).join('')}
                </div>
            ` : ''}
        `;
    }

    showProviderNotification(provider) {
        const config = this.config.PROVIDERS[provider];
        const message = `Usando ${provider} ${config?.icon || ''} - ${config?.description || ''}`;
        
        this.showNotification(message, 'info', 3000);
    }

    async sendMessage(crew, message, options = {}) {
        // Add to queue if already processing
        if (this.isProcessing) {
            return new Promise((resolve, reject) => {
                this.requestQueue.push({ crew, message, options, resolve, reject });
            });
        }

        this.isProcessing = true;

        try {
            const startTime = Date.now();
            
            // Show processing indicator
            this.showProcessingIndicator(crew);
            
            const result = await this.makeCrewRequest(crew, message, options);
            const processingTime = Date.now() - startTime;
            
            // Hide processing indicator
            this.hideProcessingIndicator();
            
            // Update metrics
            this.updateMetrics(crew, processingTime, result.metadata);
            
            // Process queue
            this.processQueue();
            
            return result;
            
        } catch (error) {
            this.hideProcessingIndicator();
            this.processQueue();
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    async makeCrewRequest(crew, message, options) {
        const endpoint = this.getOptimalEndpoint();
        
        const requestData = {
            mode: crew,
            query: message,
            options: {
                format: 'markdown',
                maxTokens: 1200,
                temperature: this.getOptimalTemperature(crew),
                ...options
            }
        };

        try {
            const response = await this.makeRequest(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            
            // Log successful request
            console.log(`✅ Resposta recebida de ${result.metadata?.llmProvider || 'sistema'} em ${result.metadata?.processingTime || 'N/A'}`);
            
            return result;
            
        } catch (error) {
            console.error('❌ Erro na requisição:', error.message);
            
            // Try fallback endpoint if main fails
            if (endpoint === this.config.API.ENDPOINTS.CREW_EXECUTE) {
                console.log('🔄 Tentando endpoint alternativo...');
                return await this.makeCrewRequest(crew, message, { ...options, _fallback: true });
            }
            
            throw error;
        }
    }

    getOptimalEndpoint() {
        const isProduction = window.location.hostname !== 'localhost';
        return isProduction 
            ? this.config.API.ENDPOINTS.CREW_EXECUTE_VERCEL
            : this.config.API.ENDPOINTS.CREW_EXECUTE;
    }

    getOptimalTemperature(crew) {
        const temperatures = {
            teaching: 0.6,
            research: 0.4,
            creative: 0.8,
            assessment: 0.5
        };
        return temperatures[crew] || 0.7;
    }

    async makeRequest(endpoint, options = {}) {
        const url = this.config.API.BASE_URL + endpoint;
        const timeout = options.timeout || this.config.API.TIMEOUT;
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        );
        
        // Make request with timeout
        const requestPromise = fetch(url, {
            ...options,
            headers: {
                'Accept': 'application/json',
                ...options.headers
            }
        });
        
        return Promise.race([requestPromise, timeoutPromise]);
    }

    showProcessingIndicator(crew) {
        const crewConfig = this.config.CREWS[crew];
        const indicator = document.getElementById('processing-indicator');
        
        if (indicator) {
            indicator.style.display = 'flex';
            indicator.innerHTML = `
                <div class="processing-animation">
                    <div class="spinner"></div>
                    <div class="processing-text">
                        <strong>${crewConfig?.icon || '🤖'} ${crewConfig?.name || 'Darcy AI'}</strong>
                        <small>Processando sua solicitação...</small>
                    </div>
                </div>
            `;
        }

        // Update avatar state if available
        if (window.AvatarSystem) {
            window.AvatarSystem.setState('thinking');
        }
    }

    hideProcessingIndicator() {
        const indicator = document.getElementById('processing-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }

        // Reset avatar state if available
        if (window.AvatarSystem) {
            window.AvatarSystem.setState('idle');
        }
    }

    updateMetrics(crew, processingTime, metadata) {
        if (!window.DarcyMetrics) {
            window.DarcyMetrics = {
                requests: 0,
                totalTime: 0,
                averageTime: 0,
                crewUsage: {},
                providerUsage: {}
            };
        }

        const metrics = window.DarcyMetrics;
        metrics.requests++;
        metrics.totalTime += processingTime;
        metrics.averageTime = metrics.totalTime / metrics.requests;
        
        // Update crew usage
        metrics.crewUsage[crew] = (metrics.crewUsage[crew] || 0) + 1;
        
        // Update provider usage
        if (metadata?.llmProvider) {
            metrics.providerUsage[metadata.llmProvider] = (metrics.providerUsage[metadata.llmProvider] || 0) + 1;
        }

        // Update metrics display if exists
        this.updateMetricsDisplay(metrics);
    }

    updateMetricsDisplay(metrics) {
        const metricsPanel = document.getElementById('metrics-panel');
        if (metricsPanel) {
            metricsPanel.innerHTML = `
                <div class="metrics-header">
                    <h3>📊 Estatísticas</h3>
                </div>
                <div class="metrics-grid">
                    <div class="metric-item">
                        <span class="metric-value">${metrics.requests}</span>
                        <span class="metric-label">Solicitações</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-value">${Math.round(metrics.averageTime)}ms</span>
                        <span class="metric-label">Tempo Médio</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-value">${Object.keys(metrics.crewUsage).length}</span>
                        <span class="metric-label">Equipes Usadas</span>
                    </div>
                </div>
            `;
        }
    }

    processQueue() {
        if (this.requestQueue.length > 0 && !this.isProcessing) {
            const next = this.requestQueue.shift();
            this.sendMessage(next.crew, next.message, next.options)
                .then(next.resolve)
                .catch(next.reject);
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        // Try to use existing notification system
        if (window.Utils && window.Utils.showToast) {
            window.Utils.showToast(message, type, duration);
            return;
        }

        // Fallback notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#3B82F6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    // Public API for external usage
    getSystemStatus() {
        return window.DarcySystemStatus || { status: 'unknown' };
    }

    getCurrentProvider() {
        return this.currentProvider || 'Simulação';
    }

    getMetrics() {
        return window.DarcyMetrics || {};
    }

    async switchProvider(providerName) {
        // This would be implemented if backend supports manual provider switching
        console.log(`🔄 Solicitação para trocar para ${providerName} (funcionalidade futura)`);
    }
}

// Initialize service when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ModularLLMService = new ModularLLMService();
});

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModularLLMService;
}
