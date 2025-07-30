// Avatar System for Darcy AI - Gamified Tutor
const AvatarSystem = {
    
    // Avatar states and animations
    states: {
        idle: 'idle',
        listening: 'listening',
        thinking: 'thinking',
        speaking: 'speaking',
        processing: 'processing',
        celebrating: 'celebrating',
        encouraging: 'encouraging'
    },
    
    // Current avatar state
    currentState: 'idle',
    
    // Avatar personality traits
    personality: {
        level: 1,
        experience: 0,
        mood: 'happy',
        specialty: 'general',
        achievements: [],
        interactionCount: 0
    },
    
    /**
     * Initialize avatar system
     */
    init: () => {
        AvatarSystem.createAvatarContainer();
        AvatarSystem.loadPersonality();
        AvatarSystem.setupAnimations();
        AvatarSystem.bindEvents();
        AvatarSystem.setState('idle');
    },
    
    /**
     * Create avatar container in the DOM
     */
    createAvatarContainer: () => {
        const avatarHTML = `
            <div id="darcy-avatar-container" class="avatar-container">
                <div class="avatar-wrapper">
                    <div id="darcy-avatar" class="avatar">
                        <div class="avatar-face">
                            <div class="avatar-eyes">
                                <div class="eye left-eye">
                                    <div class="pupil"></div>
                                </div>
                                <div class="eye right-eye">
                                    <div class="pupil"></div>
                                </div>
                            </div>
                            <div class="avatar-mouth">
                                <div class="mouth-shape"></div>
                            </div>
                        </div>
                        <div class="avatar-body">
                            <div class="avatar-chest"></div>
                            <div class="avatar-arms">
                                <div class="arm left-arm"></div>
                                <div class="arm right-arm"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Avatar Status Panel -->
                    <div class="avatar-status">
                        <div class="level-indicator">
                            <span class="level-text">Nível <span id="avatar-level">1</span></span>
                            <div class="xp-bar">
                                <div class="xp-fill" id="xp-fill"></div>
                            </div>
                        </div>
                        <div class="mood-indicator">
                            <span class="mood-emoji" id="mood-emoji">😊</span>
                            <span class="mood-text" id="mood-text">Animado para ensinar!</span>
                        </div>
                    </div>
                    
                    <!-- Speech Bubble -->
                    <div id="avatar-speech" class="speech-bubble hidden">
                        <div class="speech-content"></div>
                        <div class="speech-tail"></div>
                    </div>
                    
                    <!-- Audio Visualizer -->
                    <div id="audio-visualizer" class="audio-visualizer hidden">
                        <div class="wave-bars">
                            ${Array.from({length: 20}, (_, i) => `<div class="wave-bar" style="--delay: ${i * 0.1}s"></div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert avatar before chat container
        const chatContainer = Utils.dom.getSelector('.chat-container');
        if (chatContainer) {
            chatContainer.insertAdjacentHTML('beforebegin', avatarHTML);
        }
    },
    
    /**
     * Set avatar state with animation
     * @param {string} state - New state
     * @param {Object} options - Animation options
     */
    setState: (state, options = {}) => {
        if (!AvatarSystem.states[state] || AvatarSystem.currentState === state) return;
        
        const avatar = Utils.dom.getId('darcy-avatar');
        if (!avatar) return;
        
        // Remove previous state classes
        Object.values(AvatarSystem.states).forEach(s => {
            avatar.classList.remove(`state-${s}`);
        });
        
        // Add new state class
        avatar.classList.add(`state-${state}`);
        AvatarSystem.currentState = state;
        
        // State-specific actions
        switch (state) {
            case 'listening':
                AvatarSystem.showAudioVisualizer();
                AvatarSystem.speak("Estou ouvindo...", { duration: 1000 });
                break;
                
            case 'thinking':
                AvatarSystem.hideAudioVisualizer();
                AvatarSystem.speak("Deixe-me pensar...", { duration: 2000 });
                break;
                
            case 'speaking':
                AvatarSystem.hideAudioVisualizer();
                break;
                
            case 'processing':
                AvatarSystem.speak("Processando arquivo...", { duration: 3000 });
                break;
                
            case 'celebrating':
                AvatarSystem.gainExperience(10);
                AvatarSystem.speak("Excelente pergunta!", { duration: 2000 });
                setTimeout(() => AvatarSystem.setState('idle'), 3000);
                break;
                
            case 'encouraging':
                AvatarSystem.speak("Continue assim! Você está indo muito bem!", { duration: 3000 });
                setTimeout(() => AvatarSystem.setState('idle'), 4000);
                break;
                
            case 'idle':
            default:
                AvatarSystem.hideAudioVisualizer();
                AvatarSystem.hideSpeech();
                break;
        }
        
        // Update personality
        AvatarSystem.personality.interactionCount++;
        AvatarSystem.savePersonality();
    },
    
    /**
     * Make avatar speak with speech bubble
     * @param {string} text - Text to display
     * @param {Object} options - Speech options
     */
    speak: (text, options = {}) => {
        const speechBubble = Utils.dom.getId('avatar-speech');
        const speechContent = speechBubble?.querySelector('.speech-content');
        
        if (!speechBubble || !speechContent) return;
        
        speechContent.textContent = text;
        speechBubble.classList.remove('hidden');
        
        // Auto-hide after duration
        if (options.duration) {
            setTimeout(() => {
                AvatarSystem.hideSpeech();
            }, options.duration);
        }
    },
    
    /**
     * Hide speech bubble
     */
    hideSpeech: () => {
        const speechBubble = Utils.dom.getId('avatar-speech');
        if (speechBubble) {
            speechBubble.classList.add('hidden');
        }
    },
    
    /**
     * Show audio visualizer
     */
    showAudioVisualizer: () => {
        const visualizer = Utils.dom.getId('audio-visualizer');
        if (visualizer) {
            visualizer.classList.remove('hidden');
        }
    },
    
    /**
     * Hide audio visualizer
     */
    hideAudioVisualizer: () => {
        const visualizer = Utils.dom.getId('audio-visualizer');
        if (visualizer) {
            visualizer.classList.add('hidden');
        }
    },
    
    /**
     * Gain experience points and level up
     * @param {number} xp - Experience points to gain
     */
    gainExperience: (xp) => {
        AvatarSystem.personality.experience += xp;
        
        // Check for level up
        const requiredXP = AvatarSystem.personality.level * 100;
        if (AvatarSystem.personality.experience >= requiredXP) {
            AvatarSystem.levelUp();
        }
        
        AvatarSystem.updateUI();
        AvatarSystem.savePersonality();
    },
    
    /**
     * Level up the avatar
     */
    levelUp: () => {
        AvatarSystem.personality.level++;
        AvatarSystem.personality.experience = 0;
        
        // Unlock new features based on level
        AvatarSystem.unlockFeatures();
        
        // Celebration animation
        AvatarSystem.setState('celebrating');
        AvatarSystem.speak(`Parabéns! Alcancei o nível ${AvatarSystem.personality.level}!`, { duration: 4000 });
        
        // Add achievement
        AvatarSystem.personality.achievements.push({
            type: 'level_up',
            level: AvatarSystem.personality.level,
            date: new Date().toISOString()
        });
        
        Utils.notification.showToast(`Darcy subiu para o nível ${AvatarSystem.personality.level}! 🎉`, 'success');
    },
    
    /**
     * Unlock features based on level
     */
    unlockFeatures: () => {
        const level = AvatarSystem.personality.level;
        
        switch (level) {
            case 2:
                AvatarSystem.personality.specialty = 'research';
                AvatarSystem.speak("Agora sou especialista em pesquisa!", { duration: 3000 });
                break;
            case 3:
                AvatarSystem.personality.specialty = 'multimedia';
                AvatarSystem.speak("Posso processar arquivos multimídia!", { duration: 3000 });
                break;
            case 5:
                AvatarSystem.personality.specialty = 'advanced';
                AvatarSystem.speak("Modo avançado desbloqueado!", { duration: 3000 });
                break;
        }
    },
    
    /**
     * Update avatar UI elements
     */
    updateUI: () => {
        const levelText = Utils.dom.getId('avatar-level');
        const xpFill = Utils.dom.getId('xp-fill');
        const moodEmoji = Utils.dom.getId('mood-emoji');
        const moodText = Utils.dom.getId('mood-text');
        
        if (levelText) levelText.textContent = AvatarSystem.personality.level;
        
        if (xpFill) {
            const requiredXP = AvatarSystem.personality.level * 100;
            const percentage = (AvatarSystem.personality.experience / requiredXP) * 100;
            xpFill.style.width = `${percentage}%`;
        }
        
        // Update mood based on interaction count
        const moods = AvatarSystem.getMoodData();
        if (moodEmoji) moodEmoji.textContent = moods.emoji;
        if (moodText) moodText.textContent = moods.text;
    },
    
    /**
     * Get mood data based on current state
     * @returns {Object} Mood data
     */
    getMoodData: () => {
        const count = AvatarSystem.personality.interactionCount;
        
        if (count < 5) return { emoji: '😊', text: 'Animado para ensinar!' };
        if (count < 15) return { emoji: '🤓', text: 'Focado no aprendizado!' };
        if (count < 30) return { emoji: '💪', text: 'Motivado a ajudar!' };
        if (count < 50) return { emoji: '🎓', text: 'Professor experiente!' };
        return { emoji: '🏆', text: 'Mestre educador!' };
    },
    
    /**
     * Setup avatar animations
     */
    setupAnimations: () => {
        // Blinking animation
        setInterval(() => {
            if (AvatarSystem.currentState === 'idle') {
                const eyes = Utils.dom.getSelector('.avatar-eyes');
                if (eyes) {
                    eyes.classList.add('blink');
                    setTimeout(() => eyes.classList.remove('blink'), 150);
                }
            }
        }, 3000 + Math.random() * 2000);
        
        // Breathing animation
        const avatar = Utils.dom.getId('darcy-avatar');
        if (avatar) {
            avatar.classList.add('breathing');
        }
    },
    
    /**
     * Bind avatar events
     */
    bindEvents: () => {
        const avatar = Utils.dom.getId('darcy-avatar');
        if (!avatar) return;
        
        // Click to interact
        avatar.addEventListener('click', () => {
            if (AvatarSystem.currentState === 'idle') {
                const encouragements = [
                    "Como posso ajudar você hoje?",
                    "Vamos aprender algo novo juntos!",
                    "Que pergunta interessante você tem?",
                    "Estou aqui para ensinar!",
                    "Pronto para mais conhecimento?"
                ];
                
                const message = encouragements[Math.floor(Math.random() * encouragements.length)];
                AvatarSystem.speak(message, { duration: 3000 });
                AvatarSystem.gainExperience(2);
            }
        });
        
        // Hover effects
        avatar.addEventListener('mouseenter', () => {
            if (AvatarSystem.currentState === 'idle') {
                avatar.classList.add('hover');
            }
        });
        
        avatar.addEventListener('mouseleave', () => {
            avatar.classList.remove('hover');
        });
    },
    
    /**
     * React to user interactions
     * @param {string} interactionType - Type of interaction
     */
    reactToInteraction: (interactionType) => {
        switch (interactionType) {
            case 'message_sent':
                AvatarSystem.setState('thinking');
                AvatarSystem.gainExperience(5);
                break;
                
            case 'file_uploaded':
                AvatarSystem.setState('processing');
                AvatarSystem.gainExperience(10);
                break;
                
            case 'voice_input':
                AvatarSystem.setState('listening');
                AvatarSystem.gainExperience(8);
                break;
                
            case 'good_question':
                AvatarSystem.setState('celebrating');
                AvatarSystem.gainExperience(15);
                break;
                
            case 'help_needed':
                AvatarSystem.setState('encouraging');
                break;
        }
    },
    
    /**
     * Save personality data to localStorage
     */
    savePersonality: () => {
        localStorage.setItem('darcy_avatar_personality', JSON.stringify(AvatarSystem.personality));
    },
    
    /**
     * Load personality data from localStorage
     */
    loadPersonality: () => {
        const saved = localStorage.getItem('darcy_avatar_personality');
        if (saved) {
            try {
                AvatarSystem.personality = { ...AvatarSystem.personality, ...JSON.parse(saved) };
            } catch (error) {
                console.warn('Error loading avatar personality:', error);
            }
        }
        AvatarSystem.updateUI();
    },
    
    /**
     * Reset avatar personality (for testing)
     */
    resetPersonality: () => {
        AvatarSystem.personality = {
            level: 1,
            experience: 0,
            mood: 'happy',
            specialty: 'general',
            achievements: [],
            interactionCount: 0
        };
        AvatarSystem.savePersonality();
        AvatarSystem.updateUI();
        AvatarSystem.speak("Personalidade resetada!", { duration: 2000 });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AvatarSystem;
}
