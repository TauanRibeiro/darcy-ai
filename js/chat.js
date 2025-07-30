// Chat functionality for Darcy AI
const Chat = {
    currentConversation: [],
    isProcessing: false,
    
    /**
     * Initialize chat functionality
     */
    init: () => {
        Chat.setupEventListeners();
        Chat.loadWelcomeMessage();
        Chat.loadChatHistory();
    },
    
    /**
     * Setup event listeners
     */
    setupEventListeners: () => {
        const sendBtn = Utils.dom.getId('send-btn');
        const userInput = Utils.dom.getId('user-input');
        const voiceBtn = Utils.dom.getId('voice-btn');
        
        // Send button
        if (sendBtn) {
            sendBtn.addEventListener('click', Chat.handleSendMessage);
        }
        
        // Enter key to send (Shift+Enter for new line)
        if (userInput) {
            userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    Chat.handleSendMessage();
                }
            });
            
            // Auto-resize textarea
            userInput.addEventListener('input', Chat.autoResizeInput);
        }
        
        // Voice button
        if (voiceBtn) {
            voiceBtn.addEventListener('click', Chat.handleVoiceInput);
        }
        
        // Quick actions
        const quickActions = Utils.dom.getAllSelector('.quick-action');
        quickActions.forEach(action => {
            action.addEventListener('click', Chat.handleQuickAction);
        });
    },
    
    /**
     * Load welcome message
     */
    loadWelcomeMessage: () => {
        const welcomeMessage = {
            sender: 'bot',
            content: `Olá! Sou o **Darcy AI**, seu tutor educacional especializado. Estou aqui para ajudar com:

📚 **Educação Musical** - Teoria, harmonia, análise musical
🔍 **Pesquisas Acadêmicas** - Fontes confiáveis e metodologia
📄 **Análise de Documentos** - Resumos e explicações
🎯 **Estudos Personalizados** - Planos de estudo adaptados

Como posso ajudá-lo hoje?`,
            timestamp: Date.now(),
            type: 'welcome'
        };
        
        Chat.addMessage(welcomeMessage);
    },
    
    /**
     * Load chat history from storage
     */
    loadChatHistory: () => {
        const history = Storage.chatHistory.getRecent(10);
        history.forEach(message => {
            Chat.addMessage(message, false); // Don't save to storage again
        });
    },
    
    /**
     * Handle send message
     */
    handleSendMessage: async () => {
        if (Chat.isProcessing) return;
        
        const userInput = Utils.dom.getId('user-input');
        const message = userInput.value.trim();
        
        if (!message) {
            userInput.focus();
            return;
        }
        
        // Clear input
        userInput.value = '';
        Chat.autoResizeInput();
        
        // Add user message
        const userMessage = {
            sender: 'user',
            content: message,
            timestamp: Date.now()
        };
        
        Chat.addMessage(userMessage);
        Chat.showTypingIndicator();
        Chat.isProcessing = true;
        
        try {
            // Process message with AI
            const response = await Chat.processMessage(message);
            
            // Add AI response
            const aiMessage = {
                sender: 'bot',
                content: response,
                timestamp: Date.now()
            };
            
            Chat.addMessage(aiMessage);
            
            // Speak response if enabled
            const settings = Storage.settings.getAll();
            if (settings.VOICE_ENABLED) {
                Speech.speakResponse(response);
            }
            
        } catch (error) {
            const errorMessage = {
                sender: 'bot',
                content: `Desculpe, ocorreu um erro ao processar sua mensagem: ${error.message}`,
                timestamp: Date.now(),
                type: 'error'
            };
            
            Chat.addMessage(errorMessage);
        } finally {
            Chat.hideTypingIndicator();
            Chat.isProcessing = false;
            userInput.focus();
        }
    },
    
    /**
     * Handle voice input
     */
    handleVoiceInput: async () => {
        const voiceBtn = Utils.dom.getId('voice-btn');
        
        if (!Speech.recognition.isSupported()) {
            Utils.notification.showToast('Reconhecimento de voz não suportado neste navegador', 'error');
            return;
        }
        
        try {
            voiceBtn.classList.add('listening');
            voiceBtn.innerHTML = '🔴'; // Recording indicator
            
            const transcript = await Speech.processVoiceInput();
            
            // Fill input with transcript
            const userInput = Utils.dom.getId('user-input');
            userInput.value = transcript;
            Chat.autoResizeInput();
            
            // Automatically send if transcript is not empty
            if (transcript.trim()) {
                await Chat.handleSendMessage();
            }
            
        } catch (error) {
            Utils.notification.showToast(`Erro no reconhecimento de voz: ${error.message}`, 'error');
        } finally {
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = '🎤';
        }
    },
    
    /**
     * Handle quick action buttons
     * @param {Event} event - Click event
     */
    handleQuickAction: (event) => {
        const action = event.target.dataset.action;
        const userInput = Utils.dom.getId('user-input');
        
        const actionConfig = CONFIG.QUICK_ACTIONS.find(a => a.id === action);
        if (!actionConfig) return;
        
        const currentText = userInput.value.trim();
        const prompt = actionConfig.prompt;
        
        if (currentText) {
            userInput.value = prompt + currentText;
        } else {
            userInput.value = prompt;
            userInput.focus();
            // Position cursor after the prompt
            setTimeout(() => {
                userInput.setSelectionRange(prompt.length, prompt.length);
            }, 0);
        }
        
        Chat.autoResizeInput();
    },
    
    /**
     * Process message with AI
     * @param {string} message - User message
     * @returns {Promise<string>} - AI response
     */
    processMessage: async (message) => {
        // Check if message requires web search
        const needsWebSearch = message.toLowerCase().includes('buscar na web') ||
                              message.toLowerCase().includes('pesquisar');
        
        if (needsWebSearch) {
            return await LLMProviders.processWithWebSearch(message, {
                context: 'research'
            });
        }
        
        // Determine context based on message content
        let context = 'general';
        
        if (Chat.isAboutMusic(message)) {
            context = 'music';
        } else if (Chat.isAboutResearch(message)) {
            context = 'research';
        }
        
        return await LLMProviders.sendMessage(message, { context });
    },
    
    /**
     * Check if message is about music
     * @param {string} message - Message to analyze
     * @returns {boolean}
     */
    isAboutMusic: (message) => {
        const musicKeywords = [
            'música', 'musical', 'acorde', 'escala', 'harmonia', 'melodia',
            'ritmo', 'compasso', 'nota', 'tom', 'instrumento', 'piano',
            'violão', 'guitarra', 'bateria', 'teoria musical', 'solfejo'
        ];
        
        const lowerMessage = message.toLowerCase();
        return musicKeywords.some(keyword => lowerMessage.includes(keyword));
    },
    
    /**
     * Check if message is about research
     * @param {string} message - Message to analyze
     * @returns {boolean}
     */
    isAboutResearch: (message) => {
        const researchKeywords = [
            'pesquisa', 'artigo', 'paper', 'tese', 'dissertação', 'referência',
            'bibliografia', 'fonte', 'acadêmico', 'científico', 'estudo',
            'metodologia', 'análise', 'dados'
        ];
        
        const lowerMessage = message.toLowerCase();
        return researchKeywords.some(keyword => lowerMessage.includes(keyword));
    },
    
    /**
     * Add message to chat
     * @param {Object} message - Message object
     * @param {boolean} saveToStorage - Whether to save to storage
     */
    addMessage: (message, saveToStorage = true) => {
        const chatMessages = Utils.dom.getId('chat-messages');
        const messageElement = Chat.createMessageElement(message);
        
        chatMessages.appendChild(messageElement);
        
        // Auto scroll to bottom
        setTimeout(() => {
            Utils.animation.scrollTo(messageElement);
        }, 100);
        
        // Save to storage
        if (saveToStorage) {
            Storage.chatHistory.addMessage(message);
            Chat.currentConversation.push(message);
        }
    },
    
    /**
     * Create message HTML element
     * @param {Object} message - Message object
     * @returns {HTMLElement} - Message element
     */
    createMessageElement: (message) => {
        const isUser = message.sender === 'user';
        const messageDiv = Utils.dom.createElement('div', {
            className: `message ${isUser ? 'user-message' : 'bot-message'} ${message.type || ''}`,
            dataset: { messageId: message.id || Utils.text.generateId() }
        });
        
        const avatar = Utils.dom.createElement('div', {
            className: 'message-avatar'
        }, isUser ? '👤' : '🎓');
        
        const contentDiv = Utils.dom.createElement('div', {
            className: 'message-content'
        });
        
        const headerDiv = Utils.dom.createElement('div', {
            className: 'message-header'
        });
        
        const senderName = Utils.dom.createElement('span', {
            className: 'sender-name'
        }, isUser ? 'Você' : 'Darcy AI');
        
        const messageTime = Utils.dom.createElement('span', {
            className: 'message-time'
        }, Utils.time.formatTime(message.timestamp));
        
        headerDiv.appendChild(senderName);
        headerDiv.appendChild(messageTime);
        
        const textDiv = Utils.dom.createElement('div', {
            className: 'message-text'
        });
        
        // Format message content
        textDiv.innerHTML = Utils.text.formatText(message.content);
        
        contentDiv.appendChild(headerDiv);
        contentDiv.appendChild(textDiv);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;
    },
    
    /**
     * Show typing indicator
     */
    showTypingIndicator: () => {
        const typingIndicator = Utils.dom.getId('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
            Utils.animation.scrollTo(typingIndicator);
        }
    },
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator: () => {
        const typingIndicator = Utils.dom.getId('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    },
    
    /**
     * Auto-resize input textarea
     */
    autoResizeInput: () => {
        const userInput = Utils.dom.getId('user-input');
        if (!userInput) return;
        
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
        
        // Update send button state
        const sendBtn = Utils.dom.getId('send-btn');
        if (sendBtn) {
            sendBtn.disabled = !userInput.value.trim() || Chat.isProcessing;
        }
    },
    
    /**
     * Handle file upload
     * @param {string} fileName - File name
     * @param {string} content - File content
     * @param {string} fileType - File type category
     */
    handleFileUpload: async (fileName, content, fileType) => {
        const fileMessage = {
            sender: 'user',
            content: `📎 **Arquivo enviado:** ${fileName}`,
            timestamp: Date.now(),
            type: 'file'
        };
        
        Chat.addMessage(fileMessage);
        Chat.showTypingIndicator();
        Chat.isProcessing = true;
        
        try {
            // Process file with AI
            const response = await LLMProviders.processFile(content, fileName, 'analyze');
            
            const aiMessage = {
                sender: 'bot',
                content: response,
                timestamp: Date.now(),
                type: 'file-analysis'
            };
            
            Chat.addMessage(aiMessage);
            
        } catch (error) {
            const errorMessage = {
                sender: 'bot',
                content: `Erro ao analisar o arquivo ${fileName}: ${error.message}`,
                timestamp: Date.now(),
                type: 'error'
            };
            
            Chat.addMessage(errorMessage);
        } finally {
            Chat.hideTypingIndicator();
            Chat.isProcessing = false;
        }
    },
    
    /**
     * Clear chat history
     */
    clearChat: () => {
        const chatMessages = Utils.dom.getId('chat-messages');
        chatMessages.innerHTML = '';
        
        Chat.currentConversation = [];
        Storage.chatHistory.clear();
        
        // Reload welcome message
        Chat.loadWelcomeMessage();
        
        Utils.notification.showToast('Conversa limpa', 'success');
    },
    
    /**
     * Export chat history
     */
    exportChat: () => {
        const history = Storage.chatHistory.export();
        const blob = new Blob([history], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `darcy-chat-history-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        Utils.notification.showToast('Histórico exportado', 'success');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Chat;
}
