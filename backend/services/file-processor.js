const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const sharp = require('sharp');

class FileProcessor {
    constructor() {
        this.maxTextLength = 50000; // 50KB de texto
    }
    
    /**
     * Processar arquivo baseado no tipo
     */
    async processFile(filePath, originalName, action = 'analyze') {
        const extension = path.extname(originalName).toLowerCase();
        const mimeType = this.getMimeType(extension);
        
        let content = '';
        let metadata = {};
        
        try {
            // Processar baseado no tipo
            if (this.isTextFile(extension)) {
                content = await this.processTextFile(filePath);
            } else if (this.isPDFFile(extension)) {
                const result = await this.processPDFFile(filePath);
                content = result.text;
                metadata = result.metadata;
            } else if (this.isWordFile(extension)) {
                const result = await this.processWordFile(filePath);
                content = result.text;
                metadata = result.metadata;
            } else if (this.isImageFile(extension)) {
                const result = await this.processImageFile(filePath);
                content = result.description;
                metadata = result.metadata;
            } else if (this.isAudioFile(extension)) {
                const result = await this.processAudioFile(filePath);
                content = result.description;
                metadata = result.metadata;
            } else {
                throw new Error(`Tipo de arquivo não suportado: ${extension}`);
            }
            
            // Truncar se muito longo
            if (content.length > this.maxTextLength) {
                content = content.substring(0, this.maxTextLength) + '\n\n[Conteúdo truncado...]';
            }
            
            // Gerar análise
            const analysis = await this.generateAnalysis(content, originalName, action);
            
            return {
                content,
                metadata,
                analysis,
                originalName,
                processedAt: new Date().toISOString()
            };
            
        } catch (error) {
            throw new Error(`Erro ao processar ${originalName}: ${error.message}`);
        }
    }
    
    /**
     * Processar arquivo de texto
     */
    async processTextFile(filePath) {
        const buffer = await fs.readFile(filePath);
        return buffer.toString('utf-8');
    }
    
    /**
     * Processar arquivo PDF
     */
    async processPDFFile(filePath) {
        const buffer = await fs.readFile(filePath);
        const data = await pdfParse(buffer);
        
        return {
            text: data.text,
            metadata: {
                pages: data.numpages,
                info: data.info,
                version: data.version
            }
        };
    }
    
    /**
     * Processar documento Word
     */
    async processWordFile(filePath) {
        const buffer = await fs.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer });
        
        return {
            text: result.value,
            metadata: {
                messages: result.messages,
                hasImages: result.messages.some(m => m.type === 'image')
            }
        };
    }
    
    /**
     * Processar arquivo de imagem
     */
    async processImageFile(filePath) {
        try {
            const metadata = await sharp(filePath).metadata();
            const stats = await fs.stat(filePath);
            
            return {
                description: `Imagem processada com sucesso:
                
📷 **Informações da Imagem:**
- **Formato:** ${metadata.format?.toUpperCase()}
- **Dimensões:** ${metadata.width} x ${metadata.height} pixels
- **Canais de cor:** ${metadata.channels}
- **Densidade:** ${metadata.density || 'N/A'} DPI
- **Tamanho:** ${this.formatFileSize(stats.size)}
- **Espaço de cor:** ${metadata.space || 'N/A'}

🎨 **Análise Visual:**
A imagem foi carregada e está pronta para análise. Você pode:
- Solicitar uma descrição detalhada do conteúdo
- Pedir para identificar elementos específicos
- Usar para fins educacionais ou de pesquisa

Por favor, descreva o que você gostaria que eu fizesse com esta imagem.`,
                
                metadata: {
                    format: metadata.format,
                    width: metadata.width,
                    height: metadata.height,
                    channels: metadata.channels,
                    space: metadata.space,
                    density: metadata.density,
                    hasAlpha: metadata.hasAlpha,
                    fileSize: stats.size
                }
            };
        } catch (error) {
            return {
                description: `Erro ao processar imagem: ${error.message}`,
                metadata: { error: error.message }
            };
        }
    }
    
    /**
     * Processar arquivo de áudio
     */
    async processAudioFile(filePath) {
        try {
            const stats = await fs.stat(filePath);
            
            // Para implementação completa, usaria ffprobe ou similar
            return {
                description: `Arquivo de áudio carregado:
                
🎵 **Informações do Áudio:**
- **Tamanho:** ${this.formatFileSize(stats.size)}
- **Data de criação:** ${stats.birthtime.toLocaleDateString('pt-BR')}

🔊 **Próximos Passos:**
Para uma análise completa do áudio, você pode:
- Descrever o conteúdo (música, fala, etc.)
- Solicitar transcrição (se for fala)
- Pedir análise musical (se for música)
- Usar para fins educacionais

**Nota:** Transcrição automática e análise espectral serão implementadas em versões futuras.

Por favor, descreva o conteúdo do arquivo ou o que você gostaria que eu fizesse com ele.`,
                
                metadata: {
                    fileSize: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                }
            };
        } catch (error) {
            return {
                description: `Erro ao processar áudio: ${error.message}`,
                metadata: { error: error.message }
            };
        }
    }
    
    /**
     * Gerar análise do conteúdo
     */
    async generateAnalysis(content, fileName, action) {
        const LLMService = require('./llm-service');
        
        let prompt = '';
        
        switch (action) {
            case 'summarize':
                prompt = `Por favor, faça um resumo executivo do seguinte documento "${fileName}":\n\n${content}`;
                break;
            case 'explain':
                prompt = `Por favor, explique de forma didática e educacional o conteúdo do documento "${fileName}":\n\n${content}`;
                break;
            case 'questions':
                prompt = `Baseado no documento "${fileName}", crie 5 perguntas educacionais relevantes:\n\n${content}`;
                break;
            case 'analyze':
            default:
                prompt = `Analise educacionalmente o documento "${fileName}" e forneça insights pedagógicos úteis:\n\n${content}`;
                break;
        }
        
        try {
            return await LLMService.processMessage(prompt, {
                context: 'research',
                maxTokens: 1500
            });
        } catch (error) {
            return `Análise automática não disponível no momento. 
                   Conteúdo do arquivo carregado com sucesso e pronto para discussão.`;
        }
    }
    
    /**
     * Verificar se é arquivo de texto
     */
    isTextFile(extension) {
        return ['.txt', '.md', '.csv', '.json', '.xml', '.html', '.css', '.js'].includes(extension);
    }
    
    /**
     * Verificar se é arquivo PDF
     */
    isPDFFile(extension) {
        return extension === '.pdf';
    }
    
    /**
     * Verificar se é arquivo Word
     */
    isWordFile(extension) {
        return ['.doc', '.docx'].includes(extension);
    }
    
    /**
     * Verificar se é arquivo de imagem
     */
    isImageFile(extension) {
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'].includes(extension);
    }
    
    /**
     * Verificar se é arquivo de áudio
     */
    isAudioFile(extension) {
        return ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'].includes(extension);
    }
    
    /**
     * Obter MIME type baseado na extensão
     */
    getMimeType(extension) {
        const mimeTypes = {
            '.txt': 'text/plain',
            '.md': 'text/markdown',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg'
        };
        
        return mimeTypes[extension] || 'application/octet-stream';
    }
    
    /**
     * Formatar tamanho do arquivo
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = new FileProcessor();
