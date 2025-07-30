/**
 * ==================================================================================
 *                                  Darcy AI v2.0
 *                      Main Application Initialization Script
 * 
 *  Orchestrates the initialization of all Darcy AI modules, including:
 *  - Core UI Manager
 *  - Settings Panel
 *  - Storage System
 *  - LLM Providers
 *  - Gamified Avatar System
 *  - Multimodal Input System
 *  - CrewAI Multi-Agent System
 *  - CrewAI-Enhanced Chat Interface
 * ==================================================================================
 */

class DarcyApp {
    constructor() {
        this.uiManager = null;
        this.settingsPanel = null;
        this.storage = null;
        this.llmProviders = null;
        this.chatInterface = null;
        this.avatarSystem = null;
        this.multimodalSystem = null;
        this.crewAISystem = null;
        this.crewAIChatInterface = null;
    }

    /**
     * Initializes all application modules in the correct order.
     */
    async init() {
        console.log("🚀 Initializing Darcy AI v2.0...");

        // These classes are placeholders. In a real app, they would be imported from other files.
        // For this example, we assume they are available in the global scope.
        const dependencies = [
            { name: 'UIManager', check: typeof UIManager !== 'undefined' },
            { name: 'SettingsPanel', check: typeof SettingsPanel !== 'undefined' },
            { name: 'StorageSystem', check: typeof StorageSystem !== 'undefined' },
            { name: 'LLMProviders', check: typeof LLMProviders !== 'undefined' },
            { name: 'ChatInterface', check: typeof ChatInterface !== 'undefined' },
            { name: 'AvatarSystem', check: typeof AvatarSystem !== 'undefined' },
            { name: 'MultimodalSystem', check: typeof MultimodalSystem !== 'undefined' },
            { name: 'DarcyCrewAISystem', check: typeof DarcyCrewAISystem !== 'undefined' },
            { name: 'CrewAIChatInterface', check: typeof CrewAIChatInterface !== 'undefined' }
        ];

        const missing = dependencies.filter(dep => !dep.check);
        if (missing.length > 0) {
            const missingNames = missing.map(d => d.name).join(', ');
            console.error(`❌ Fatal Error: Missing critical dependencies: ${missingNames}. Please ensure all scripts are loaded correctly.`);
            this.uiManager.showError(`Erro Crítico: Dependências ausentes (${missingNames}). A aplicação não pode iniciar.`);
            return;
        }

        // Initialize core components
        this.storage = new StorageSystem();
        this.llmProviders = new LLMProviders(this.storage);
        
        // Initialize UI components
        this.uiManager = new UIManager();
        this.settingsPanel = new SettingsPanel(this.storage, this.llmProviders, this.uiManager);
        this.chatInterface = new ChatInterface(this.llmProviders, this.storage, this.uiManager);

        // Initialize advanced systems
        this.initializeAdvancedSystems();

        // Final setup
        this.setupGlobalEventHandlers();
        this.uiManager.hideLoadingScreen();

        console.log("✅ Darcy AI v2.0 is ready and operational!");
        this.chatInterface.addSystemMessage("Bem-vindo ao Darcy AI v2.0! Agora com equipes de agentes (Crews). Escolha um modo de conversação para começar.");
    }

    /**
     * Initializes the new advanced modules (Avatar, Multimodal, CrewAI).
     */
    initializeAdvancedSystems() {
        console.log("🌟 Initializing advanced systems...");

        // Avatar System
        this.avatarSystem = new AvatarSystem('avatar-container');
        console.log("  - Avatar System Initialized");

        // Multimodal System
        this.multimodalSystem = new MultimodalSystem(this.chatInterface);
        console.log("  - Multimodal System Initialized");

        // CrewAI Integration System
        this.crewAISystem = new DarcyCrewAISystem();
        window.darcyCrewAI = this.crewAISystem; // Make it globally accessible
        this.crewAISystem.integrateWithAvatar(this.avatarSystem);
        this.crewAISystem.integrateWithMultimodal(this.multimodalSystem);
        console.log("  - CrewAI System Initialized");

        // CrewAI Chat Interface
        // Pass necessary components to the new chat interface
        this.crewAIChatInterface = new CrewAIChatInterface(
            this.chatInterface, 
            this.crewAISystem, 
            this.uiManager,
            this.avatarSystem
        );
        console.log("  - CrewAI Chat Interface Initialized");
    }

    /**
     * Sets up global event handlers and service workers.
     */
    setupGlobalEventHandlers() {
        // PWA Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => console.log('Service Worker registered with scope:', registration.scope))
                .catch(error => console.error('Service Worker registration failed:', error));
        }

        // VLibras Initialization
        if (window.VLibras) {
            new window.VLibras.Widget('https://vlibras.gov.br/app');
        } else {
            console.warn("VLibras widget script not found.");
        }
    }
}

// --- Application Entry Point ---
document.addEventListener('DOMContentLoaded', () => {
    // A simple check to ensure UIManager is loaded before we try to use it for error reporting
    if (typeof UIManager === 'undefined') {
        document.body.innerHTML = '<p style="color: red; font-family: sans-serif; padding: 20px;">Erro Crítico: UIManager não foi carregado. Verifique a ordem dos scripts em index.html.</p>';
        return;
    }
    
    const app = new DarcyApp();
    app.init().catch(error => {
        console.error("❌ Fatal error during Darcy AI initialization:", error);
        // Use the UIManager to display the error gracefully
        const uiManager = new UIManager();
        uiManager.showError(`Erro fatal ao carregar o Darcy AI. Verifique o console para detalhes.`);
    });
});