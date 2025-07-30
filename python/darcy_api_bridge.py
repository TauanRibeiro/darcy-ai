# Darcy AI - API Bridge
# Ponte de comunicação entre componentes Python e sistema JavaScript

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import asyncio
import json
import os
import tempfile
from pathlib import Path
import logging
from datetime import datetime

from darcy_python_core import (
    DarcyPythonCore, 
    DarcyDataAnalyzer, 
    DarcyFileProcessor, 
    DarcyMLEnhancer, 
    DarcyWebScraper
)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Permitir requests do frontend JavaScript

# Instância global dos componentes
core = None
components = {}

async def initialize_components():
    """Inicializa componentes Python"""
    global core, components
    
    core = DarcyPythonCore()
    await core.initialize()
    
    components = {
        'analyzer': DarcyDataAnalyzer(core),
        'processor': DarcyFileProcessor(core),
        'enhancer': DarcyMLEnhancer(core),
        'scraper': DarcyWebScraper(core)
    }
    
    logger.info("🐍 Componentes Python inicializados")

@app.route('/api/python/health', methods=['GET'])
def health_check():
    """Verificação de saúde da API Python"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "core": core is not None,
            "analyzer": "analyzer" in components,
            "processor": "processor" in components,
            "enhancer": "enhancer" in components,
            "scraper": "scraper" in components
        },
        "llm_providers": core.llm_providers if core else {}
    })

@app.route('/api/python/analyze-interactions', methods=['POST'])
def analyze_interactions():
    """Analisa padrões de interação do usuário"""
    try:
        data = request.get_json()
        interactions = data.get('interactions', [])
        
        if not interactions:
            return jsonify({"error": "Nenhuma interação fornecida"}), 400
        
        analyzer = components.get('analyzer')
        if not analyzer:
            return jsonify({"error": "Analisador não inicializado"}), 500
            
        result = analyzer.analyze_learning_patterns(interactions)
        
        return jsonify({
            "success": True,
            "analysis": result,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erro na análise: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/python/process-file', methods=['POST'])
def process_file():
    """Processa arquivos enviados pelo usuário"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "Nenhum arquivo enviado"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Nome de arquivo inválido"}), 400
        
        # Salvar arquivo temporariamente
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, file.filename)
        file.save(file_path)
        
        processor = components.get('processor')
        if not processor:
            return jsonify({"error": "Processador não inicializado"}), 500
        
        # Determinar tipo de arquivo e processar
        file_ext = Path(file.filename).suffix.lower()
        
        if file_ext == '.pdf':
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(processor.process_pdf(file_path))
            loop.close()
        elif file_ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(processor.process_image(file_path))
            loop.close()
        else:
            result = {"error": f"Tipo de arquivo não suportado: {file_ext}"}
        
        # Limpar arquivo temporário
        try:
            os.remove(file_path)
            os.rmdir(temp_dir)
        except:
            pass
            
        return jsonify({
            "success": True,
            "result": result,
            "filename": file.filename,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erro no processamento: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/python/enhance-response', methods=['POST'])
def enhance_response():
    """Melhora qualidade de resposta usando ML"""
    try:
        data = request.get_json()
        response = data.get('response', '')
        context = data.get('context', {})
        
        if not response:
            return jsonify({"error": "Resposta não fornecida"}), 400
        
        enhancer = components.get('enhancer')
        if not enhancer:
            return jsonify({"error": "Melhorador não inicializado"}), 500
            
        result = enhancer.enhance_response_quality(response, context)
        
        return jsonify({
            "success": True,
            "enhancement": result,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erro na melhoria: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/python/search-educational', methods=['POST'])
def search_educational():
    """Busca conteúdo educacional na web"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        sources = data.get('sources', None)
        
        if not query:
            return jsonify({"error": "Query não fornecida"}), 400
        
        scraper = components.get('scraper')
        if not scraper:
            return jsonify({"error": "Scraper não inicializado"}), 500
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(scraper.search_educational_content(query, sources))
        loop.close()
        
        return jsonify({
            "success": True,
            "search_results": result,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erro na busca: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/python/capabilities', methods=['GET'])
def get_capabilities():
    """Retorna capacidades disponíveis dos componentes Python"""
    return jsonify({
        "data_analysis": {
            "learning_patterns": "Analisa padrões de aprendizado do usuário",
            "topic_analysis": "Identifica tópicos mais consultados",
            "crew_preferences": "Analisa preferências de equipes",
            "recommendations": "Gera recomendações personalizadas"
        },
        "file_processing": {
            "pdf_processing": "Extrai texto e metadados de PDFs",
            "image_ocr": "Reconhecimento de texto em imagens",
            "educational_content_analysis": "Analisa conteúdo educacional",
            "reading_level_assessment": "Avalia nível de leitura"
        },
        "ml_enhancement": {
            "response_quality": "Avalia qualidade das respostas",
            "clarity_assessment": "Analisa clareza do texto",
            "completeness_check": "Verifica completude das respostas",
            "improvement_suggestions": "Sugere melhorias"
        },
        "web_scraping": {
            "educational_search": "Busca conteúdo educacional",
            "real_time_information": "Informações atualizadas",
            "source_verification": "Verifica confiabilidade das fontes"
        },
        "requirements": {
            "basic": ["flask", "flask-cors", "requests", "pathlib"],
            "advanced": ["pandas", "numpy", "PyPDF2", "pymupdf", "Pillow", "pytesseract"],
            "optional": ["scikit-learn", "nltk", "beautifulsoup4", "selenium"]
        }
    })

@app.route('/api/python/install-requirements', methods=['POST'])
def install_requirements():
    """Fornece comandos para instalar dependências"""
    data = request.get_json()
    level = data.get('level', 'basic')  # basic, advanced, optional
    
    commands = {
        "basic": [
            "pip install flask flask-cors requests pathlib2"
        ],
        "advanced": [
            "pip install pandas numpy",
            "pip install PyPDF2 pymupdf", 
            "pip install Pillow pytesseract"
        ],
        "optional": [
            "pip install scikit-learn nltk",
            "pip install beautifulsoup4 selenium",
            "pip install aiohttp asyncio"
        ]
    }
    
    instructions = {
        "windows": {
            "tesseract": "Baixe o Tesseract do GitHub e adicione ao PATH",
            "system_packages": "Algumas funcionalidades podem precisar de bibliotecas do sistema"
        },
        "linux": {
            "tesseract": "sudo apt-get install tesseract-ocr tesseract-ocr-por",
            "system_packages": "sudo apt-get install python3-dev build-essential"
        }
    }
    
    return jsonify({
        "level": level,
        "pip_commands": commands.get(level, commands["basic"]),
        "system_instructions": instructions,
        "note": "Execute os comandos em ordem. Algumas funcionalidades são opcionais.",
        "test_import": f"python -c \"from darcy_python_core import DarcyPythonCore; print('✅ Importação bem-sucedida')\""
    })

# Middleware para logging
@app.before_request
def log_request():
    logger.info(f"📨 {request.method} {request.endpoint}")

@app.after_request
def log_response(response):
    logger.info(f"📤 {response.status_code}")
    return response

if __name__ == '__main__':
    # Inicializar componentes
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(initialize_components())
    
    print("🚀 Darcy AI Python API rodando em http://localhost:5000")
    print("📋 Endpoints disponíveis:")
    print("  - GET  /api/python/health")
    print("  - POST /api/python/analyze-interactions")
    print("  - POST /api/python/process-file")
    print("  - POST /api/python/enhance-response") 
    print("  - POST /api/python/search-educational")
    print("  - GET  /api/python/capabilities")
    print("  - POST /api/python/install-requirements")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
