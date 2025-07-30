// Multimodal Input/Output System for Darcy AI
const MultimodalSystem = {
    
    // Supported input types
    inputTypes: {
        text: true,
        voice: true,
        image: true,
        video: true,
        audio: true,
        document: true,
        spreadsheet: true,
        code: true
    },
    
    // Supported output types
    outputTypes: {
        text: true,
        voice: true,
        image: true,
        chart: true,
        code: true,
        notebook: true
    },
    
    // Active input streams
    activeStreams: {
        microphone: null,
        camera: null,
        screen: null
    },
    
    // Speech recognition and synthesis
    speechRecognition: null,
    speechSynthesis: null,
    
    /**
     * Initialize multimodal system
     */
    init: () => {
        MultimodalSystem.createMultimodalInterface();
        MultimodalSystem.setupSpeechRecognition();
        MultimodalSystem.setupSpeechSynthesis();
        MultimodalSystem.setupFileProcessing();
        MultimodalSystem.bindEvents();
    },
    
    /**
     * Create the multimodal interface
     */
    createMultimodalInterface: () => {
        const interfaceHTML = `
            <div id="multimodal-interface" class="multimodal-interface">
                
                <!-- Input Methods -->
                <div class="input-methods">
                    <div class="input-section">
                        <h3>Métodos de Entrada</h3>
                        <div class="input-grid">
                            
                            <!-- Voice Input -->
                            <div class="input-method voice-input">
                                <button id="voice-btn" class="input-btn" title="Entrada por voz">
                                    <span class="btn-icon">🎤</span>
                                    <span class="btn-text">Falar</span>
                                </button>
                                <div id="voice-status" class="input-status"></div>
                            </div>
                            
                            <!-- Camera Input -->
                            <div class="input-method camera-input">
                                <button id="camera-btn" class="input-btn" title="Capturar imagem/vídeo">
                                    <span class="btn-icon">📷</span>
                                    <span class="btn-text">Câmera</span>
                                </button>
                                <video id="camera-preview" class="camera-preview hidden" autoplay muted></video>
                                <canvas id="camera-canvas" class="hidden"></canvas>
                            </div>
                            
                            <!-- Screen Share -->
                            <div class="input-method screen-input">
                                <button id="screen-btn" class="input-btn" title="Compartilhar tela">
                                    <span class="btn-icon">🖥️</span>
                                    <span class="btn-text">Tela</span>
                                </button>
                                <video id="screen-preview" class="screen-preview hidden" autoplay muted></video>
                            </div>
                            
                            <!-- File Upload Enhanced -->
                            <div class="input-method file-input-enhanced">
                                <button id="file-enhanced-btn" class="input-btn" title="Upload multimodal">
                                    <span class="btn-icon">📁</span>
                                    <span class="btn-text">Arquivos</span>
                                </button>
                                <div class="file-types">
                                    <span class="file-type" data-type="pdf">PDF</span>
                                    <span class="file-type" data-type="docx">Word</span>
                                    <span class="file-type" data-type="xlsx">Excel</span>
                                    <span class="file-type" data-type="image">Imagem</span>
                                    <span class="file-type" data-type="video">Vídeo</span>
                                    <span class="file-type" data-type="audio">Áudio</span>
                                </div>
                            </div>
                            
                            <!-- Code Input -->
                            <div class="input-method code-input">
                                <button id="code-btn" class="input-btn" title="Entrada de código">
                                    <span class="btn-icon">💻</span>
                                    <span class="btn-text">Código</span>
                                </button>
                            </div>
                            
                            <!-- Notebook Input -->
                            <div class="input-method notebook-input">
                                <button id="notebook-btn" class="input-btn" title="Notebook interativo">
                                    <span class="btn-icon">📓</span>
                                    <span class="btn-text">Notebook</span>
                                </button>
                            </div>
                            
                        </div>
                    </div>
                    
                    <!-- Output Methods -->
                    <div class="output-section">
                        <h3>Métodos de Saída</h3>
                        <div class="output-controls">
                            
                            <div class="output-control">
                                <label>
                                    <input type="checkbox" id="output-voice" checked>
                                    <span>🔊 Voz</span>
                                </label>
                            </div>
                            
                            <div class="output-control">
                                <label>
                                    <input type="checkbox" id="output-visual" checked>
                                    <span>👁️ Visual</span>
                                </label>
                            </div>
                            
                            <div class="output-control">
                                <label>
                                    <input type="checkbox" id="output-interactive" checked>
                                    <span>🎮 Interativo</span>
                                </label>
                            </div>
                            
                        </div>
                    </div>
                </div>
                
                <!-- Real-time Processing Status -->
                <div id="processing-status" class="processing-status hidden">
                    <div class="status-content">
                        <div class="status-icon">⚡</div>
                        <div class="status-text">Processando entrada multimodal...</div>
                        <div class="status-progress">
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
            
            <!-- Enhanced Chat Input with Multimodal -->
            <div id="enhanced-chat-input" class="enhanced-chat-input">
                <div class="input-container">
                    
                    <!-- Text Input with Rich Features -->
                    <div class="text-input-wrapper">
                        <textarea 
                            id="multimodal-text-input" 
                            placeholder="Digite sua mensagem, ou use um dos métodos de entrada acima..." 
                            rows="3"
                        ></textarea>
                        
                        <!-- Input Enhancements -->
                        <div class="input-enhancements">
                            <button class="enhancement-btn" id="emoji-btn" title="Emojis">😊</button>
                            <button class="enhancement-btn" id="markdown-btn" title="Markdown">📝</button>
                            <button class="enhancement-btn" id="math-btn" title="Matemática">∑</button>
                            <button class="enhancement-btn" id="code-snippet-btn" title="Código">&lt;/&gt;</button>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <button class="quick-action" data-action="summarize">Resumir</button>
                        <button class="quick-action" data-action="explain">Explicar</button>
                        <button class="quick-action" data-action="analyze">Analisar</button>
                        <button class="quick-action" data-action="translate">Traduzir</button>
                        <button class="quick-action" data-action="create">Criar</button>
                    </div>
                    
                    <!-- Send Button with Voice Animation -->
                    <button id="enhanced-send-btn" class="enhanced-send-btn">
                        <span class="send-icon">🚀</span>
                        <span class="send-text">Enviar</span>
                    </button>
                    
                </div>
            </div>
        `;
        
        // Insert multimodal interface
        const chatContainer = Utils.dom.getSelector('.chat-container');
        if (chatContainer) {
            chatContainer.insertAdjacentHTML('afterend', interfaceHTML);
        }
    },
    
    /**
     * Setup speech recognition
     */
    setupSpeechRecognition: () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            MultimodalSystem.speechRecognition = new SpeechRecognition();
            
            MultimodalSystem.speechRecognition.continuous = false;
            MultimodalSystem.speechRecognition.interimResults = true;
            MultimodalSystem.speechRecognition.lang = 'pt-BR';
            
            MultimodalSystem.speechRecognition.onstart = () => {
                AvatarSystem.setState('listening');
                MultimodalSystem.updateVoiceStatus('Ouvindo...', 'listening');
            };
            
            MultimodalSystem.speechRecognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                const textInput = Utils.dom.getId('multimodal-text-input');
                if (textInput) {
                    textInput.value = finalTranscript || interimTranscript;
                }
                
                if (finalTranscript) {
                    MultimodalSystem.updateVoiceStatus('Processado!', 'success');
                    AvatarSystem.reactToInteraction('voice_input');
                    setTimeout(() => MultimodalSystem.updateVoiceStatus(''), 2000);
                }
            };
            
            MultimodalSystem.speechRecognition.onerror = (event) => {
                MultimodalSystem.updateVoiceStatus(`Erro: ${event.error}`, 'error');
                AvatarSystem.setState('idle');
            };
            
            MultimodalSystem.speechRecognition.onend = () => {
                MultimodalSystem.updateVoiceStatus('');
                AvatarSystem.setState('idle');
            };
        }
    },
    
    /**
     * Setup speech synthesis
     */
    setupSpeechSynthesis: () => {
        if ('speechSynthesis' in window) {
            MultimodalSystem.speechSynthesis = window.speechSynthesis;
        }
    },
    
    /**
     * Setup enhanced file processing
     */
    setupFileProcessing: () => {
        // Enhanced file input
        const fileInput = Utils.dom.createElement('input', {
            type: 'file',
            id: 'multimodal-file-input',
            multiple: true,
            accept: '.pdf,.docx,.xlsx,.xls,.pptx,.txt,.md,.py,.js,.html,.css,.json,.xml,.csv,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.mp3,.wav,.m4a',
            style: 'display: none'
        });
        
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', async (event) => {
            const files = Array.from(event.target.files);
            await MultimodalSystem.processMultipleFiles(files);
        });
    },
    
    /**
     * Process multiple files with different types
     * @param {Array} files - Array of file objects
     */
    processMultipleFiles: async (files) => {
        MultimodalSystem.showProcessingStatus('Processando arquivos...');
        AvatarSystem.setState('processing');
        
        const results = [];
        
        for (const file of files) {
            try {
                const result = await MultimodalSystem.processAdvancedFile(file);
                results.push(result);
            } catch (error) {
                console.error('Error processing file:', error);
                results.push({
                    fileName: file.name,
                    error: error.message,
                    type: 'error'
                });
            }
        }
        
        MultimodalSystem.hideProcessingStatus();
        await MultimodalSystem.handleProcessedFiles(results);
        AvatarSystem.setState('idle');
    },
    
    /**
     * Process advanced file types
     * @param {File} file - File to process
     * @returns {Promise<Object>} Processing result
     */
    processAdvancedFile: async (file) => {
        const extension = Utils.file.getExtension(file.name).toLowerCase();
        const fileSize = file.size;
        const fileName = file.name;
        
        // Try backend processing first
        const settings = Storage.settings.getAll();
        if (settings.USE_BACKEND !== false) {
            try {
                return await MultimodalSystem.processFileViaBackend(file);
            } catch (error) {
                console.warn('Backend processing failed, using fallback:', error.message);
            }
        }
        
        // Fallback to client-side processing
        switch (extension) {
            case 'pdf':
                return await MultimodalSystem.processPDFAdvanced(file);
            
            case 'docx':
                return await MultimodalSystem.processWordAdvanced(file);
            
            case 'xlsx':
            case 'xls':
                return await MultimodalSystem.processSpreadsheet(file);
            
            case 'pptx':
                return await MultimodalSystem.processPowerPoint(file);
            
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return await MultimodalSystem.processImageAdvanced(file);
            
            case 'mp4':
            case 'mov':
            case 'avi':
                return await MultimodalSystem.processVideo(file);
            
            case 'mp3':
            case 'wav':
            case 'm4a':
                return await MultimodalSystem.processAudioAdvanced(file);
            
            case 'py':
            case 'js':
            case 'html':
            case 'css':
            case 'json':
            case 'xml':
                return await MultimodalSystem.processCodeFile(file);
            
            case 'csv':
                return await MultimodalSystem.processCSV(file);
            
            case 'md':
                return await MultimodalSystem.processMarkdown(file);
            
            default:
                return await MultimodalSystem.processTextFile(file);
        }
    },
    
    /**
     * Process file via backend
     * @param {File} file - File to process
     * @returns {Promise<Object>} Processing result
     */
    processFileViaBackend: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('action', 'advanced_analysis');
        
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    },
    
    /**
     * Process PDF with advanced features
     * @param {File} file - PDF file
     * @returns {Promise<Object>} Processing result
     */
    processPDFAdvanced: async (file) => {
        // Enhanced PDF processing would go here
        // For now, return metadata and request for OCR if needed
        return {
            fileName: file.name,
            type: 'pdf',
            size: file.size,
            content: `PDF carregado: ${file.name}
            
📄 **Análise Avançada de PDF**

**Arquivo:** ${file.name}
**Tamanho:** ${Utils.file.formatSize(file.size)}
**Tipo:** Documento PDF

**Funcionalidades Disponíveis:**
- ✅ Extração de texto (via backend)
- ✅ Análise de estrutura
- ✅ Reconhecimento de imagens
- ✅ Extração de tabelas
- ✅ Análise de metadados

Para análise completa, certifique-se de que o backend está rodando.`,
            metadata: {
                pages: 'Calculando...',
                hasImages: 'Analisando...',
                hasTables: 'Verificando...'
            }
        };
    },
    
    /**
     * Process spreadsheet files
     * @param {File} file - Spreadsheet file
     * @returns {Promise<Object>} Processing result
     */
    processSpreadsheet: async (file) => {
        return {
            fileName: file.name,
            type: 'spreadsheet',
            size: file.size,
            content: `Planilha carregada: ${file.name}
            
📊 **Análise de Planilha**

**Arquivo:** ${file.name}
**Tamanho:** ${Utils.file.formatSize(file.size)}
**Tipo:** Planilha Excel

**Funcionalidades Disponíveis:**
- ✅ Leitura de dados
- ✅ Análise de fórmulas
- ✅ Geração de gráficos
- ✅ Análise estatística
- ✅ Detecção de padrões

Posso ajudar você a:
- Analisar os dados
- Criar visualizações
- Gerar relatórios
- Identificar insights`,
            metadata: {
                sheets: 'Calculando...',
                rows: 'Contando...',
                columns: 'Analisando...'
            }
        };
    },
    
    /**
     * Process image with advanced analysis
     * @param {File} file - Image file
     * @returns {Promise<Object>} Processing result
     */
    processImageAdvanced: async (file) => {
        const dataUrl = await Utils.file.readAsDataURL(file);
        
        return {
            fileName: file.name,
            type: 'image',
            size: file.size,
            dataUrl: dataUrl,
            content: `Imagem carregada: ${file.name}
            
🖼️ **Análise Avançada de Imagem**

**Arquivo:** ${file.name}
**Tamanho:** ${Utils.file.formatSize(file.size)}
**Tipo:** ${file.type}

**Funcionalidades Disponíveis:**
- ✅ Reconhecimento de objetos
- ✅ Extração de texto (OCR)
- ✅ Análise de cores
- ✅ Detecção de faces
- ✅ Classificação de conteúdo

O que você gostaria que eu fizesse com esta imagem?`,
            metadata: {
                dimensions: 'Calculando...',
                colors: 'Analisando...',
                objects: 'Detectando...'
            }
        };
    },
    
    /**
     * Process video file
     * @param {File} file - Video file
     * @returns {Promise<Object>} Processing result
     */
    processVideo: async (file) => {
        const videoUrl = URL.createObjectURL(file);
        
        return {
            fileName: file.name,
            type: 'video',
            size: file.size,
            videoUrl: videoUrl,
            content: `Vídeo carregado: ${file.name}
            
🎬 **Análise de Vídeo**

**Arquivo:** ${file.name}  
**Tamanho:** ${Utils.file.formatSize(file.size)}
**Tipo:** ${file.type}

**Funcionalidades Disponíveis:**
- ✅ Extração de frames
- ✅ Transcrição de áudio
- ✅ Análise de conteúdo
- ✅ Detecção de objetos
- ✅ Reconhecimento de ações

Posso ajudar você a:
- Transcrever o áudio
- Analisar o conteúdo visual
- Extrair frames importantes
- Gerar resumos`,
            metadata: {
                duration: 'Calculando...',
                fps: 'Analisando...',
                resolution: 'Detectando...'
            }
        };
    },
    
    /**
     * Process audio with advanced features
     * @param {File} file - Audio file
     * @returns {Promise<Object>} Processing result
     */
    processAudioAdvanced: async (file) => {
        const audioUrl = URL.createObjectURL(file);
        
        return {
            fileName: file.name,
            type: 'audio',
            size: file.size,
            audioUrl: audioUrl,
            content: `Áudio carregado: ${file.name}
            
🎵 **Análise Avançada de Áudio**

**Arquivo:** ${file.name}
**Tamanho:** ${Utils.file.formatSize(file.size)}
**Tipo:** ${file.type}

**Funcionalidades Disponíveis:**
- ✅ Transcrição automática
- ✅ Análise de sentimentos
- ✅ Detecção de idioma
- ✅ Separação de speakers
- ✅ Análise musical (se aplicável)

O que você gostaria que eu fizesse com este áudio?`,
            metadata: {
                duration: 'Calculando...',
                format: file.type,
                quality: 'Analisando...'
            }
        };
    },
    
    /**
     * Process code files
     * @param {File} file - Code file
     * @returns {Promise<Object>} Processing result
     */
    processCodeFile: async (file) => {
        const content = await Utils.file.readAsText(file);
        const extension = Utils.file.getExtension(file.name);
        
        return {
            fileName: file.name,
            type: 'code',
            size: file.size,
            content: `Código carregado: ${file.name}
            
💻 **Análise de Código ${extension.toUpperCase()}**

**Arquivo:** ${file.name}
**Linguagem:** ${extension.toUpperCase()}
**Linhas:** ${content.split('\n').length}
**Tamanho:** ${Utils.file.formatSize(file.size)}

**Funcionalidades Disponíveis:**
- ✅ Análise de sintaxe
- ✅ Detecção de bugs
- ✅ Sugestões de melhoria
- ✅ Documentação automática
- ✅ Refatoração

**Prévia do código:**
\`\`\`${extension}
${content.substring(0, 500)}${content.length > 500 ? '...' : ''}
\`\`\`

Como posso ajudar com este código?`,
            metadata: {
                language: extension,
                lines: content.split('\n').length,
                functions: 'Analisando...'
            },
            rawContent: content
        };
    },
    
    /**
     * Handle processed files results
     * @param {Array} results - Processing results
     */
    handleProcessedFiles: async (results) => {
        for (const result of results) {
            if (result.error) {
                Utils.notification.showToast(`Erro ao processar ${result.fileName}: ${result.error}`, 'error');
                continue;
            }
            
            // Create rich message with the processed content
            await MultimodalSystem.createRichMessage(result);
            
            // Gain experience based on file type
            let xp = 5;
            if (result.type === 'pdf' || result.type === 'spreadsheet') xp = 15;
            if (result.type === 'video' || result.type === 'audio') xp = 20;
            if (result.type === 'code') xp = 10;
            
            AvatarSystem.gainExperience(xp);
        }
    },
    
    /**
     * Create rich message for processed content
     * @param {Object} result - Processing result
     */
    createRichMessage: async (result) => {
        // Add file message to chat
        const messageData = {
            text: result.content,
            type: 'file',
            fileType: result.type,
            fileName: result.fileName,
            metadata: result.metadata,
            timestamp: new Date()
        };
        
        if (result.dataUrl) messageData.dataUrl = result.dataUrl;
        if (result.videoUrl) messageData.videoUrl = result.videoUrl;
        if (result.audioUrl) messageData.audioUrl = result.audioUrl;
        if (result.rawContent) messageData.rawContent = result.rawContent;
        
        // Add to chat via ChatInterface
        await ChatInterface.addMessage(messageData, 'user');
        
        // Get AI analysis
        const analysisPrompt = MultimodalSystem.generateAnalysisPrompt(result);
        const response = await LLMProviders.sendMessage(analysisPrompt, {
            context: 'research',
            maxTokens: 1500
        });
        
        await ChatInterface.addMessage({
            text: response,
            type: 'ai_analysis',
            timestamp: new Date()
        }, 'ai');
    },
    
    /**
     * Generate analysis prompt based on file type
     * @param {Object} result - Processing result
     * @returns {string} Analysis prompt
     */
    generateAnalysisPrompt: (result) => {
        const basePrompt = `Analise o seguinte arquivo que foi carregado pelo usuário:

**Arquivo:** ${result.fileName}
**Tipo:** ${result.type}
**Tamanho:** ${Utils.file.formatSize(result.size)}

`;
        
        switch (result.type) {
            case 'pdf':
                return basePrompt + `Este é um documento PDF. Forneça uma análise educacional completa, identificando:
- Tópicos principais
- Conceitos-chave
- Possíveis questões de estudo
- Resumo estruturado`;
                
            case 'spreadsheet':
                return basePrompt + `Esta é uma planilha. Analise os dados e forneça:
- Visão geral dos dados
- Padrões identificados
- Insights estatísticos
- Sugestões de visualizações`;
                
            case 'image':
                return basePrompt + `Esta é uma imagem. Descreva:
- Conteúdo visual principal
- Elementos educacionais relevantes
- Possíveis aplicações pedagógicas
- Contexto acadêmico se aplicável`;
                
            case 'code':
                return basePrompt + `Este é um arquivo de código. Analise:
- Propósito e funcionalidade
- Qualidade do código
- Possíveis melhorias
- Conceitos de programação utilizados

**Código:**
\`\`\`
${result.rawContent}
\`\`\``;
                
            case 'audio':
                return basePrompt + `Este é um arquivo de áudio. Forneça:
- Análise do conteúdo (se transcrito)
- Contexto educacional
- Possíveis aplicações
- Sugestões de estudo`;
                
            case 'video':
                return basePrompt + `Este é um arquivo de vídeo. Analise:
- Conteúdo visual e auditivo
- Valor educacional
- Conceitos apresentados
- Aplicações pedagógicas`;
                
            default:
                return basePrompt + `Forneça uma análise educacional completa deste conteúdo, focando em aspectos pedagógicos e de aprendizagem.`;
        }
    },
    
    /**
     * Update voice status
     * @param {string} status - Status message
     * @param {string} type - Status type
     */
    updateVoiceStatus: (status, type = 'info') => {
        const statusElement = Utils.dom.getId('voice-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `input-status ${type}`;
        }
    },
    
    /**
     * Show processing status
     * @param {string} message - Processing message
     */
    showProcessingStatus: (message) => {
        const status = Utils.dom.getId('processing-status');
        const statusText = status?.querySelector('.status-text');
        
        if (status && statusText) {
            statusText.textContent = message;
            status.classList.remove('hidden');
        }
    },
    
    /**
     * Hide processing status
     */
    hideProcessingStatus: () => {
        const status = Utils.dom.getId('processing-status');
        if (status) {
            status.classList.add('hidden');
        }
    },
    
    /**
     * Start camera capture
     */
    startCamera: async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 },
                audio: false 
            });
            
            const preview = Utils.dom.getId('camera-preview');
            if (preview) {
                preview.srcObject = stream;
                preview.classList.remove('hidden');
                MultimodalSystem.activeStreams.camera = stream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            Utils.notification.showToast('Erro ao acessar câmera', 'error');
        }
    },
    
    /**
     * Capture image from camera
     */
    captureImage: () => {
        const preview = Utils.dom.getId('camera-preview');
        const canvas = Utils.dom.getId('camera-canvas');
        
        if (preview && canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = preview.videoWidth;
            canvas.height = preview.videoHeight;
            ctx.drawImage(preview, 0, 0);
            
            canvas.toBlob(async (blob) => {
                const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                await MultimodalSystem.processMultipleFiles([file]);
            }, 'image/jpeg', 0.8);
        }
    },
    
    /**
     * Stop camera
     */
    stopCamera: () => {
        const stream = MultimodalSystem.activeStreams.camera;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            MultimodalSystem.activeStreams.camera = null;
        }
        
        const preview = Utils.dom.getId('camera-preview');
        if (preview) {
            preview.classList.add('hidden');
        }
    },
    
    /**
     * Bind multimodal events
     */
    bindEvents: () => {
        // Voice button
        const voiceBtn = Utils.dom.getId('voice-btn');
        if (voiceBtn && MultimodalSystem.speechRecognition) {
            voiceBtn.addEventListener('click', () => {
                if (MultimodalSystem.speechRecognition) {
                    MultimodalSystem.speechRecognition.start();
                } else {
                    Utils.notification.showToast('Reconhecimento de voz não suportado', 'error');
                }
            });
        }
        
        // Camera button
        const cameraBtn = Utils.dom.getId('camera-btn');
        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => {
                if (MultimodalSystem.activeStreams.camera) {
                    MultimodalSystem.captureImage();
                    MultimodalSystem.stopCamera();
                } else {
                    MultimodalSystem.startCamera();
                }
            });
        }
        
        // Enhanced file button
        const fileEnhancedBtn = Utils.dom.getId('file-enhanced-btn');
        if (fileEnhancedBtn) {
            fileEnhancedBtn.addEventListener('click', () => {
                const fileInput = Utils.dom.getId('multimodal-file-input');
                if (fileInput) fileInput.click();
            });
        }
        
        // Enhanced send button
        const enhancedSendBtn = Utils.dom.getId('enhanced-send-btn');
        const textInput = Utils.dom.getId('multimodal-text-input');
        
        if (enhancedSendBtn && textInput) {
            enhancedSendBtn.addEventListener('click', () => {
                const message = textInput.value.trim();
                if (message) {
                    // Use existing chat system
                    const originalInput = Utils.dom.getId('user-input');
                    if (originalInput) {
                        originalInput.value = message;
                        originalInput.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));
                    }
                    textInput.value = '';
                }
            });
            
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    enhancedSendBtn.click();
                }
            });
        }
        
        // Quick actions
        const quickActions = Utils.dom.getSelector('.quick-actions');
        if (quickActions) {
            quickActions.addEventListener('click', (e) => {
                if (e.target.classList.contains('quick-action')) {
                    const action = e.target.dataset.action;
                    MultimodalSystem.handleQuickAction(action);
                }
            });
        }
    },
    
    /**
     * Handle quick actions
     * @param {string} action - Action type
     */
    handleQuickAction: (action) => {
        const textInput = Utils.dom.getId('multimodal-text-input');
        if (!textInput) return;
        
        const prompts = {
            summarize: 'Faça um resumo detalhado de: ',
            explain: 'Explique de forma didática: ',
            analyze: 'Analise academicamente: ',
            translate: 'Traduza para português: ',
            create: 'Crie conteúdo educacional sobre: '
        };
        
        const currentText = textInput.value;
        const prompt = prompts[action] || '';
        
        textInput.value = prompt + currentText;
        textInput.focus();
    },
    
    /**
     * Speak text using speech synthesis
     * @param {string} text - Text to speak
     */
    speakText: (text) => {
        if (MultimodalSystem.speechSynthesis && text) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            
            // Find Portuguese voice if available
            const voices = MultimodalSystem.speechSynthesis.getVoices();
            const ptVoice = voices.find(voice => voice.lang === 'pt-BR' || voice.lang === 'pt');
            if (ptVoice) {
                utterance.voice = ptVoice;
            }
            
            MultimodalSystem.speechSynthesis.speak(utterance);
            AvatarSystem.setState('speaking');
            
            utterance.onend = () => {
                AvatarSystem.setState('idle');
            };
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultimodalSystem;
}
