// Advanced Integration Configuration for Darcy AI
const AdvancedIntegration = {
    
    // SSH Server Configuration
    sshServer: {
        host: '164.41.168.25',
        port: 13508,
        username: 'darcy',
        // Note: Password should be handled securely in production
        // This is for development/testing only
        isConnected: false,
        connectionStatus: 'disconnected'
    },
    
    // NotebookLM Integration
    notebookLM: {
        enabled: false,
        apiEndpoint: 'https://notebooklm.google.com/api', // Hypothetical endpoint
        features: {
            documentAnalysis: true,
            sourceGeneration: true,
            podcastGeneration: true,
            questionAnswering: true
        }
    },
    
    // Virtual Assistant Integration
    vaIntegration: {
        enabled: true,
        embedCode: {
            // HTML embed code for easy integration
            minimal: `<!-- Darcy AI Minimal Embed -->
<div id="darcy-minimal" style="width: 300px; height: 400px; border: 1px solid #ccc; border-radius: 10px;">
    <iframe src="./index.html?mode=minimal" width="100%" height="100%" frameborder="0"></iframe>
</div>`,
            
            avatar: `<!-- Darcy AI Avatar Widget -->
<div id="darcy-avatar-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
    <iframe src="./index.html?mode=avatar" width="220px" height="320px" frameborder="0" style="border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.3);"></iframe>
</div>`,
            
            fullChat: `<!-- Darcy AI Full Chat -->
<div id="darcy-full-chat" style="width: 100%; height: 600px;">
    <iframe src="./index.html?mode=chat" width="100%" height="100%" frameborder="0"></iframe>
</div>`,
            
            multimodal: `<!-- Darcy AI Multimodal Interface -->
<div id="darcy-multimodal" style="width: 100%; max-width: 800px; height: 700px; margin: 0 auto;">
    <iframe src="./index.html?mode=multimodal" width="100%" height="100%" frameborder="0" style="border-radius: 15px; box-shadow: 0 5px 30px rgba(0,0,0,0.1);"></iframe>
</div>`
        }
    },
    
    // OpenSource AI Models Configuration
    openSourceModels: {
        ollama: {
            enabled: true,
            models: [
                'llama2:7b',
                'llama2:13b', 
                'codellama:7b',
                'mistral:7b',
                'neural-chat:7b',
                'starling-lm:7b'
            ],
            specializedModels: {
                education: 'llama2:7b',
                coding: 'codellama:7b', 
                conversation: 'neural-chat:7b',
                reasoning: 'mistral:7b'
            }
        },
        
        huggingFace: {
            enabled: true,
            models: [
                'microsoft/DialoGPT-medium',
                'facebook/blenderbot-400M-distill',
                'google/flan-t5-large',
                'bigscience/bloom-560m'
            ]
        },
        
        localLLMs: {
            enabled: true,
            supportedFormats: ['GGML', 'GPTQ', 'AWQ', 'ONNX'],
            frameworks: ['llama.cpp', 'GGML', 'transformers.js']
        }
    },
    
    // 24/7 Support Configuration
    support247: {
        enabled: true,
        modes: {
            autonomous: true, // Runs without human intervention
            assisted: false,  // Human oversight available
            hybrid: true      // AI + human backup
        },
        
        availability: {
            timezone: 'America/Sao_Paulo',
            businessHours: '00:00-23:59', // 24/7
            responseTime: {
                simple: '< 5 seconds',
                complex: '< 30 seconds',
                fileProcessing: '< 2 minutes'
            }
        },
        
        capabilities: {
            technical: true,
            pedagogical: true,
            multilingual: true,
            accessibility: true
        }
    },
    
    // Performance Monitoring
    monitoring: {
        enabled: true,
        metrics: {
            responseTime: true,
            accuracy: true,
            userSatisfaction: true,
            systemLoad: true,
            errorRate: true
        },
        
        alerts: {
            slowResponse: 10000, // 10 seconds
            highErrorRate: 0.05, // 5%
            systemOverload: 0.8  // 80%
        }
    },
    
    /**
     * Initialize advanced integrations
     */
    init: async () => {
        console.log('🔧 Inicializando integrações avançadas...');
        
        // Check SSH connection
        await AdvancedIntegration.checkSSHConnection();
        
        // Initialize NotebookLM if available
        await AdvancedIntegration.initNotebookLM();
        
        // Setup VA embed modes
        AdvancedIntegration.setupEmbedModes();
        
        // Initialize monitoring
        AdvancedIntegration.startMonitoring();
        
        console.log('✅ Integrações avançadas inicializadas');
    },
    
    /**
     * Check SSH server connection
     */
    checkSSHConnection: async () => {
        try {
            // Simulate SSH connection check
            // In a real implementation, this would use WebSocket or HTTP proxy
            console.log('🔗 Verificando conexão SSH...');
            
            // For security, we won't actually connect here
            // This would be handled by the backend
            const response = await fetch('/api/ssh/status', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }).catch(() => null);
            
            if (response && response.ok) {
                AdvancedIntegration.sshServer.isConnected = true;
                AdvancedIntegration.sshServer.connectionStatus = 'connected';
                console.log('✅ SSH server conectado');
            } else {
                console.log('⚠️ SSH server não disponível (modo local)');
            }
        } catch (error) {
            console.log('⚠️ SSH connection check failed:', error.message);
        }
    },
    
    /**
     * Initialize NotebookLM integration
     */
    initNotebookLM: async () => {
        try {
            // Check if NotebookLM API is available
            console.log('📓 Verificando NotebookLM...');
            
            // This would be a real API call in production
            const notebookAvailable = false; // Placeholder
            
            if (notebookAvailable) {
                AdvancedIntegration.notebookLM.enabled = true;
                console.log('✅ NotebookLM integrado');
            } else {
                console.log('ℹ️ NotebookLM não disponível (usando alternativas open source)');
                
                // Enable open source alternatives
                AdvancedIntegration.enableOpenSourceAlternatives();
            }
        } catch (error) {
            console.log('⚠️ NotebookLM initialization failed:', error.message);
        }
    },
    
    /**
     * Enable open source alternatives to NotebookLM
     */
    enableOpenSourceAlternatives: () => {
        console.log('🔄 Habilitando alternativas open source...');
        
        // Document analysis alternatives
        const alternatives = {
            documentAnalysis: 'Local PDF.js + Ollama',
            sourceGeneration: 'Local LLM + RAG',
            questionAnswering: 'Ollama + Vector DB',
            podcastGeneration: 'TTS + Script Generation'
        };
        
        console.log('📚 Alternativas habilitadas:', alternatives);
    },
    
    /**
     * Setup embed modes for VA integration
     */
    setupEmbedModes: () => {
        // Check URL parameters for embed mode
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode) {
            console.log(`🎭 Modo de embed detectado: ${mode}`);
            AdvancedIntegration.activateEmbedMode(mode);
        }
    },
    
    /**
     * Activate specific embed mode
     * @param {string} mode - Embed mode (minimal, avatar, chat, multimodal)
     */
    activateEmbedMode: (mode) => {
        const body = document.body;
        body.classList.add(`embed-mode-${mode}`);
        
        switch (mode) {
            case 'minimal':
                AdvancedIntegration.setupMinimalMode();
                break;
            case 'avatar':
                AdvancedIntegration.setupAvatarMode();
                break;
            case 'chat':
                AdvancedIntegration.setupChatMode();
                break;
            case 'multimodal':
                AdvancedIntegration.setupMultimodalMode();
                break;
        }
    },
    
    /**
     * Setup minimal embed mode
     */
    setupMinimalMode: () => {
        // Hide unnecessary elements
        const elementsToHide = ['.header', '.footer', '.settings-panel'];
        elementsToHide.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.style.display = 'none';
        });
        
        // Compact layout
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.style.height = '350px';
            chatContainer.style.margin = '10px';
        }
        
        console.log('📱 Modo minimal ativado');
    },
    
    /**
     * Setup avatar-only mode
     */
    setupAvatarMode: () => {
        // Show only avatar and minimal chat
        const elementsToHide = ['.header', '.footer', '.multimodal-interface'];
        elementsToHide.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.style.display = 'none';
        });
        
        // Position avatar centrally
        const avatarContainer = document.querySelector('.avatar-container');
        if (avatarContainer) {
            avatarContainer.style.position = 'static';
            avatarContainer.style.margin = '20px auto';
        }
        
        console.log('🤖 Modo avatar ativado');
    },
    
    /**
     * Setup chat-focused mode
     */
    setupChatMode: () => {
        // Focus on chat interface
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.style.height = '500px';
        }
        
        console.log('💬 Modo chat ativado');
    },
    
    /**
     * Setup full multimodal mode
     */
    setupMultimodalMode: () => {
        // Ensure all multimodal features are visible
        console.log('🎯 Modo multimodal ativado');
    },
    
    /**
     * Start performance monitoring
     */
    startMonitoring: () => {
        if (!AdvancedIntegration.monitoring.enabled) return;
        
        // Monitor response times
        AdvancedIntegration.monitorResponseTimes();
        
        // Monitor system performance
        AdvancedIntegration.monitorSystemPerformance();
        
        console.log('📊 Monitoramento iniciado');
    },
    
    /**
     * Monitor response times
     */
    monitorResponseTimes: () => {
        const originalSendMessage = window.LLMProviders?.sendMessage;
        if (!originalSendMessage) return;
        
        window.LLMProviders.sendMessage = async (...args) => {
            const startTime = Date.now();
            
            try {
                const result = await originalSendMessage.apply(window.LLMProviders, args);
                const responseTime = Date.now() - startTime;
                
                console.log(`⏱️ Tempo de resposta: ${responseTime}ms`);
                
                if (responseTime > AdvancedIntegration.monitoring.alerts.slowResponse) {
                    console.warn('🐌 Resposta lenta detectada');
                }
                
                return result;
            } catch (error) {
                const responseTime = Date.now() - startTime;
                console.error(`❌ Erro após ${responseTime}ms:`, error);
                throw error;
            }
        };
    },
    
    /**
     * Monitor system performance
     */
    monitorSystemPerformance: () => {
        setInterval(() => {
            // Check memory usage
            if (performance.memory) {
                const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize;
                
                if (memoryUsage > AdvancedIntegration.monitoring.alerts.systemOverload) {
                    console.warn('🧠 Uso alto de memória detectado:', Math.round(memoryUsage * 100) + '%');
                }
            }
            
            // Check for errors
            if (window.onerror || window.addEventListener) {
                // Error monitoring is handled by browser
            }
        }, 30000); // Check every 30 seconds
    },
    
    /**
     * Generate embed code for integration
     * @param {string} mode - Embed mode
     * @param {Object} options - Customization options
     * @returns {string} HTML embed code
     */
    generateEmbedCode: (mode = 'multimodal', options = {}) => {
        const baseUrl = window.location.origin + window.location.pathname;
        const width = options.width || '100%';
        const height = options.height || '600px';
        const style = options.style || '';
        
        return `<!-- Darcy AI Embed - ${mode.toUpperCase()} Mode -->
<div id="darcy-ai-embed" style="width: ${width}; height: ${height}; ${style}">
    <iframe 
        src="${baseUrl}?mode=${mode}"
        width="100%" 
        height="100%" 
        frameborder="0"
        style="border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);"
        allow="microphone; camera; display-capture"
        title="Darcy AI - Tutor Educacional">
    </iframe>
</div>

<script>
// Optional: Communication between parent and iframe
window.addEventListener('message', function(event) {
    if (event.origin !== '${window.location.origin}') return;
    
    // Handle messages from Darcy AI
    console.log('Darcy AI message:', event.data);
});
</script>`;
    },
    
    /**
     * Export configuration for server deployment
     */
    exportServerConfig: () => {
        return {
            sshServer: AdvancedIntegration.sshServer,
            monitoring: AdvancedIntegration.monitoring,
            support247: AdvancedIntegration.support247,
            openSourceModels: AdvancedIntegration.openSourceModels
        };
    }
};

// Auto-initialize when loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        AdvancedIntegration.init();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedIntegration;
}

// Global access
window.AdvancedIntegration = AdvancedIntegration;
