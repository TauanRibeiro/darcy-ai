// File handling utilities for Darcy AI
const FileHandler = {
    
    /**
     * Initialize file upload handling
     */
    init: () => {
        const fileInput = Utils.dom.getId('file-input');
        const fileBtn = Utils.dom.getId('file-btn');
        
        if (fileBtn && fileInput) {
            fileBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', FileHandler.handleFileSelect);
        }
        
        // Setup drag and drop
        FileHandler.setupDragAndDrop();
    },
    
    /**
     * Handle file selection
     * @param {Event} event - File input change event
     */
    handleFileSelect: async (event) => {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;
        
        for (const file of files) {
            await FileHandler.processFile(file);
        }
        
        // Clear input for next selection
        event.target.value = '';
    },
    
    /**
     * Process uploaded file
     * @param {File} file - File object
     */
    processFile: async (file) => {
        try {
            // Validate file
            const validation = FileHandler.validateFile(file);
            if (!validation.valid) {
                Utils.notification.showToast(validation.message, 'error');
                return;
            }
            
            // Show upload progress
            const uploadIndicator = FileHandler.showUploadProgress(file.name);
            
            // Process based on file type
            const fileType = FileHandler.getFileType(file);
            let content = '';
            
            switch (fileType) {
                case 'text':
                    content = await FileHandler.processTextFile(file);
                    break;
                case 'image':
                    content = await FileHandler.processImageFile(file);
                    break;
                case 'audio':
                    content = await FileHandler.processAudioFile(file);
                    break;
                case 'document':
                    content = await FileHandler.processDocumentFile(file);
                    break;
                default:
                    throw new Error('Tipo de arquivo não suportado');
            }
            
            // Remove upload indicator
            uploadIndicator.remove();
            
            // Send file content to chat
            await Chat.handleFileUpload(file.name, content, fileType);
            
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            Utils.notification.showToast(`Erro ao processar ${file.name}: ${error.message}`, 'error');
        }
    },
    
    /**
     * Validate file before processing
     * @param {File} file - File object
     * @returns {Object} - Validation result
     */
    validateFile: (file) => {
        // Check file size
        if (file.size > CONFIG.FILE_UPLOAD.MAX_SIZE) {
            return {
                valid: false,
                message: `Arquivo muito grande. Máximo permitido: ${Utils.file.formatSize(CONFIG.FILE_UPLOAD.MAX_SIZE)}`
            };
        }
        
        // Check file type
        const extension = Utils.file.getExtension(file.name);
        const allAllowedTypes = Object.values(CONFIG.FILE_UPLOAD.ALLOWED_TYPES).flat();
        
        if (!allAllowedTypes.includes(extension)) {
            return {
                valid: false,
                message: `Tipo de arquivo não suportado: .${extension}`
            };
        }
        
        return { valid: true };
    },
    
    /**
     * Get file type category
     * @param {File} file - File object
     * @returns {string} - File type category
     */
    getFileType: (file) => {
        const extension = Utils.file.getExtension(file.name);
        
        for (const [category, extensions] of Object.entries(CONFIG.FILE_UPLOAD.ALLOWED_TYPES)) {
            if (extensions.includes(extension)) {
                return category === 'documents' ? 'document' : category.slice(0, -1); // Remove 's' from plural
            }
        }
        
        return 'unknown';
    },
    
    /**
     * Process text file
     * @param {File} file - File object
     * @returns {Promise<string>} - File content
     */
    processTextFile: async (file) => {
        const content = await Utils.file.readAsText(file);
        
        // Truncate if too long
        const maxLength = 10000; // 10KB of text
        if (content.length > maxLength) {
            return content.substring(0, maxLength) + '\n\n[Arquivo truncado...]';
        }
        
        return content;
    },
    
    /**
     * Process image file
     * @param {File} file - File object
     * @returns {Promise<string>} - File description
     */
    processImageFile: async (file) => {
        const dataUrl = await Utils.file.readAsDataURL(file);
        
        // For now, just return metadata
        // In a full implementation, you could use image recognition APIs
        return `Imagem carregada: ${file.name} (${Utils.file.formatSize(file.size)})
        
Tipo: ${file.type}
Dimensões: [Análise de imagem não implementada]

Por favor, descreva o que você gostaria que eu faça com esta imagem.`;
    },
    
    /**
     * Process audio file
     * @param {File} file - File object
     * @returns {Promise<string>} - File description
     */
    processAudioFile: async (file) => {
        // For now, just return metadata
        // In a full implementation, you could use speech-to-text APIs
        return `Áudio carregado: ${file.name} (${Utils.file.formatSize(file.size)})
        
Tipo: ${file.type}
Duração: [Análise de áudio não implementada]

Por favor, descreva o conteúdo do áudio ou o que você gostaria que eu fizesse com ele.`;
    },
    
    /**
     * Process document file (PDF, DOC, etc.)
     * @param {File} file - File object
     * @returns {Promise<string>} - File content
     */
    processDocumentFile: async (file) => {
        const extension = Utils.file.getExtension(file.name);
        
        switch (extension) {
            case 'pdf':
                return FileHandler.processPDF(file);
            case 'doc':
            case 'docx':
                return FileHandler.processWordDocument(file);
            default:
                // Try to read as text
                try {
                    return await Utils.file.readAsText(file);
                } catch {
                    return `Documento carregado: ${file.name} (${Utils.file.formatSize(file.size)})
                    
Tipo: ${file.type}
Status: Não foi possível extrair o texto automaticamente.

Por favor, descreva o conteúdo do documento ou cole o texto manualmente.`;
                }
        }
    },
    
    /**
     * Process PDF file
     * @param {File} file - PDF file
     * @returns {Promise<string>} - Extracted text
     */
    processPDF: async (file) => {
        // For now, return metadata
        // In a full implementation, you would use PDF.js or similar
        return `Documento PDF carregado: ${file.name} (${Utils.file.formatSize(file.size)})
        
Status: Extração de texto de PDF não implementada ainda.

Por favor, copie e cole o texto do PDF ou descreva seu conteúdo.`;
    },
    
    /**
     * Process Word document
     * @param {File} file - Word document
     * @returns {Promise<string>} - Extracted text
     */
    processWordDocument: async (file) => {
        // For now, return metadata
        // In a full implementation, you would use mammoth.js or similar
        return `Documento Word carregado: ${file.name} (${Utils.file.formatSize(file.size)})
        
Status: Extração de texto de documentos Word não implementada ainda.

Por favor, copie e cole o texto do documento ou descreva seu conteúdo.`;
    },
    
    /**
     * Show upload progress indicator
     * @param {string} fileName - File name
     * @returns {HTMLElement} - Progress element
     */
    showUploadProgress: (fileName) => {
        const progressDiv = Utils.dom.createElement('div', {
            className: 'upload-progress',
            'aria-live': 'polite'
        });
        
        progressDiv.innerHTML = `
            <div class="upload-info">
                <span class="upload-icon">📄</span>
                <span class="upload-text">Processando ${fileName}...</span>
            </div>
            <div class="upload-spinner">
                <div class="spinner"></div>
            </div>
        `;
        
        const chatMessages = Utils.dom.getId('chat-messages');
        chatMessages.appendChild(progressDiv);
        
        // Auto scroll
        Utils.animation.scrollTo(progressDiv);
        
        return progressDiv;
    },
    
    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop: () => {
        const chatContainer = Utils.dom.getSelector('.chat-container');
        
        if (!chatContainer) return;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            chatContainer.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        // Highlight drop zone
        ['dragenter', 'dragover'].forEach(eventName => {
            chatContainer.addEventListener(eventName, () => {
                chatContainer.classList.add('drag-hover');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            chatContainer.addEventListener(eventName, () => {
                chatContainer.classList.remove('drag-hover');
            });
        });
        
        // Handle file drop
        chatContainer.addEventListener('drop', async (e) => {
            const files = Array.from(e.dataTransfer.files);
            
            for (const file of files) {
                await FileHandler.processFile(file);
            }
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileHandler;
}
