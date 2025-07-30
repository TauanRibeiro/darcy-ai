// Darcy AI - Dynamic LLM Priority System
// Sistema inteligente de seleção de LLM baseado na demanda

class DynamicLLMPrioritySystem {
    constructor() {
        this.providers = new Map();
        this.usageStats = new Map();
        this.performanceMetrics = new Map();
        this.demandAnalyzer = new DemandAnalyzer();
        
        this.initializeProviders();
        this.startMetricsCollection();
    }

    initializeProviders() {
        // Configuração base dos provedores
        const baseProviders = {
            ollama: {
                name: 'Ollama Local',
                basePriority: 1,
                specialization: ['general', 'teaching', 'privacy'],
                strengths: ['offline', 'unlimited', 'privacy', 'stable'],
                weaknesses: ['setup_required', 'resource_intensive'],
                demandTriggers: ['privacy_concern', 'offline_usage', 'unlimited_requests']
            },
            
            deepseek: {
                name: 'DeepSeek',
                basePriority: 5, // Não é prioridade, apenas uma opção
                specialization: ['coding', 'mathematics', 'technical'],
                strengths: ['code_quality', 'math_accuracy', 'technical_depth'],
                weaknesses: ['limited_availability', 'specific_use_case'],
                demandTriggers: ['code_question', 'math_problem', 'technical_explanation']
            },
            
            groq: {
                name: 'Groq',
                basePriority: 2,
                specialization: ['speed', 'general', 'quick_responses'],
                strengths: ['very_fast', 'good_quality', 'reliable_api'],
                weaknesses: ['rate_limited', 'api_key_required'],
                demandTriggers: ['speed_priority', 'quick_answer', 'real_time_chat']
            },
            
            together: {
                name: 'Together AI',
                basePriority: 3,
                specialization: ['variety', 'model_choice', 'specialized_models'],
                strengths: ['model_diversity', 'good_performance', 'specialized_options'],
                weaknesses: ['api_key_required', 'usage_limits'],
                demandTriggers: ['model_variety', 'specialized_task', 'fallback_option']
            },
            
            huggingface: {
                name: 'HuggingFace',
                basePriority: 4,
                specialization: ['research', 'experimental', 'open_models'],
                strengths: ['cutting_edge', 'research_models', 'open_source'],
                weaknesses: ['inconsistent_availability', 'experimental'],
                demandTriggers: ['research_task', 'experimental_model', 'latest_tech']
            }
        };

        // Inicializar provedores com métricas
        Object.entries(baseProviders).forEach(([key, config]) => {
            this.providers.set(key, {
                ...config,
                currentPriority: config.basePriority,
                isHealthy: false,
                responseTime: Infinity,
                successRate: 0,
                lastUsed: null,
                usageCount: 0,
                errorCount: 0
            });
            
            this.usageStats.set(key, {
                requests: 0,
                successes: 0,
                failures: 0,
                avgResponseTime: 0,
                satisfaction: 0
            });
        });
    }

    async selectOptimalProvider(query, crew, context = {}) {
        const demand = this.demandAnalyzer.analyze(query, crew, context);
        const candidates = this.getCandidates(demand);
        const optimal = this.rankCandidates(candidates, demand);
        
        console.log(`🧠 Seleção LLM: ${optimal.name} (score: ${optimal.score.toFixed(2)})`);
        console.log(`📊 Demanda: ${demand.type} | Prioridades: ${demand.priorities.join(', ')}`);
        
        return optimal.provider;
    }

    getCandidates(demand) {
        const candidates = [];
        
        this.providers.forEach((provider, key) => {
            if (!provider.isHealthy) return;
            
            const relevanceScore = this.calculateRelevance(provider, demand);
            const performanceScore = this.calculatePerformance(provider);
            const availabilityScore = this.calculateAvailability(provider);
            
            candidates.push({
                provider: key,
                name: provider.name,
                relevance: relevanceScore,
                performance: performanceScore,
                availability: availabilityScore,
                score: (relevanceScore * 0.4) + (performanceScore * 0.3) + (availabilityScore * 0.3)
            });
        });
        
        return candidates.sort((a, b) => b.score - a.score);
    }

    calculateRelevance(provider, demand) {
        let score = 0;
        
        // Especialização
        const specialMatch = provider.specialization.filter(spec => 
            demand.categories.includes(spec)
        ).length;
        score += specialMatch * 0.3;
        
        // Triggers de demanda
        const triggerMatch = provider.demandTriggers.filter(trigger =>
            demand.triggers.includes(trigger)
        ).length;
        score += triggerMatch * 0.4;
        
        // Pontos fortes
        const strengthMatch = provider.strengths.filter(strength =>
            demand.priorities.includes(strength)
        ).length;
        score += strengthMatch * 0.3;
        
        return Math.min(score, 1.0);
    }

    calculatePerformance(provider) {
        const stats = this.usageStats.get(provider.name.toLowerCase()) || {};
        
        const successRate = stats.requests > 0 ? stats.successes / stats.requests : 0.5;
        const speedScore = provider.responseTime < 3000 ? 1.0 : Math.max(0.1, 5000 / provider.responseTime);
        const reliabilityScore = Math.max(0, 1 - (provider.errorCount / 10));
        
        return (successRate * 0.4) + (speedScore * 0.3) + (reliabilityScore * 0.3);
    }

    calculateAvailability(provider) {
        if (!provider.isHealthy) return 0;
        
        const recencyBonus = provider.lastUsed ? 
            Math.max(0, 1 - ((Date.now() - provider.lastUsed) / (24 * 60 * 60 * 1000))) : 0.5;
        
        const loadScore = provider.usageCount > 100 ? 0.7 : 1.0; // Penalizar overload
        
        return Math.min(1.0, 0.8 + (recencyBonus * 0.1) + (loadScore * 0.1));
    }

    rankCandidates(candidates, demand) {
        if (candidates.length === 0) {
            return { provider: 'simulation', name: 'Simulation Mode', score: 0 };
        }
        
        // Aplicar boost baseado na demanda específica
        candidates.forEach(candidate => {
            const provider = this.providers.get(candidate.provider);
            
            // Boost para alta prioridade em demandas específicas
            if (demand.type === 'technical' && provider.specialization.includes('coding')) {
                candidate.score *= 1.3;
            }
            
            if (demand.type === 'privacy' && provider.strengths.includes('privacy')) {
                candidate.score *= 1.5;
            }
            
            if (demand.type === 'speed' && provider.strengths.includes('very_fast')) {
                candidate.score *= 1.2;
            }
        });
        
        return candidates.sort((a, b) => b.score - a.score)[0];
    }

    updateProviderHealth(providerId, isHealthy, responseTime = null) {
        const provider = this.providers.get(providerId);
        if (!provider) return;
        
        provider.isHealthy = isHealthy;
        if (responseTime) {
            provider.responseTime = responseTime;
        }
        
        // Recalcular prioridades dinâmicas
        this.recalculatePriorities();
    }

    recordUsage(providerId, success, responseTime, userSatisfaction = null) {
        const provider = this.providers.get(providerId);
        const stats = this.usageStats.get(providerId);
        
        if (provider) {
            provider.usageCount++;
            provider.lastUsed = Date.now();
            
            if (success) {
                provider.responseTime = (provider.responseTime + responseTime) / 2;
            } else {
                provider.errorCount++;
            }
        }
        
        if (stats) {
            stats.requests++;
            if (success) {
                stats.successes++;
                stats.avgResponseTime = (stats.avgResponseTime + responseTime) / 2;
            } else {
                stats.failures++;
            }
            
            if (userSatisfaction !== null) {
                stats.satisfaction = (stats.satisfaction + userSatisfaction) / 2;
            }
        }
    }

    recalculatePriorities() {
        this.providers.forEach((provider, key) => {
            const performance = this.calculatePerformance(provider);
            const availability = this.calculateAvailability(provider);
            
            // Ajustar prioridade dinâmica baseada na performance
            const dynamicAdjustment = (performance + availability - 1) * 2;
            provider.currentPriority = Math.max(1, 
                provider.basePriority + Math.round(dynamicAdjustment)
            );
        });
    }

    startMetricsCollection() {
        // Coleta periódica de métricas
        setInterval(() => {
            this.recalculatePriorities();
            this.logMetrics();
        }, 60000); // A cada minuto
    }

    logMetrics() {
        console.log('📊 Dynamic LLM Metrics:');
        this.providers.forEach((provider, key) => {
            const stats = this.usageStats.get(key);
            console.log(`  ${provider.name}: Priority ${provider.currentPriority}, Health: ${provider.isHealthy}, Usage: ${provider.usageCount}`);
        });
    }

    getProviderStatus() {
        const status = {};
        this.providers.forEach((provider, key) => {
            status[key] = {
                name: provider.name,
                basePriority: provider.basePriority,
                currentPriority: provider.currentPriority,
                isHealthy: provider.isHealthy,
                specialization: provider.specialization,
                responseTime: provider.responseTime,
                usageCount: provider.usageCount,
                successRate: this.usageStats.get(key)?.successes / Math.max(1, this.usageStats.get(key)?.requests) || 0
            };
        });
        return status;
    }
}

class DemandAnalyzer {
    analyze(query, crew, context) {
        const analysis = {
            type: 'general',
            categories: [],
            triggers: [],
            priorities: [],
            confidence: 0
        };

        const queryLower = query.toLowerCase();
        
        // Análise técnica
        if (this.isTechnical(queryLower)) {
            analysis.type = 'technical';
            analysis.categories.push('coding', 'mathematics', 'technical');
            analysis.triggers.push('code_question', 'math_problem', 'technical_explanation');
            analysis.priorities.push('code_quality', 'math_accuracy', 'technical_depth');
            analysis.confidence += 0.8;
        }
        
        // Análise de privacidade
        if (this.isPrivacySensitive(queryLower, context)) {
            analysis.type = 'privacy';
            analysis.categories.push('privacy', 'sensitive');
            analysis.triggers.push('privacy_concern', 'offline_usage');
            analysis.priorities.push('privacy', 'offline', 'unlimited');
            analysis.confidence += 0.9;
        }
        
        // Análise de velocidade
        if (this.needsSpeed(queryLower, context)) {
            analysis.categories.push('speed', 'quick');
            analysis.triggers.push('speed_priority', 'quick_answer', 'real_time_chat');
            analysis.priorities.push('very_fast', 'responsive');
            analysis.confidence += 0.6;
        }
        
        // Análise por crew
        this.analyzeCrewDemand(crew, analysis);
        
        return analysis;
    }

    isTechnical(query) {
        const technicalKeywords = [
            'código', 'programação', 'algoritmo', 'função', 'variável',
            'matemática', 'equação', 'fórmula', 'derivada', 'integral',
            'python', 'javascript', 'html', 'css', 'sql', 'api'
        ];
        
        return technicalKeywords.some(keyword => query.includes(keyword));
    }

    isPrivacySensitive(query, context) {
        const sensitiveIndicators = [
            'dados pessoais', 'privacidade', 'confidencial', 'pessoal',
            'senhas', 'informações privadas'
        ];
        
        const hasOfflinePreference = context.preferOffline || false;
        const hasSensitiveContent = sensitiveIndicators.some(indicator => query.includes(indicator));
        
        return hasOfflinePreference || hasSensitiveContent;
    }

    needsSpeed(query, context) {
        const speedIndicators = [
            'rápido', 'urgente', 'agora', 'imediato', 'tempo real'
        ];
        
        const isRealTimeContext = context.realTime || false;
        const hasSpeedRequest = speedIndicators.some(indicator => query.includes(indicator));
        
        return isRealTimeContext || hasSpeedRequest;
    }

    analyzeCrewDemand(crew, analysis) {
        const crewDemands = {
            teaching: {
                categories: ['educational', 'explanation'],
                priorities: ['clarity', 'structured', 'examples']
            },
            creative: {
                categories: ['creative', 'innovation'],
                priorities: ['creativity', 'uniqueness', 'variety']
            },
            assessment: {
                categories: ['evaluation', 'testing'],
                priorities: ['accuracy', 'structured', 'fair']
            },
            research: {
                categories: ['research', 'academic'],
                priorities: ['accuracy', 'depth', 'reliable']
            }
        };

        const demand = crewDemands[crew];
        if (demand) {
            analysis.categories.push(...demand.categories);
            analysis.priorities.push(...demand.priorities);
            analysis.confidence += 0.5;
        }
    }
}

module.exports = {
    DynamicLLMPrioritySystem,
    DemandAnalyzer
};
