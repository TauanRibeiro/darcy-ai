// Darcy AI - Backend Server with Modular LLM Support
// Supports multiple free LLM providers with automatic selection and fallback

const express = require('express');
const cors = require('cors');
const http = require('http');
const ModularLLMProvider = require('./modular-llm-provider');

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors({
    origin: ['http://localhost:8000', 'https://darcy-ai-seven.vercel.app', 'https://darcy-ai-*.vercel.app'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// --- Initialize Modular LLM System ---
const llmProvider = new ModularLLMProvider();

// --- Enhanced Educational Content ---
const educationalContent = {
    'teaching': {
        name: 'Equipe de Ensino',
        description: 'Especializada em explicações didáticas e estruturadas',
        agents: ['👨‍🏫 Professor Principal', '📝 Criador de Exemplos', '🎯 Facilitador de Aprendizado'],
        specialization: 'Ensino estruturado e didático'
    },
    'research': {
        name: 'Equipe de Pesquisa', 
        description: 'Focada em análise acadêmica e informações verificáveis',
        agents: ['🔍 Pesquisador Senior', '📊 Analista de Dados', '✅ Verificador de Fontes'],
        specialization: 'Pesquisa acadêmica e análise'
    },
    'creative': {
        name: 'Equipe Criativa',
        description: 'Desenvolve projetos inovadores e atividades envolventes', 
        agents: ['🎨 Designer Educacional', '💡 Inovador Pedagógico', '🛠️ Desenvolvedor de Projetos'],
        specialization: 'Criatividade e inovação pedagógica'
    },
    'assessment': {
        name: 'Equipe de Avaliação',
        description: 'Cria avaliações construtivas e feedback personalizado',
        agents: ['📋 Especialista em Avaliação', '✏️ Criador de Exercícios', '📈 Analista de Progresso'],
        specialization: 'Avaliação e feedback educacional'
    }
};

// --- API Routes ---

app.get('/', (req, res) => {
    const systemStatus = llmProvider.getSystemStatus();
    
    res.json({
        status: '✅ Darcy AI Backend Modular está funcionando!',
        version: '2.1.0',
        timestamp: new Date().toISOString(),
        llmSystem: {
            currentProvider: systemStatus.currentProvider,
            healthyProviders: systemStatus.healthyProviders,
            totalProviders: systemStatus.totalProviders,
            lastHealthCheck: new Date(systemStatus.lastHealthCheck).toISOString()
        },
        features: {
            '🤖 Sistema Modular LLM': true,
            '🔄 Fallback Automático': true,
            '🩺 Health Check': true,
            '👥 Equipes Especializadas': true,
            '🆓 100% Gratuito': true
        },
        crews: Object.keys(educationalContent),
        endpoints: [
            'GET / (status)',
            'POST /api/index (Vercel)',
            'POST /api/v1/crew/execute',
            'GET /api/status',
            'GET /api/health',
            'GET /api/providers'
        ]
    });
});

// Main endpoint for Vercel
app.post('/api/index', async (req, res) => {
    await handleCrewRequest(req, res);
});

// Alternative endpoint
app.post('/api/v1/crew/execute', async (req, res) => {
    await handleCrewRequest(req, res);
});

// Enhanced crew request handler with modular LLM support
async function handleCrewRequest(req, res) {
    const { mode, query, options = {} } = req.body;
    const startTime = Date.now();

    // Validate input
    if (!mode || !query) {
        return res.status(400).json({ 
            error: 'Parâmetros obrigatórios: mode e query',
            example: { 
                mode: 'teaching', 
                query: 'Explique física quântica',
                options: { complexity: 'medium', format: 'structured' }
            },
            availableModes: Object.keys(educationalContent)
        });
    }

    // Validate crew mode
    if (!educationalContent[mode]) {
        return res.status(400).json({ 
            error: `Modo "${mode}" não encontrado`,
            availableModes: Object.keys(educationalContent),
            suggestion: `Você quis dizer "${findClosestMode(mode)}"?`
        });
    }

    const crewData = educationalContent[mode];
    
    try {
        console.log(`🎓 [${crewData.name}] Processando: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
        
        // Generate response using modular LLM system
        const result = await llmProvider.generateResponse(mode, query, options);
        const processingTime = Date.now() - startTime;
        
        // Get current system status
        const systemStatus = llmProvider.getSystemStatus();
        
        res.json({ 
            result,
            metadata: {
                crew: crewData.name,
                specialization: crewData.specialization,
                query: query,
                mode: mode,
                processingTime: `${processingTime}ms`,
                timestamp: new Date().toISOString(),
                agents: crewData.agents,
                llmProvider: systemStatus.currentProvider,
                healthyProviders: systemStatus.healthyProviders
            },
            system: {
                version: '2.1.0',
                modularLLM: true,
                fallbackEnabled: true
            }
        });

        console.log(`✅ Resposta gerada em ${processingTime}ms usando ${systemStatus.currentProvider}`);

    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`❌ Erro ao processar solicitação [${processingTime}ms]:`, error.message);
        
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            message: 'Todos os provedores LLM estão temporariamente indisponíveis',
            details: error.message,
            processingTime: `${processingTime}ms`,
            timestamp: new Date().toISOString(),
            suggestion: 'Tente novamente em alguns segundos. O sistema tentará outros provedores automaticamente.',
            fallbackAvailable: true
        });
    }
}

// Enhanced status endpoint with detailed LLM information
app.get('/api/status', (req, res) => {
    const systemStatus = llmProvider.getSystemStatus();
    
    res.json({
        status: 'operacional',
        version: '2.1.0',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
        llmSystem: {
            currentProvider: systemStatus.currentProvider,
            providersStatus: systemStatus.providersStatus,
            healthyProviders: systemStatus.healthyProviders,
            totalProviders: systemStatus.totalProviders,
            lastHealthCheck: new Date(systemStatus.lastHealthCheck).toISOString()
        },
        crews: Object.keys(educationalContent).map(key => ({
            mode: key,
            name: educationalContent[key].name,
            description: educationalContent[key].description,
            agents: educationalContent[key].agents.length,
            specialization: educationalContent[key].specialization
        })),
        capabilities: {
            'modular_llm': true,
            'auto_fallback': true,
            'health_monitoring': true,
            'multi_provider': true,
            'free_operation': true,
            'educational_focus': true
        },
        performance: {
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version
        }
    });
});

// Providers information endpoint
app.get('/api/providers', (req, res) => {
    const systemStatus = llmProvider.getSystemStatus();
    
    res.json({
        current: systemStatus.currentProvider,
        providers: systemStatus.providersStatus,
        summary: {
            total: systemStatus.totalProviders,
            healthy: systemStatus.healthyProviders,
            unhealthy: systemStatus.totalProviders - systemStatus.healthyProviders,
            lastCheck: new Date(systemStatus.lastHealthCheck).toISOString()
        },
        recommendations: getProviderRecommendations(systemStatus)
    });
});

// Health check for Vercel and monitoring
app.get('/api/health', (req, res) => {
    const systemStatus = llmProvider.getSystemStatus();
    const isHealthy = systemStatus.healthyProviders > 0 || systemStatus.currentProvider === 'Simulação';
    
    res.status(isHealthy ? 200 : 503).json({ 
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        providers: systemStatus.healthyProviders,
        fallbackAvailable: true
    });
});

// Utility functions
function findClosestMode(input) {
    const modes = Object.keys(educationalContent);
    const distances = modes.map(mode => ({
        mode,
        distance: levenshteinDistance(input.toLowerCase(), mode.toLowerCase())
    }));
    
    distances.sort((a, b) => a.distance - b.distance);
    return distances[0].mode;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

function getProviderRecommendations(systemStatus) {
    const recommendations = [];
    
    if (systemStatus.healthyProviders === 0) {
        recommendations.push('⚠️ Nenhum provedor LLM disponível. Instale o Ollama para melhor experiência.');
        recommendations.push('💡 Execute: curl -fsSL https://ollama.com/install.sh | sh');
    }
    
    if (systemStatus.currentProvider === 'Simulação') {
        recommendations.push('🤖 Usando modo simulação. Configure provedores LLM para respostas mais avançadas.');
    }
    
    const ollamaStatus = systemStatus.providersStatus['Ollama Local'];
    if (ollamaStatus && ollamaStatus.status !== 'healthy') {
        recommendations.push('🔧 Ollama local não está funcionando. Verifique se está instalado e rodando.');
    }
    
    return recommendations;
}

// --- Server ---
const server = http.createServer(app);

if (require.main === module) {
    server.listen(port, () => {
        console.log('');
        console.log('🚀 ================================');
        console.log('🤖 Darcy AI Backend Modular v2.1.0');
        console.log('🚀 ================================');
        console.log(`📡 Servidor: http://localhost:${port}`);
        console.log('🔧 Sistema LLM: Modular com fallback automático');
        console.log('🆓 Modo: 100% gratuito');
        console.log('');
        console.log('📋 Endpoints disponíveis:');
        console.log('  - GET  / (status do sistema)');
        console.log('  - POST /api/index (Vercel)');
        console.log('  - POST /api/v1/crew/execute (crews)');
        console.log('  - GET  /api/status (status detalhado)');
        console.log('  - GET  /api/providers (provedores LLM)');
        console.log('  - GET  /api/health (health check)');
        console.log('');
        console.log('🎓 Equipes disponíveis:');
        Object.entries(educationalContent).forEach(([key, crew]) => {
            console.log(`  - ${key}: ${crew.name} (${crew.specialization})`);
        });
        console.log('');
        console.log('💡 Provedores LLM suportados:');
        console.log('  - 🏠 Ollama Local (llama3.1, mistral, codellama)');
        console.log('  - ⚡ Groq API (gratuito com limitações)'); 
        console.log('  - 🤗 Hugging Face (modelos gratuitos)');
        console.log('  - 🔬 Together AI (créditos gratuitos)');
        console.log('  - 🧠 Cohere (trial gratuito)');
        console.log('  - 🔍 Perplexity (uso gratuito limitado)');
        console.log('');
        console.log('✨ Sistema iniciado com sucesso!');
        console.log('');
    });
}

module.exports = app;

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 Encerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor encerrado graciosamente');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🔄 Encerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor encerrado');
        process.exit(0);
    });
});
