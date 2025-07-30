const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

// Simple UUID generator (to avoid dependency)
function generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Import services
const LLMService = require('./services/llm-service');
const FileProcessor = require('./services/file-processor');
const WebSearchService = require('./services/web-search');
const RateLimiter = require('./middleware/rate-limiter');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Para desenvolvimento
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', RateLimiter);

// Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `${generateId()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/markdown',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'video/mp4',
            'video/webm'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Tipo de arquivo não suportado: ${file.mimetype}`));
        }
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, provider, model, context, webSearch } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Mensagem é obrigatória' });
        }
        
        let processedMessage = message;
        
        // Busca web se solicitada
        if (webSearch) {
            const searchResults = await WebSearchService.search(message);
            processedMessage = `${message}\n\nResultados da pesquisa:\n${searchResults}`;
        }
        
        // Processar com LLM
        const response = await LLMService.processMessage(processedMessage, {
            provider: provider || 'ollama',
            model: model || 'llama2',
            context: context || 'general'
        });
        
        res.json({
            response,
            timestamp: new Date().toISOString(),
            provider: provider || 'ollama',
            model: model || 'llama2'
        });
        
    } catch (error) {
        console.error('Erro no chat:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// Upload de arquivo
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }
        
        const { action = 'analyze' } = req.body;
        const filePath = req.file.path;
        
        // Processar arquivo
        const result = await FileProcessor.processFile(filePath, req.file.originalname, action);
        
        // Limpar arquivo temporário
        await fs.unlink(filePath).catch(console.error);
        
        res.json({
            filename: req.file.originalname,
            size: req.file.size,
            type: req.file.mimetype,
            content: result.content,
            analysis: result.analysis,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Erro no upload:', error);
        
        // Limpar arquivo em caso de erro
        if (req.file) {
            await fs.unlink(req.file.path).catch(console.error);
        }
        
        res.status(500).json({
            error: 'Erro ao processar arquivo',
            message: error.message
        });
    }
});

// Verificar disponibilidade de providers
app.get('/api/providers/check/:provider', async (req, res) => {
    try {
        const { provider } = req.params;
        const isAvailable = await LLMService.checkProvider(provider);
        
        res.json({
            provider,
            available: isAvailable,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao verificar provider',
            message: error.message
        });
    }
});

// Listar modelos disponíveis
app.get('/api/providers/:provider/models', async (req, res) => {
    try {
        const { provider } = req.params;
        const models = await LLMService.getAvailableModels(provider);
        
        res.json({
            provider,
            models,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao listar modelos',
            message: error.message
        });
    }
});

// Busca web
app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query é obrigatória' });
        }
        
        const results = await WebSearchService.search(query);
        
        res.json({
            query,
            results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Erro na busca:', error);
        res.status(500).json({
            error: 'Erro na busca web',
            message: error.message
        });
    }
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Arquivo muito grande',
                message: 'Tamanho máximo permitido: 10MB'
            });
        }
    }
    
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint não encontrado',
        path: req.originalUrl
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Darcy AI Backend rodando na porta ${PORT}`);
    console.log(`📖 Documentação: http://localhost:${PORT}/api/health`);
});

module.exports = app;
