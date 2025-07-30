const axios = require('axios');
const cheerio = require('cheerio');

class WebSearchService {
    constructor() {
        this.searchEngines = {
            duckduckgo: 'https://html.duckduckgo.com/html/',
            searx: process.env.SEARX_URL || 'https://searx.be/search'
        };
    }
    
    /**
     * Realizar busca web
     */
    async search(query, options = {}) {
        const { engine = 'duckduckgo', maxResults = 5 } = options;
        
        try {
            switch (engine) {
                case 'duckduckgo':
                    return await this.searchDuckDuckGo(query, maxResults);
                case 'searx':
                    return await this.searchSearx(query, maxResults);
                default:
                    throw new Error(`Motor de busca não suportado: ${engine}`);
            }
        } catch (error) {
            console.error('Erro na busca web:', error);
            return this.getErrorResponse(query, error.message);
        }
    }
    
    /**
     * Buscar no DuckDuckGo
     */
    async searchDuckDuckGo(query, maxResults) {
        try {
            // Usar DuckDuckGo Instant Answer API primeiro
            const instantResponse = await this.getDuckDuckGoInstantAnswer(query);
            if (instantResponse) {
                return instantResponse;
            }
            
            // Fallback para busca HTML (menos confiável devido ao scraping)
            const response = await axios.get(this.searchEngines.duckduckgo, {
                params: {
                    q: query,
                    kl: 'br-pt'
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; DarcyAI/1.0)'
                },
                timeout: 10000
            });
            
            const $ = cheerio.load(response.data);
            const results = [];
            
            $('.result').slice(0, maxResults).each((index, element) => {
                const title = $(element).find('.result__title').text().trim();
                const snippet = $(element).find('.result__snippet').text().trim();
                const url = $(element).find('.result__url').attr('href');
                
                if (title && snippet) {
                    results.push({
                        title,
                        snippet,
                        url: url ? this.cleanUrl(url) : null
                    });
                }
            });
            
            return this.formatSearchResults(query, results);
            
        } catch (error) {
            throw new Error(`Erro na busca DuckDuckGo: ${error.message}`);
        }
    }
    
    /**
     * Obter resposta instantânea do DuckDuckGo
     */
    async getDuckDuckGoInstantAnswer(query) {
        try {
            const response = await axios.get('https://api.duckduckgo.com/', {
                params: {
                    q: query,
                    format: 'json',
                    no_html: '1',
                    skip_disambig: '1'
                },
                timeout: 5000
            });
            
            const data = response.data;
            let result = '';
            
            // Abstract
            if (data.Abstract) {
                result += `**Resumo:** ${data.Abstract}\n\n`;
            }
            
            // Answer
            if (data.Answer) {
                result += `**Resposta:** ${data.Answer}\n\n`;
            }
            
            // Definition
            if (data.Definition) {
                result += `**Definição:** ${data.Definition}\n\n`;
            }
            
            // Related topics
            if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                result += '**Tópicos Relacionados:**\n';
                data.RelatedTopics.slice(0, 3).forEach(topic => {
                    if (topic.Text) {
                        result += `• ${topic.Text}\n`;
                    }
                });
                result += '\n';
            }
            
            // Results
            if (data.Results && data.Results.length > 0) {
                result += '**Resultados:**\n';
                data.Results.slice(0, 3).forEach(item => {
                    if (item.Text) {
                        result += `• ${item.Text}\n`;
                    }
                });
            }
            
            return result || null;
            
        } catch (error) {
            console.error('Erro no DuckDuckGo Instant Answer:', error.message);
            return null;
        }
    }
    
    /**
     * Buscar no SearX
     */
    async searchSearx(query, maxResults) {
        try {
            const response = await axios.get(this.searchEngines.searx, {
                params: {
                    q: query,
                    format: 'json',
                    language: 'pt'
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; DarcyAI/1.0)'
                },
                timeout: 10000
            });
            
            const results = response.data.results
                .slice(0, maxResults)
                .map(result => ({
                    title: result.title,
                    snippet: result.content,
                    url: result.url
                }));
            
            return this.formatSearchResults(query, results);
            
        } catch (error) {
            throw new Error(`Erro na busca SearX: ${error.message}`);
        }
    }
    
    /**
     * Formatar resultados da busca
     */
    formatSearchResults(query, results) {
        if (!results || results.length === 0) {
            return `Não foram encontrados resultados para "${query}".`;
        }
        
        let formatted = `**Resultados da busca para "${query}":**\n\n`;
        
        results.forEach((result, index) => {
            formatted += `**${index + 1}. ${result.title}**\n`;
            formatted += `${result.snippet}\n`;
            if (result.url) {
                formatted += `🔗 [Fonte](${result.url})\n`;
            }
            formatted += '\n';
        });
        
        formatted += `---\n*Busca realizada em ${new Date().toLocaleString('pt-BR')}*`;
        
        return formatted;
    }
    
    /**
     * Obter resposta de erro formatada
     */
    getErrorResponse(query, errorMessage) {
        return `**Erro na busca web**

Não foi possível realizar a busca para "${query}" no momento.

**Motivo:** ${errorMessage}

**Alternativas:**
• Tente reformular a pergunta
• Verifique sua conexão com a internet
• Pergunta baseada no conhecimento interno

*Respondendo com base no conhecimento interno...*`;
    }
    
    /**
     * Limpar URL de tracking
     */
    cleanUrl(url) {
        try {
            // Remove parâmetros comuns de tracking
            const urlObj = new URL(url);
            const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
            
            paramsToRemove.forEach(param => {
                urlObj.searchParams.delete(param);
            });
            
            return urlObj.toString();
        } catch (error) {
            return url;
        }
    }
    
    /**
     * Verificar se o serviço está disponível
     */
    async checkAvailability() {
        try {
            await axios.get('https://api.duckduckgo.com/', {
                params: { q: 'test', format: 'json' },
                timeout: 5000
            });
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Buscar notícias específicas
     */
    async searchNews(query, options = {}) {
        const newsQuery = `${query} site:g1.com.br OR site:folha.uol.com.br OR site:estadao.com.br OR site:bbc.com/portuguese`;
        return await this.search(newsQuery, { ...options, maxResults: 3 });
    }
    
    /**
     * Buscar conteúdo acadêmico
     */
    async searchAcademic(query, options = {}) {
        const academicQuery = `${query} site:scholar.google.com OR site:scielo.org OR site:researchgate.net OR filetype:pdf`;
        return await this.search(academicQuery, { ...options, maxResults: 5 });
    }
}

module.exports = new WebSearchService();
