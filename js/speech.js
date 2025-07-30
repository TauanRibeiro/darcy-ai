// Speech utilities for Darcy AI
const Speech = {
    
    // Speech Recognition
    recognition: {
        instance: null,
        isListening: false,
        
        /**
         * Check if Speech Recognition is supported
         * @returns {boolean}
         */
        isSupported: () => {
            return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        },
        
        /**
         * Initialize speech recognition
         * @returns {Object|null}
         */
        init: () => {
            if (!Speech.recognition.isSupported()) {
                return null;
            }
            
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.lang = 'pt-BR';
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            
            Speech.recognition.instance = recognition;
            return recognition;
        },
        
        /**
         * Start listening
         * @param {Function} onResult - Callback for results
         * @param {Function} onError - Callback for errors
         * @returns {Promise<string>}
         */
        start: (onResult, onError) => {
            return new Promise((resolve, reject) => {
                if (!Speech.recognition.instance) {
                    Speech.recognition.init();
                }
                
                if (!Speech.recognition.instance) {
                    const error = 'Reconhecimento de voz não suportado neste navegador';
                    if (onError) onError(error);
                    reject(new Error(error));
                    return;
                }
                
                if (Speech.recognition.isListening) {
                    Speech.recognition.stop();
                }
                
                const recognition = Speech.recognition.instance;
                
                recognition.onstart = () => {
                    Speech.recognition.isListening = true;
                    console.log('Reconhecimento de voz iniciado');
                };
                
                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    const confidence = event.results[0][0].confidence;
                    
                    console.log(`Reconhecido: "${transcript}" (confiança: ${confidence})`);
                    
                    if (onResult) onResult(transcript, confidence);
                    resolve(transcript);
                };
                
                recognition.onerror = (event) => {
                    const error = `Erro no reconhecimento de voz: ${event.error}`;
                    console.error(error);
                    
                    if (onError) onError(error);
                    reject(new Error(error));
                };
                
                recognition.onend = () => {
                    Speech.recognition.isListening = false;
                    console.log('Reconhecimento de voz finalizado');
                };
                
                try {
                    recognition.start();
                } catch (error) {
                    const errorMsg = 'Erro ao iniciar reconhecimento de voz';
                    console.error(errorMsg, error);
                    
                    if (onError) onError(errorMsg);
                    reject(new Error(errorMsg));
                }
            });
        },
        
        /**
         * Stop listening
         */
        stop: () => {
            if (Speech.recognition.instance && Speech.recognition.isListening) {
                Speech.recognition.instance.stop();
            }
        }
    },
    
    // Speech Synthesis
    synthesis: {
        /**
         * Check if Speech Synthesis is supported
         * @returns {boolean}
         */
        isSupported: () => {
            return 'speechSynthesis' in window;
        },
        
        /**
         * Get available voices
         * @returns {Array}
         */
        getVoices: () => {
            if (!Speech.synthesis.isSupported()) {
                return [];
            }
            
            return speechSynthesis.getVoices().filter(voice => 
                voice.lang.startsWith('pt') || voice.lang.startsWith('en')
            );
        },
        
        /**
         * Get best Portuguese voice
         * @returns {SpeechSynthesisVoice|null}
         */
        getBestPortugueseVoice: () => {
            const voices = Speech.synthesis.getVoices();
            
            // Prefer Brazilian Portuguese
            let voice = voices.find(v => v.lang === 'pt-BR');
            
            // Fallback to any Portuguese
            if (!voice) {
                voice = voices.find(v => v.lang.startsWith('pt'));
            }
            
            // Fallback to English
            if (!voice) {
                voice = voices.find(v => v.lang.startsWith('en'));
            }
            
            return voice || null;
        },
        
        /**
         * Speak text
         * @param {string} text - Text to speak
         * @param {Object} options - Speech options
         * @returns {Promise<void>}
         */
        speak: (text, options = {}) => {
            return new Promise((resolve, reject) => {
                if (!Speech.synthesis.isSupported()) {
                    reject(new Error('Síntese de voz não suportada neste navegador'));
                    return;
                }
                
                // Cancel any ongoing speech
                speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Set voice
                const voice = options.voice || Speech.synthesis.getBestPortugueseVoice();
                if (voice) {
                    utterance.voice = voice;
                }
                
                // Set parameters
                utterance.rate = options.rate || 1;
                utterance.pitch = options.pitch || 1;
                utterance.volume = options.volume || 1;
                
                // Event handlers
                utterance.onend = () => {
                    console.log('Síntese de voz finalizada');
                    resolve();
                };
                
                utterance.onerror = (event) => {
                    const error = `Erro na síntese de voz: ${event.error}`;
                    console.error(error);
                    reject(new Error(error));
                };
                
                utterance.onstart = () => {
                    console.log('Síntese de voz iniciada');
                };
                
                try {
                    speechSynthesis.speak(utterance);
                } catch (error) {
                    console.error('Erro ao iniciar síntese de voz:', error);
                    reject(error);
                }
            });
        },
        
        /**
         * Stop speaking
         */
        stop: () => {
            if (Speech.synthesis.isSupported()) {
                speechSynthesis.cancel();
            }
        },
        
        /**
         * Pause speaking
         */
        pause: () => {
            if (Speech.synthesis.isSupported()) {
                speechSynthesis.pause();
            }
        },
        
        /**
         * Resume speaking
         */
        resume: () => {
            if (Speech.synthesis.isSupported()) {
                speechSynthesis.resume();
            }
        }
    },
    
    /**
     * Process voice input and send to chat
     * @param {Function} onTranscript - Callback when transcript is ready
     * @param {Function} onError - Callback for errors
     */
    processVoiceInput: async (onTranscript, onError) => {
        try {
            const transcript = await Speech.recognition.start(
                (text, confidence) => {
                    console.log(`Voz processada: "${text}" (${Math.round(confidence * 100)}% confiança)`);
                },
                (error) => {
                    console.error('Erro no reconhecimento:', error);
                }
            );
            
            if (onTranscript) {
                onTranscript(transcript);
            }
            
            return transcript;
        } catch (error) {
            if (onError) {
                onError(error.message);
            }
            throw error;
        }
    },
    
    /**
     * Speak AI response
     * @param {string} text - Response text
     * @param {Object} options - Speech options
     */
    speakResponse: async (text, options = {}) => {
        const settings = Storage.settings.getAll();
        
        if (!settings.VOICE_ENABLED) {
            return;
        }
        
        try {
            // Clean text for better speech
            const cleanText = text
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
                .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
                .replace(/`(.*?)`/g, '$1')       // Remove code markdown
                .replace(/#{1,6}\s/g, '')        // Remove headers
                .replace(/\[.*?\]\(.*?\)/g, '')  // Remove links
                .trim();
            
            await Speech.synthesis.speak(cleanText, {
                rate: 0.9,
                pitch: 1.0,
                volume: 0.8,
                ...options
            });
        } catch (error) {
            console.error('Erro ao falar resposta:', error);
            Utils.notification.showToast('Erro na síntese de voz', 'error');
        }
    }
};

// Initialize voices when available
if (Speech.synthesis.isSupported()) {
    // Voices are loaded asynchronously
    speechSynthesis.onvoiceschanged = () => {
        console.log('Vozes carregadas:', Speech.synthesis.getVoices().length);
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Speech;
}
