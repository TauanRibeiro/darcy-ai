# Darcy AI - Integração JavaScript ↔ Python
# Serviço para comunicação entre frontend JS e backend Python

class DarcyPythonIntegration {
    constructor() {
        this.pythonApiUrl = 'http://localhost:5000/api/python';
        this.isAvailable = false;
        this.capabilities = {};
        this.init();
    }

    async init() {
        await this.checkAvailability();
        if (this.isAvailable) {
            await this.loadCapabilities();
            this.setupUI();
        }
    }

    async checkAvailability() {
        try {
            const response = await fetch(`${this.pythonApiUrl}/health`);
            const data = await response.json();
            
            this.isAvailable = data.status === 'healthy';
            
            if (this.isAvailable) {
                console.log('🐍 Componentes Python disponíveis:', data.components);
                this.displayStatus('🐍 Python Components: Online', 'success');
            } else {
                console.warn('⚠️ Componentes Python indisponíveis');
                this.displayStatus('🐍 Python Components: Offline', 'warning');
            }
            
        } catch (error) {
            console.warn('Python API não encontrada:', error.message);
            this.displayStatus('🐍 Python Components: Not Found', 'error');
            this.isAvailable = false;
        }
    }

    async loadCapabilities() {
        try {
            const response = await fetch(`${this.pythonApiUrl}/capabilities`);
            this.capabilities = await response.json();
            console.log('📋 Capacidades Python carregadas:', Object.keys(this.capabilities));
        } catch (error) {
            console.error('Erro ao carregar capacidades:', error);
        }
    }

    setupUI() {
        // Adicionar botões e painéis para funcionalidades Python
        const pythonPanel = document.createElement('div');
        pythonPanel.id = 'python-panel';
        pythonPanel.innerHTML = `
            <div class="python-integration-panel">
                <h3>🐍 Funcionalidades Python</h3>
                <div class="python-buttons">
                    <button onclick="darcyPython.showAnalytics()" class="python-btn">
                        📊 Analytics Avançado
                    </button>
                    <button onclick="darcyPython.showFileProcessor()" class="python-btn">
                        📄 Processar Arquivos
                    </button>
                    <button onclick="darcyPython.showEnhancer()" class="python-btn">
                        ✨ Melhorar Respostas
                    </button>
                    <button onclick="darcyPython.showWebSearch()" class="python-btn">
                        🔍 Busca Educacional
                    </button>
                </div>
                <div id="python-content" class="python-content"></div>
            </div>
        `;

        // Adicionar CSS específico
        const style = document.createElement('style');
        style.textContent = `
            .python-integration-panel {
                background: linear-gradient(135deg, #2c3e50, #3498db);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                color: white;
            }
            
            .python-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                margin: 15px 0;
            }
            
            .python-btn {
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .python-btn:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-2px);
            }
            
            .python-content {
                margin-top: 20px;
                min-height: 100px;
                background: rgba(0,0,0,0.1);
                border-radius: 8px;
                padding: 15px;
            }
            
            .analytics-chart {
                background: white;
                color: black;
                padding: 15px;
                border-radius: 8px;
                margin: 10px 0;
            }
            
            .file-drop-zone {
                border: 2px dashed rgba(255,255,255,0.5);
                border-radius: 8px;
                padding: 40px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .file-drop-zone:hover {
                border-color: #3498db;
                background: rgba(52,152,219,0.1);
            }
            
            .enhancement-result {
                background: rgba(46,204,113,0.1);
                border: 1px solid #2ecc71;
                border-radius: 8px;
                padding: 15px;
                margin: 10px 0;
            }
            
            .search-results {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .search-result-item {
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
                padding: 12px;
                margin: 8px 0;
                border-left: 4px solid #3498db;
            }
        `;
        document.head.appendChild(style);

        // Inserir painel após o status panel
        const statusPanel = document.querySelector('.status-panel');
        if (statusPanel) {
            statusPanel.parentNode.insertBefore(pythonPanel, statusPanel.nextSibling);
        } else {
            document.body.appendChild(pythonPanel);
        }
    }

    displayStatus(message, type) {
        const statusElement = document.getElementById('python-status') || this.createStatusElement();
        statusElement.textContent = message;
        statusElement.className = `python-status ${type}`;
    }

    createStatusElement() {
        const statusElement = document.createElement('div');
        statusElement.id = 'python-status';
        statusElement.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px 15px;
            border-radius: 5px;
            color: white;
            z-index: 1000;
            font-size: 14px;
        `;
        document.body.appendChild(statusElement);
        return statusElement;
    }

    // Analytics Avançado
    async showAnalytics() {
        const content = document.getElementById('python-content');
        content.innerHTML = `
            <h4>📊 Analytics de Aprendizado</h4>
            <div class="analytics-controls">
                <button onclick="darcyPython.analyzeInteractions()">Analisar Interações</button>
                <button onclick="darcyPython.generateReport()">Gerar Relatório</button>
            </div>
            <div id="analytics-results"></div>
        `;
    }

    async analyzeInteractions() {
        // Coletar dados de interações do localStorage ou sessionStorage
        const interactions = this.collectInteractionData();
        
        try {
            const response = await fetch(`${this.pythonApiUrl}/analyze-interactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ interactions })
            });

            const result = await response.json();
            
            if (result.success) {
                this.displayAnalytics(result.analysis);
            } else {
                console.error('Erro na análise:', result.error);
            }
            
        } catch (error) {
            console.error('Erro ao analisar interações:', error);
        }
    }

    collectInteractionData() {
        // Simular dados de interação por enquanto
        // Em implementação real, coletar do histórico real
        return [
            {
                query: "física quântica",
                crew: "teaching",
                timestamp: new Date().toISOString(),
                processing_time: 2.5
            },
            {
                query: "matemática derivadas",
                crew: "teaching", 
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                processing_time: 1.8
            },
            {
                query: "história do brasil",
                crew: "research",
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                processing_time: 3.2
            }
        ];
    }

    displayAnalytics(analysis) {
        const resultsDiv = document.getElementById('analytics-results');
        resultsDiv.innerHTML = `
            <div class="analytics-chart">
                <h5>📈 Análise de Padrões de Aprendizado</h5>
                <p><strong>Total de Interações:</strong> ${analysis.total_interactions}</p>
                <p><strong>Tempo Médio de Resposta:</strong> ${analysis.avg_response_time?.toFixed(2)}s</p>
                
                <h6>🏆 Tópicos Mais Consultados:</h6>
                <ul>
                    ${Object.entries(analysis.top_topics || {})
                        .map(([topic, count]) => `<li>${topic}: ${count} vezes</li>`)
                        .join('')}
                </ul>
                
                <h6>👥 Preferências de Equipes:</h6>
                <ul>
                    ${Object.entries(analysis.crew_preferences || {})
                        .map(([crew, count]) => `<li>${crew}: ${count} consultas</li>`)
                        .join('')}
                </ul>
                
                <h6>💡 Recomendações:</h6>
                <ul>
                    ${(analysis.recommendations || [])
                        .map(rec => `<li>${rec}</li>`)
                        .join('')}
                </ul>
            </div>
        `;
    }

    // Processador de Arquivos
    async showFileProcessor() {
        const content = document.getElementById('python-content');
        content.innerHTML = `
            <h4>📄 Processador de Arquivos Avançado</h4>
            <div class="file-drop-zone" onclick="document.getElementById('file-input').click()">
                <p>📎 Clique para selecionar arquivo ou arraste aqui</p>
                <p><small>Suporta: PDF, JPG, PNG, DOCX</small></p>
            </div>
            <input type="file" id="file-input" style="display: none" 
                   accept=".pdf,.jpg,.jpeg,.png,.docx" 
                   onchange="darcyPython.processFile(this.files[0])">
            <div id="file-results"></div>
        `;
    }

    async processFile(file) {
        if (!file) return;

        const resultsDiv = document.getElementById('file-results');
        resultsDiv.innerHTML = '<p>🔄 Processando arquivo...</p>';

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${this.pythonApiUrl}/process-file`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                this.displayFileResults(result.result);
            } else {
                resultsDiv.innerHTML = `<p style="color: #e74c3c">❌ Erro: ${result.error}</p>`;
            }
            
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            resultsDiv.innerHTML = '<p style="color: #e74c3c">❌ Erro na comunicação com o servidor</p>';
        }
    }

    displayFileResults(result) {
        const resultsDiv = document.getElementById('file-results');
        
        if (result.error) {
            resultsDiv.innerHTML = `<p style="color: #e74c3c">❌ ${result.error}</p>`;
            return;
        }

        let content = `
            <div class="analytics-chart">
                <h5>📋 Análise do Arquivo</h5>
                <p><strong>Tipo:</strong> ${result.type}</p>
        `;

        if (result.pages) {
            content += `<p><strong>Páginas:</strong> ${result.pages}</p>`;
        }

        if (result.text) {
            content += `
                <p><strong>Palavras:</strong> ${result.text.split(' ').length}</p>
                <div style="max-height: 200px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>Texto Extraído:</strong><br>
                    ${result.text.substring(0, 500)}${result.text.length > 500 ? '...' : ''}
                </div>
            `;
        }

        if (result.educational_analysis) {
            const analysis = result.educational_analysis;
            content += `
                <h6>📚 Análise Educacional:</h6>
                <p><strong>Assunto Principal:</strong> ${analysis.main_subject}</p>
                <p><strong>Nível de Leitura:</strong> ${analysis.reading_level}</p>
                <p><strong>Contém Equações:</strong> ${analysis.has_equations ? 'Sim' : 'Não'}</p>
                <p><strong>Contém Código:</strong> ${analysis.has_code ? 'Sim' : 'Não'}</p>
            `;
        }

        content += '</div>';
        resultsDiv.innerHTML = content;
    }

    // Melhorador de Respostas
    async showEnhancer() {
        const content = document.getElementById('python-content');
        content.innerHTML = `
            <h4>✨ Melhorador de Respostas</h4>
            <div>
                <textarea id="response-input" placeholder="Cole aqui a resposta para análise..." 
                          style="width: 100%; height: 120px; margin: 10px 0; padding: 10px; border-radius: 5px; border: 1px solid #ccc;"></textarea>
                <br>
                <button onclick="darcyPython.enhanceResponse()">Analisar e Melhorar</button>
            </div>
            <div id="enhancement-results"></div>
        `;
    }

    async enhanceResponse() {
        const responseText = document.getElementById('response-input').value;
        if (!responseText.trim()) {
            alert('Por favor, insira uma resposta para análise');
            return;
        }

        const resultsDiv = document.getElementById('enhancement-results');
        resultsDiv.innerHTML = '<p>🔄 Analisando qualidade da resposta...</p>';

        const context = {
            query: "análise de qualidade",
            crew: "teaching",
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(`${this.pythonApiUrl}/enhance-response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    response: responseText,
                    context: context
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.displayEnhancementResults(result.enhancement);
            } else {
                resultsDiv.innerHTML = `<p style="color: #e74c3c">❌ Erro: ${result.error}</p>`;
            }
            
        } catch (error) {
            console.error('Erro ao melhorar resposta:', error);
            resultsDiv.innerHTML = '<p style="color: #e74c3c">❌ Erro na comunicação</p>';
        }
    }

    displayEnhancementResults(enhancement) {
        const resultsDiv = document.getElementById('enhancement-results');
        
        const clarityPercent = Math.round(enhancement.clarity_score * 100);
        const qualityPercent = Math.round(enhancement.educational_quality * 100);
        const completenessPercent = Math.round(enhancement.completeness * 100);

        resultsDiv.innerHTML = `
            <div class="enhancement-result">
                <h5>📊 Análise de Qualidade</h5>
                
                <div style="margin: 15px 0;">
                    <strong>Clareza:</strong> ${clarityPercent}%
                    <div style="background: #ecf0f1; border-radius: 10px; height: 8px; margin: 5px 0;">
                        <div style="background: #3498db; height: 8px; border-radius: 10px; width: ${clarityPercent}%;"></div>
                    </div>
                </div>
                
                <div style="margin: 15px 0;">
                    <strong>Qualidade Educacional:</strong> ${qualityPercent}%
                    <div style="background: #ecf0f1; border-radius: 10px; height: 8px; margin: 5px 0;">
                        <div style="background: #2ecc71; height: 8px; border-radius: 10px; width: ${qualityPercent}%;"></div>
                    </div>
                </div>
                
                <div style="margin: 15px 0;">
                    <strong>Completude:</strong> ${completenessPercent}%
                    <div style="background: #ecf0f1; border-radius: 10px; height: 8px; margin: 5px 0;">
                        <div style="background: #e67e22; height: 8px; border-radius: 10px; width: ${completenessPercent}%;"></div>
                    </div>
                </div>
                
                <p><strong>Palavras:</strong> ${enhancement.word_count}</p>
                
                <h6>💡 Sugestões de Melhoria:</h6>
                <ul>
                    ${(enhancement.suggestions || [])
                        .map(suggestion => `<li>${suggestion}</li>`)
                        .join('')}
                </ul>
            </div>
        `;
    }

    // Busca Educacional
    async showWebSearch() {
        const content = document.getElementById('python-content');
        content.innerHTML = `
            <h4>🔍 Busca Educacional Avançada</h4>
            <div>
                <input type="text" id="search-query" placeholder="Digite sua pesquisa educacional..." 
                       style="width: 70%; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">
                <button onclick="darcyPython.searchEducational()" style="padding: 10px 15px; margin-left: 10px;">
                    Buscar
                </button>
            </div>
            <div id="search-results" class="search-results"></div>
        `;
    }

    async searchEducational() {
        const query = document.getElementById('search-query').value;
        if (!query.trim()) {
            alert('Por favor, digite uma consulta de pesquisa');
            return;
        }

        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = '<p>🔍 Buscando conteúdo educacional...</p>';

        try {
            const response = await fetch(`${this.pythonApiUrl}/search-educational`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query })
            });

            const result = await response.json();
            
            if (result.success) {
                this.displaySearchResults(result.search_results);
            } else {
                resultsDiv.innerHTML = `<p style="color: #e74c3c">❌ Erro: ${result.error}</p>`;
            }
            
        } catch (error) {
            console.error('Erro na busca:', error);
            resultsDiv.innerHTML = '<p style="color: #e74c3c">❌ Erro na comunicação</p>';
        }
    }

    displaySearchResults(searchResults) {
        const resultsDiv = document.getElementById('search-results');
        
        if (!searchResults.results || searchResults.results.length === 0) {
            resultsDiv.innerHTML = '<p>ℹ️ Nenhum resultado encontrado</p>';
            return;
        }

        let content = `
            <div style="margin: 15px 0;">
                <p><strong>Query:</strong> ${searchResults.query}</p>
                <p><strong>Fontes pesquisadas:</strong> ${searchResults.sources_searched}</p>
                <p><strong>Resultados encontrados:</strong> ${searchResults.results.length}</p>
            </div>
        `;

        searchResults.results.forEach(result => {
            content += `
                <div class="search-result-item">
                    <h6>${result.title}</h6>
                    <p>${result.snippet}</p>
                    <p><small>
                        <strong>Fonte:</strong> ${result.source} | 
                        <strong>Score:</strong> ${Math.round(result.educational_score * 100)}%
                        ${result.url !== 'https://example.com' ? ` | <a href="${result.url}" target="_blank">🔗 Abrir</a>` : ''}
                    </small></p>
                </div>
            `;
        });

        resultsDiv.innerHTML = content;
    }

    // Método para instalar dependências Python
    async showInstallationGuide() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 80%; max-height: 80%; overflow-y: auto;">
                <h3>🐍 Instalação dos Componentes Python</h3>
                <p>Para usar as funcionalidades Python avançadas, execute os comandos abaixo:</p>
                
                <h4>1. Instalação Básica (Obrigatória)</h4>
                <code style="background: #f8f9fa; padding: 10px; display: block; margin: 10px 0;">
                    pip install flask flask-cors requests aiohttp
                </code>
                
                <h4>2. Análise de Dados (Recomendada)</h4>
                <code style="background: #f8f9fa; padding: 10px; display: block; margin: 10px 0;">
                    pip install pandas numpy
                </code>
                
                <h4>3. Processamento de Arquivos (Recomendada)</h4>
                <code style="background: #f8f9fa; padding: 10px; display: block; margin: 10px 0;">
                    pip install PyPDF2 pymupdf Pillow pytesseract
                </code>
                
                <h4>4. Iniciar Servidor Python</h4>
                <code style="background: #f8f9fa; padding: 10px; display: block; margin: 10px 0;">
                    cd python<br>
                    python darcy_api_bridge.py
                </code>
                
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Fechar
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }
}

// Inicializar integração Python
const darcyPython = new DarcyPythonIntegration();

// Tornar disponível globalmente
window.darcyPython = darcyPython;
