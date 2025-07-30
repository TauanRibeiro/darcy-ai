// Main application file for Darcy AI
class DarcyApp {
    constructor() {
        this.isInitialized = false;
        this.serviceWorker = null;
    }
    
    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('🎓 Inicializando Darcy AI...');
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize core components
            await this.initializeCore();
            
            // Initialize UI components
            this.initializeUI();
            
            // Initialize modules
            this.initializeModules();
            
            // Setup PWA features
            await this.initializePWA();
            
            // Hide loading screen and show app
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            console.log('✅ Darcy AI inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar Darcy AI:', error);
            this.showErrorScreen(error);
        }
    }
    
    /**
     * Initialize core functionality
     */
    async initializeCore() {
        // Check browser compatibility
        this.checkBrowserCompatibility();
        
        // Initialize storage
        if (!Storage.isAvailable()) {
            throw new Error('LocalStorage não está disponível');
        }
        
        // Load settings
        const settings = Storage.settings.getAll();
        console.log('Settings loaded:', settings);
        
        // Set theme
        const theme = Storage.settings.get('THEME', 'light');
        Utils.theme.setTheme(theme);
        
        // Check LLM provider availability
        await this.checkLLMAvailability();
    }
    
    /**
     * Initialize UI components
     */
    initializeUI() {
        // Setup theme toggle
        this.setupThemeToggle();
        
        // Setup settings modal
        this.setupSettingsModal();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup responsive behavior
        this.setupResponsiveBehavior();
    }
    
    /**
     * Initialize application modules
     */
    initializeModules() {
        // Initialize chat
        Chat.init();
        
        // Initialize file handler
        FileHandler.init();
        
        // Initialize speech if supported
        if (Speech.recognition.isSupported() || Speech.synthesis.isSupported()) {
            console.log('🎤 Recursos de voz disponíveis');
        }
    }
    
    /**
     * Initialize PWA features
     */
    async initializePWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', this.serviceWorker);
            } catch (error) {
                console.warn('Falha ao registrar Service Worker:', error);
            }
        }
        
        // Setup install prompt
        this.setupInstallPrompt();
        
        // Handle app updates
        this.handleAppUpdates();
    }
    
    /**
     * Check browser compatibility
     */
    checkBrowserCompatibility() {
        const requiredFeatures = [
            'fetch',
            'localStorage',
            'addEventListener',
            'querySelector',
            'Promise'
        ];
        
        const unsupportedFeatures = requiredFeatures.filter(feature => {
            return !(feature in window) && !(feature in document);
        });
        
        if (unsupportedFeatures.length > 0) {
            throw new Error(`Navegador não suportado. Recursos ausentes: ${unsupportedFeatures.join(', ')}`);
        }
    }
    
    /**
     * Check LLM provider availability
     */
    async checkLLMAvailability() {
        const settings = Storage.settings.getAll();
        const provider = settings.PROVIDER;
        
        const isAvailable = await LLMProviders.checkAvailability(provider);
        
        if (!isAvailable) {
            console.warn(`Provider ${provider} não está disponível`);
            
            // Try to fallback to Ollama
            if (provider !== 'ollama') {
                const ollamaAvailable = await LLMProviders.checkAvailability('ollama');
                if (ollamaAvailable) {
                    Storage.settings.set('PROVIDER', 'ollama');
                    console.log('Fallback para Ollama');
                }
            }
        }
    }
    
    /**
     * Setup theme toggle functionality
     */
    setupThemeToggle() {
        const themeToggle = Utils.dom.getId('theme-toggle');
        
        if (themeToggle) {
            // Set initial icon
            const currentTheme = Utils.theme.getTheme();
            themeToggle.innerHTML = currentTheme === 'light' ? '🌙' : '☀️';
            
            themeToggle.addEventListener('click', () => {
                Utils.theme.toggleTheme();
                const newTheme = Utils.theme.getTheme();
                themeToggle.innerHTML = newTheme === 'light' ? '🌙' : '☀️';
                
                // Save to settings
                Storage.settings.set('THEME', newTheme);
                
                Utils.notification.showToast(`Tema ${newTheme === 'light' ? 'claro' : 'escuro'} ativado`, 'success');
            });
        }
    }
    
    /**
     * Setup settings modal
     */
    setupSettingsModal() {
        const settingsBtn = Utils.dom.getId('settings-btn');
        const settingsModal = Utils.dom.getId('settings-modal');
        const closeSettings = Utils.dom.getId('close-settings');
        const saveSettings = Utils.dom.getId('save-settings');
        const resetSettings = Utils.dom.getId('reset-settings');
        
        // Open modal
        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => {
                this.openSettingsModal();
            });
        }
        
        // Close modal
        if (closeSettings && settingsModal) {
            closeSettings.addEventListener('click', () => {
                settingsModal.style.display = 'none';
            });
        }
        
        // Close on backdrop click
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    settingsModal.style.display = 'none';
                }
            });
        }
        
        // Save settings
        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.saveSettings();
            });
        }
        
        // Reset settings
        if (resetSettings) {
            resetSettings.addEventListener('click', () => {
                this.resetSettings();
            });
        }
    }
    
    /**
     * Open settings modal
     */
    openSettingsModal() {
        const settingsModal = Utils.dom.getId('settings-modal');
        const currentSettings = Storage.settings.getAll();
        
        // Populate form with current settings
        const providerSelect = Utils.dom.getId('llm-provider');
        const apiKeyInput = Utils.dom.getId('api-key');
        const modelSelect = Utils.dom.getId('model-select');
        const voiceCheckbox = Utils.dom.getId('voice-responses');
        const historyCheckbox = Utils.dom.getId('save-history');
        
        if (providerSelect) {
            providerSelect.value = currentSettings.PROVIDER;
            this.updateModelOptions(currentSettings.PROVIDER);
        }
        
        if (apiKeyInput) {
            const apiKey = Storage.apiKeys.get(currentSettings.PROVIDER);
            apiKeyInput.value = apiKey ? '••••••••' : '';
        }
        
        if (modelSelect) {
            modelSelect.value = currentSettings.MODEL;
        }
        
        if (voiceCheckbox) {
            voiceCheckbox.checked = currentSettings.VOICE_ENABLED;
        }
        
        if (historyCheckbox) {
            historyCheckbox.checked = currentSettings.SAVE_HISTORY;
        }
        
        // Setup provider change handler
        if (providerSelect) {
            providerSelect.addEventListener('change', (e) => {
                this.updateModelOptions(e.target.value);
                
                // Update API key field
                if (apiKeyInput) {
                    const apiKey = Storage.apiKeys.get(e.target.value);
                    apiKeyInput.value = apiKey ? '••••••••' : '';
                    apiKeyInput.placeholder = e.target.value === 'ollama' ? 
                        'Não necessário para Ollama local' : 
                        'Cole sua chave da API aqui';
                }
            });
        }
        
        settingsModal.style.display = 'flex';
    }
    
    /**
     * Update model options based on provider
     * @param {string} provider - Selected provider
     */
    updateModelOptions(provider) {
        const modelSelect = Utils.dom.getId('model-select');
        if (!modelSelect) return;
        
        modelSelect.innerHTML = '';
        
        const models = CONFIG.MODELS[provider] || [];
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name + (model.size ? ` (${model.size})` : '');
            modelSelect.appendChild(option);
        });
    }
    
    /**
     * Save settings from modal
     */
    saveSettings() {
        const providerSelect = Utils.dom.getId('llm-provider');
        const apiKeyInput = Utils.dom.getId('api-key');
        const modelSelect = Utils.dom.getId('model-select');
        const voiceCheckbox = Utils.dom.getId('voice-responses');
        const historyCheckbox = Utils.dom.getId('save-history');
        
        const newSettings = {};
        
        if (providerSelect) {
            newSettings.PROVIDER = providerSelect.value;
        }
        
        if (modelSelect) {
            newSettings.MODEL = modelSelect.value;
        }
        
        if (voiceCheckbox) {
            newSettings.VOICE_ENABLED = voiceCheckbox.checked;
        }
        
        if (historyCheckbox) {
            newSettings.SAVE_HISTORY = historyCheckbox.checked;
        }
        
        // Save API key if provided and not masked
        if (apiKeyInput && apiKeyInput.value && apiKeyInput.value !== '••••••••') {
            Storage.apiKeys.set(newSettings.PROVIDER, apiKeyInput.value);
        }
        
        // Update settings
        Storage.settings.update(newSettings);
        
        // Close modal
        const settingsModal = Utils.dom.getId('settings-modal');
        settingsModal.style.display = 'none';
        
        Utils.notification.showToast('Configurações salvas', 'success');
    }
    
    /**
     * Reset settings to defaults
     */
    resetSettings() {
        if (confirm('Tem certeza que deseja resetar todas as configurações?')) {
            Storage.settings.reset();
            Storage.apiKeys.clear();
            
            const settingsModal = Utils.dom.getId('settings-modal');
            settingsModal.style.display = 'none';
            
            Utils.notification.showToast('Configurações resetadas', 'success');
            
            // Reload page to apply changes
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to send message
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                Chat.handleSendMessage();
            }
            
            // Ctrl/Cmd + K to focus input
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const userInput = Utils.dom.getId('user-input');
                if (userInput) userInput.focus();
            }
            
            // Ctrl/Cmd + , to open settings
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                this.openSettingsModal();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                const settingsModal = Utils.dom.getId('settings-modal');
                if (settingsModal && settingsModal.style.display === 'flex') {
                    settingsModal.style.display = 'none';
                }
            }
        });
    }
    
    /**
     * Setup responsive behavior
     */
    setupResponsiveBehavior() {
        // Handle viewport changes
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleViewportChange();
        }, 250));
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleViewportChange();
            }, 100);
        });
    }
    
    /**
     * Handle viewport changes
     */
    handleViewportChange() {
        // Update CSS custom properties for viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Auto-scroll to latest message
        const chatMessages = Utils.dom.getId('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    /**
     * Setup install prompt for PWA
     */
    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button (you can create this UI element)
            console.log('PWA pode ser instalado');
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('PWA foi instalado');
            Utils.notification.showToast('Darcy AI instalado com sucesso!', 'success');
        });
    }
    
    /**
     * Handle app updates
     */
    handleAppUpdates() {
        if (this.serviceWorker) {
            this.serviceWorker.addEventListener('updatefound', () => {
                const newWorker = this.serviceWorker.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        Utils.notification.showToast('Nova versão disponível. Recarregue a página.', 'info');
                    }
                });
            });
        }
    }
    
    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = Utils.dom.getId('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = Utils.dom.getId('loading-screen');
        const app = Utils.dom.getId('app');
        
        setTimeout(() => {
            if (loadingScreen) {
                Utils.animation.fadeOut(loadingScreen, 300);
            }
            
            if (app) {
                app.style.display = 'flex';
                Utils.animation.fadeIn(app, 300);
            }
        }, 500); // Small delay to show loading
    }
    
    /**
     * Show error screen
     * @param {Error} error - Error object
     */
    showErrorScreen(error) {
        const loadingScreen = Utils.dom.getId('loading-screen');
        
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">❌</div>
                    <h2>Erro ao carregar Darcy AI</h2>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()" class="btn-primary">
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new DarcyApp();
    app.init();
});

// Export app instance
window.DarcyApp = DarcyApp;
