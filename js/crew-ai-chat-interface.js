/**
 * Enhanced Chat Interface with CrewAI Integration
 * Extends existing chat interface to support multi-agent conversations
 */

class CrewAIChatInterface {
    constructor() {
        this.crewSystem = window.darcyCrewAI;
        this.activeFlow = null;
        this.currentCrew = null;
        this.conversationMode = 'single'; // 'single', 'crew', 'flow'
        
        this.initializeInterface();
        this.setupEventHandlers();
    }

    initializeInterface() {
        // Add crew controls to existing chat interface
        this.addCrewControls();
        this.addFlowControls();
        this.addAgentIndicators();
    }

    addCrewControls() {
        const inputArea = document.querySelector('.input-area');
        if (!inputArea) return;

        const crewControls = document.createElement('div');
        crewControls.className = 'crew-controls';
        crewControls.innerHTML = `
            <div class="crew-selector">
                <label for="crew-mode">Modo de Conversação:</label>
                <select id="crew-mode" class="crew-mode-select">
                    <option value="single">Darcy Individual</option>
                    <option value="teaching">Equipe de Ensino</option>
                    <option value="research">Equipe de Pesquisa</option>
                    <option value="creative">Equipe Criativa</option>
                    <option value="assessment">Equipe de Avaliação</option>
                </select>
            </div>
            
            <div class="flow-selector" style="display: none;">
                <label for="flow-mode">Fluxo de Aprendizagem:</label>
                <select id="flow-mode" class="flow-mode-select">
                    <option value="">Selecione um fluxo</option>
                    <option value="learning_session">Sessão Completa de Aprendizagem</option>
                    <option value="document_analysis">Análise de Documentos</option>
                    <option value="project_learning">Aprendizagem por Projetos</option>
                </select>
            </div>

            <div class="crew-status" style="display: none;">
                <div class="active-agents"></div>
                <div class="flow-progress"></div>
            </div>
        `;

        inputArea.insertBefore(crewControls, inputArea.firstChild);
    }

    addFlowControls() {
        // Add flow control buttons
        const quickActions = document.querySelector('.quick-actions');
        if (!quickActions) return;

        // Insert crew-specific quick actions
        const crewActions = document.createElement('div');
        crewActions.className = 'crew-quick-actions';
        crewActions.innerHTML = `
            <button class="quick-action crew-action" data-action="start-learning-session">
                🎓 Iniciar Sessão de Aprendizagem
            </button>
            <button class="quick-action crew-action" data-action="analyze-documents">
                📄 Analisar Documentos
            </button>
            <button class="quick-action crew-action" data-action="create-project">
                🛠️ Criar Projeto
            </button>
            <button class="quick-action crew-action" data-action="assess-progress">
                📊 Avaliar Progresso
            </button>
        `;

        quickActions.appendChild(crewActions);
    }

    addAgentIndicators() {
        // Add visual indicators for active agents
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;

        const agentIndicators = document.createElement('div');
        agentIndicators.className = 'agent-indicators';
        agentIndicators.innerHTML = `
            <div class="agents-panel">
                <h4>Agentes Ativos</h4>
                <div class="agent-list"></div>
            </div>
        `;

        chatContainer.appendChild(agentIndicators);
    }

    setupEventHandlers() {
        // Crew mode selector
        const crewModeSelect = document.getElementById('crew-mode');
        if (crewModeSelect) {
            crewModeSelect.addEventListener('change', (e) => {
                this.handleCrewModeChange(e.target.value);
            });
        }

        // Flow mode selector
        const flowModeSelect = document.getElementById('flow-mode');
        if (flowModeSelect) {
            flowModeSelect.addEventListener('change', (e) => {
                this.handleFlowModeChange(e.target.value);
            });
        }

        // Crew quick actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('crew-action')) {
                this.handleCrewAction(e.target.dataset.action);
            }
        });

        // Override existing send message handler
        this.overrideSendMessage();
    }

    handleCrewModeChange(mode) {
        this.conversationMode = mode;
        
        if (mode === 'single') {
            this.hideCrewInterface();
            this.showSingleMode();
        } else {
            this.showCrewInterface();
            this.currentCrew = mode;
            this.updateAgentIndicators(mode);
        }

        this.addSystemMessage(`Modo alterado para: ${this.getModeName(mode)}`);
    }

    handleFlowModeChange(flowName) {
        if (!flowName) return;

        this.conversationMode = 'flow';
        this.addSystemMessage(`Iniciando fluxo: ${this.getFlowName(flowName)}`);
        this.startFlow(flowName);
    }

    async handleCrewAction(action) {
        switch (action) {
            case 'start-learning-session':
                await this.startLearningSession();
                break;
            case 'analyze-documents':
                await this.startDocumentAnalysis();
                break;
            case 'create-project':
                await this.startProjectCreation();
                break;
            case 'assess-progress':
                await this.startProgressAssessment();
                break;
        }
    }

    async startLearningSession() {
        this.addSystemMessage('🎓 Iniciando sessão completa de aprendizagem...');
        
        // Get learning preferences from user
        const preferences = await this.getUserPreferences();
        
        try {
            const result = await this.crewSystem.executeFlow('learning_session', {
                subject: preferences.subject,
                studentLevel: preferences.level,
                learningStyle: preferences.style
            });
            
            this.displayFlowResult(result, 'learning_session');
        } catch (error) {
            this.addErrorMessage('Erro ao executar sessão de aprendizagem: ' + error.message);
        }
    }

    async startDocumentAnalysis() {
        this.addSystemMessage('📄 Preparando análise de documentos...');
        
        // Trigger file upload
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.click();
            
            fileInput.onchange = async (e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                    await this.analyzeDocuments(files);
                }
            };
        }
    }

    async analyzeDocuments(files) {
        this.addSystemMessage(`📄 Analisando ${files.length} documento(s) com equipe de pesquisa...`);
        
        try {
            const result = await this.crewSystem.executeFlow('document_analysis', {
                files: files,
                analysisType: 'educational',
                generateQuestions: true
            });
            
            this.displayFlowResult(result, 'document_analysis');
        } catch (error) {
            this.addErrorMessage('Erro na análise de documentos: ' + error.message);
        }
    }

    async startProjectCreation() {
        this.addSystemMessage('🛠️ Iniciando criação de projeto com equipe criativa...');
        
        const projectType = await this.getProjectType();
        
        try {
            const result = await this.crewSystem.executeFlow('project_learning', {
                projectType: projectType,
                studentLevel: 'intermediate',
                includeAssessment: true
            });
            
            this.displayFlowResult(result, 'project_learning');
        } catch (error) {
            this.addErrorMessage('Erro na criação de projeto: ' + error.message);
        }
    }

    async startProgressAssessment() {
        this.addSystemMessage('📊 Iniciando avaliação de progresso...');
        
        try {
            const result = await this.crewSystem.executeCrew('assessment', 
                'Avaliar progresso geral do estudante e fornecer feedback detalhado', {
                sessionHistory: this.getSessionHistory(),
                timeframe: '1_week'
            });
            
            this.displayCrewResult(result, 'assessment');
        } catch (error) {
            this.addErrorMessage('Erro na avaliação: ' + error.message);
        }
    }

    overrideSendMessage() {
        // Find and override the existing send message function
        const originalSendMessage = window.sendMessage || this.findOriginalSendMessage();
        
        window.sendMessage = async (message) => {
            if (this.conversationMode === 'single') {
                return originalSendMessage(message);
            } else if (this.conversationMode === 'crew') {
                return this.sendCrewMessage(message);
            } else if (this.conversationMode === 'flow') {
                return this.sendFlowMessage(message);
            }
        };
    }

    async sendCrewMessage(message) {
        // Display user message
        this.addUserMessage(message);
        
        // Show crew thinking
        this.showCrewThinking();
        
        try {
            // const result = await this.crewSystem.executeCrew(this.currentCrew, message, {
            //     conversationHistory: this.getConversationHistory(),
            -            //     timestamp: Date.now()
            // });
            const response = await fetch('https://darcy-ai-seven.vercel.app/api/index', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mode: this.currentCrew,
                    query: message
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'A resposta do servidor não foi bem-sucedida.');
            }

            const result = await response.json();
            
            this.hideCrewThinking();
            this.displayCrewResult(result.result, this.currentCrew);
            
        } catch (error) {
            this.hideCrewThinking();
            this.addErrorMessage('Erro na execução da equipe: ' + error.message);
        }
    }

    async sendFlowMessage(message) {
        // Handle flow-based conversation
        this.addUserMessage(message);
        
        if (this.activeFlow) {
            // Continue active flow with user input
            await this.continueFlow(message);
        } else {
            // Regular crew message
            await this.sendCrewMessage(message);
        }
    }

    displayCrewResult(result, crewName) {
        if (result.type === 'sequential') {
            this.displaySequentialResult(result, crewName);
        } else if (result.type === 'collaborative') {
            this.displayCollaborativeResult(result, crewName);
        } else if (result.manager) {
            this.displayHierarchicalResult(result, crewName);
        }
    }

    displaySequentialResult(result, crewName) {
        const crewInfo = this.crewSystem.crews.get(crewName);
        
        // Show each agent's contribution
        result.steps.forEach((step, index) => {
            const agent = crewInfo.agents.find(a => a.id === step.agent);
            this.addAgentMessage(step.result, agent.role, agent.id);
        });
        
        // Show final synthesis
        this.addSystemMessage(`✅ Tarefa concluída pela ${crewInfo.name}`);
    }

    displayCollaborativeResult(result, crewName) {
        const crewInfo = this.crewSystem.crews.get(crewName);
        
        // Show collaborative header
        this.addSystemMessage(`🤝 Resultado colaborativo da ${crewInfo.name}:`);
        
        // Show each perspective
        result.perspectives.forEach(perspective => {
            const agent = crewInfo.agents.find(a => a.id === perspective.agent);
            this.addAgentMessage(perspective.result, agent.role, agent.id, 'collaborative');
        });
        
        // Show synthesis
        this.addSystemMessage('**Síntese Colaborativa:**');
        this.addAgentMessage(result.synthesis, 'Síntese da Equipe', 'synthesis');
    }

    displayHierarchicalResult(result, crewName) {
        // Show manager and worker results
        this.addSystemMessage(`👑 Resultado hierárquico com gerente: ${result.manager}`);
        
        result.delegations.forEach(delegation => {
            this.addAgentMessage(delegation.result, delegation.role, delegation.agent, 'worker');
        });
        
        this.addAgentMessage(result.synthesis, result.manager, 'manager', 'final');
    }

    displayFlowResult(result, flowName) {
        this.addSystemMessage(`🔄 Fluxo ${this.getFlowName(flowName)} concluído:`);
        
        result.steps.forEach(step => {
            this.addSystemMessage(`📍 ${step.stepId}: Concluído`);
            if (step.result && step.result.synthesis) {
                this.addAgentMessage(step.result.synthesis, 'Resultado do Fluxo', 'flow');
            }
        });
    }

    addAgentMessage(content, role, agentId, type = 'default') {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message agent-message agent-message-${type}`;
        
        const agentIcon = this.getAgentIcon(agentId);
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <div class="agent-info">
                    <span class="agent-icon">${agentIcon}</span>
                    <span class="agent-role">${role}</span>
                </div>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="message-content">
                ${this.formatMessageContent(content)}
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addSystemMessage(content) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="system-icon">🤖</span>
                ${content}
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addUserMessage(content) {
        // Use existing addUserMessage if available
        if (window.ChatInterface && window.ChatInterface.addUserMessage) {
            window.ChatInterface.addUserMessage(content);
        } else {
            // Fallback implementation
            const messagesContainer = document.getElementById('chat-messages');
            if (!messagesContainer) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = 'message user-message';
            messageDiv.innerHTML = `
                <div class="message-content">${content}</div>
            `;

            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    addErrorMessage(content) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message error-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="error-icon">❌</span>
                ${content}
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showCrewThinking() {
        const crewInfo = this.crewSystem.crews.get(this.currentCrew);
        const typingIndicator = document.getElementById('typing-indicator');
        
        if (typingIndicator) {
            typingIndicator.innerHTML = `
                <div class="crew-thinking">
                    <div class="thinking-agents">
                        ${crewInfo.agents.map(agent => `
                            <div class="thinking-agent">
                                <span class="agent-icon">${this.getAgentIcon(agent.id)}</span>
                                <span class="agent-name">${agent.role}</span>
                                <div class="thinking-animation">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="crew-status">
                        ${crewInfo.name} está trabalhando...
                    </div>
                </div>
            `;
            typingIndicator.style.display = 'block';
        }

        // Update avatar to show crew activity
        if (window.AvatarSystem) {
            window.AvatarSystem.setState('thinking', `Equipe ${crewInfo.name} colaborando`);
            window.AvatarSystem.showCrewActivity(crewInfo.name, crewInfo.agents.length);
        }
    }

    hideCrewThinking() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }

        // Reset avatar
        if (window.AvatarSystem) {
            window.AvatarSystem.setState('neutral');
        }
    }

    updateAgentIndicators(crewName) {
        const agentList = document.querySelector('.agent-list');
        if (!agentList) return;

        const crewInfo = this.crewSystem.crews.get(crewName);
        if (!crewInfo) return;

        agentList.innerHTML = crewInfo.agents.map(agent => `
            <div class="agent-indicator">
                <span class="agent-icon">${this.getAgentIcon(agent.id)}</span>
                <div class="agent-details">
                    <div class="agent-role">${agent.role}</div>
                    <div class="agent-specializations">
                        ${agent.specializations.slice(0, 2).join(', ')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getAgentIcon(agentId) {
        const icons = {
            'primary_tutor': '👨‍🏫',
            'concept_explainer': '🧠',
            'practice_generator': '📝',
            'document_analyst': '📄',
            'research_synthesizer': '🔍',
            'source_validator': '✅',
            'project_designer': '🎨',
            'code_mentor': '💻',
            'presentation_coach': '🎤',
            'progress_tracker': '📊',
            'feedback_specialist': '💬',
            'adaptation_strategist': '🎯',
            'synthesis': '🧩',
            'manager': '👑',
            'flow': '🔄'
        };
        
        return icons[agentId] || '🤖';
    }

    getModeName(mode) {
        const names = {
            'single': 'Darcy Individual',
            'teaching': 'Equipe de Ensino',
            'research': 'Equipe de Pesquisa',
            'creative': 'Equipe Criativa',
            'assessment': 'Equipe de Avaliação'
        };
        
        return names[mode] || mode;
    }

    getFlowName(flowName) {
        const names = {
            'learning_session': 'Sessão Completa de Aprendizagem',
            'document_analysis': 'Análise de Documentos',
            'project_learning': 'Aprendizagem por Projetos'
        };
        
        return names[flowName] || flowName;
    }

    formatMessageContent(content) {
        // Basic markdown formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // Utility methods
    async getUserPreferences() {
        // Simple implementation - could be enhanced with modal dialog
        return {
            subject: prompt('Qual matéria você gostaria de estudar?') || 'Geral',
            level: prompt('Qual seu nível? (iniciante/intermediário/avançado)') || 'intermediário',
            style: prompt('Qual seu estilo de aprendizagem preferido?') || 'visual'
        };
    }

    async getProjectType() {
        return prompt('Que tipo de projeto você gostaria de criar?') || 'projeto_geral';
    }

    getConversationHistory() {
        // Get last 10 messages from chat
        const messages = document.querySelectorAll('#chat-messages .message');
        return Array.from(messages).slice(-10).map(msg => ({
            content: msg.querySelector('.message-content').textContent,
            type: msg.classList.contains('user-message') ? 'user' : 'assistant',
            timestamp: Date.now()
        }));
    }

    getSessionHistory() {
        // Get session data from storage
        return JSON.parse(localStorage.getItem('darcy_session_history') || '[]');
    }

    findOriginalSendMessage() {
        // Try to find the original send message function
        return window.originalSendMessage || function(msg) {
            console.log('Original send message:', msg);
        };
    }

    showCrewInterface() {
        document.querySelector('.crew-status').style.display = 'block';
        document.querySelector('.agent-indicators').style.display = 'block';
    }

    hideCrewInterface() {
        document.querySelector('.crew-status').style.display = 'none';
        document.querySelector('.agent-indicators').style.display = 'none';
    }

    showSingleMode() {
        // Reset to single agent mode
        this.currentCrew = null;
        this.activeFlow = null;
        this.updateAgentIndicators('single');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for other systems to initialize
    setTimeout(() => {
        if (window.darcyCrewAI) {
            window.crewAIChatInterface = new CrewAIChatInterface();
            console.log('🎯 CrewAI Chat Interface initialized');
        }
    }, 1000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrewAIChatInterface;
}
