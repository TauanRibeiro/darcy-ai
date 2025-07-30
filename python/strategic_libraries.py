# Darcy AI - Strategic Open Source Libraries
# Bibliotecas open source selecionadas para funcionalidades específicas

import json
from pathlib import Path
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class OpenSourceLibraryManager:
    """
    Gerenciador inteligente de bibliotecas open source
    Integra apenas onde há vantagem real sobre implementação própria
    """
    
    def __init__(self):
        self.available_libraries = self.load_library_catalog()
        self.installed_libraries = {}
        self.integration_points = {}
        
    def load_library_catalog(self) -> Dict:
        """Catálogo de bibliotecas estratégicas para educação"""
        return {
            # PROCESSAMENTO DE DOCUMENTOS
            "pypdf": {
                "purpose": "Manipulação avançada de PDFs",  
                "github": "https://github.com/py-pdf/pypdf",
                "license": "BSD",
                "use_case": "Extrair, mesclar, dividir PDFs educacionais",
                "advantage": "JavaScript não consegue processar PDFs nativamente",
                "install": "pip install pypdf",
                "python_only": True,
                "priority": "high"
            },
            
            "python-docx": {
                "purpose": "Leitura e criação de documentos Word",
                "github": "https://github.com/python-openxml/python-docx", 
                "license": "MIT",
                "use_case": "Processar materiais didáticos em DOCX",
                "advantage": "Acesso completo à estrutura de documentos",
                "install": "pip install python-docx",
                "python_only": True,
                "priority": "medium"
            },
            
            # ÁUDIO E TRANSCRIÇÃO (Alternativas abertas ao ElevenLabs)
            "speechrecognition": {
                "purpose": "Reconhecimento de voz offline",
                "github": "https://github.com/Uberi/speech_recognition",
                "license": "BSD",
                "use_case": "Transcrever áudio de aulas, ditados",
                "advantage": "Funciona offline, privacidade total",
                "install": "pip install SpeechRecognition",
                "alternatives": ["whisper-cpp", "vosk"],
                "python_only": True,
                "priority": "high"
            },
            
            "pyttsx3": {
                "purpose": "Text-to-Speech offline", 
                "github": "https://github.com/nateshmbhat/pyttsx3",
                "license": "MPL-2.0",
                "use_case": "Leitura de textos para acessibilidade",
                "advantage": "Gratuito, offline, sem APIs",
                "install": "pip install pyttsx3",
                "python_only": True,
                "priority": "medium"
            },
            
            # ANÁLISE DE DADOS EDUCACIONAIS
            "plotly": {
                "purpose": "Gráficos interativos educacionais",
                "github": "https://github.com/plotly/plotly.py",
                "license": "MIT", 
                "use_case": "Visualizar progresso do aluno, estatísticas",
                "advantage": "Gráficos mais avançados que Chart.js",
                "install": "pip install plotly",
                "python_only": False,
                "javascript_alternative": "plotly.js",
                "priority": "low" # JS pode fazer isso
            },
            
            # WEB SCRAPING EDUCACIONAL
            "newspaper3k": {
                "purpose": "Extração inteligente de artigos",
                "github": "https://github.com/codelucas/newspaper",
                "license": "MIT",
                "use_case": "Coletar artigos educacionais automaticamente",
                "advantage": "Bypassa CORS, análise de conteúdo",
                "install": "pip install newspaper3k",
                "python_only": True,
                "priority": "high"
            },
            
            "requests-html": {
                "purpose": "Web scraping com JavaScript rendering",
                "github": "https://github.com/psf/requests-html",
                "license": "MIT",
                "use_case": "Scraping de sites educacionais dinâmicos",
                "advantage": "Executa JavaScript, contorna limitações",
                "install": "pip install requests-html",
                "python_only": True,
                "priority": "medium"
            },
            
            # PROCESSAMENTO DE IMAGENS EDUCACIONAIS
            "easyocr": {
                "purpose": "OCR simples e eficiente",
                "github": "https://github.com/JaidedAI/EasyOCR",
                "license": "Apache-2.0",
                "use_case": "Ler texto em exercícios, lousa, livros",
                "advantage": "Melhor precisão que Tesseract",
                "install": "pip install easyocr",
                "python_only": True,
                "priority": "high"
            },
            
            # MANIPULAÇÃO DE DADOS
            "openpyxl": {
                "purpose": "Leitura/escrita de planilhas Excel",
                "github": "https://github.com/theorchard/openpyxl",
                "license": "MIT",
                "use_case": "Processar notas, cadastros de alunos",
                "advantage": "JavaScript limitado com Excel",
                "install": "pip install openpyxl",
                "python_only": True,
                "priority": "medium"
            },
            
            # GERAÇÃO DE CONTEÚDO EDUCACIONAL
            "qrcode": {
                "purpose": "Geração de QR codes",
                "github": "https://github.com/lincolnloop/python-qrcode",
                "license": "BSD",
                "use_case": "QR codes para atividades, links",
                "advantage": "Geração mais robusta",
                "install": "pip install qrcode[pil]",  
                "python_only": False,
                "javascript_alternative": "qrcode.js",
                "priority": "low"
            },
            
            # ANÁLISE DE TEXTO EDUCACIONAL
            "textstat": {
                "purpose": "Análise de legibilidade de textos",
                "github": "https://github.com/shivam5992/textstat",
                "license": "MIT",
                "use_case": "Avaliar nível de dificuldade de textos",
                "advantage": "Algoritmos específicos para educação",
                "install": "pip install textstat",
                "python_only": True,
                "priority": "high"
            },
            
            # MATEMÁTICA E CIÊNCIAS
            "sympy": {
                "purpose": "Matemática simbólica",
                "github": "https://github.com/sympy/sympy",
                "license": "BSD",
                "use_case": "Resolver equações, cálculos simbólicos",
                "advantage": "Capacidades matemáticas avançadas",
                "install": "pip install sympy",
                "python_only": True,
                "priority": "high"
            },
            
            # INTEGRAÇÃO COM GOOGLE CLASSROOM (Open Source)
            "google-api-python-client": {
                "purpose": "Integração com Google Workspace",
                "github": "https://github.com/googleapis/google-api-python-client",
                "license": "Apache-2.0",
                "use_case": "Integrar com Google Classroom",
                "advantage": "Automação de tarefas educacionais",
                "install": "pip install google-api-python-client",
                "python_only": True,
                "priority": "medium"
            },
            
            # PROCESSAMENTO DE VÍDEO EDUCACIONAL
            "moviepy": {
                "purpose": "Edição e processamento de vídeo",
                "github": "https://github.com/Zulko/moviepy",
                "license": "MIT",
                "use_case": "Cortar, editar vídeos educacionais",
                "advantage": "JavaScript não processa vídeo nativamente",
                "install": "pip install moviepy",
                "python_only": True,
                "priority": "medium"
            }
        }
    
    def get_strategic_recommendations(self, context: Dict) -> List[Dict]:
        """Recomenda bibliotecas baseado no contexto de uso"""
        recommendations = []
        
        # Analisar contexto e necessidades
        needs = self.analyze_needs(context)
        
        for library_name, library_info in self.available_libraries.items():
            # Apenas recomendar se há real vantagem Python
            if library_info.get('python_only', False) and library_info['priority'] == 'high':
                if self.matches_needs(library_info, needs):
                    recommendations.append({
                        'name': library_name,
                        'purpose': library_info['purpose'],
                        'use_case': library_info['use_case'],
                        'advantage': library_info['advantage'],
                        'install': library_info['install'],
                        'github': library_info['github'],
                        'priority': library_info['priority']
                    })
        
        return sorted(recommendations, key=lambda x: {'high': 3, 'medium': 2, 'low': 1}[x['priority']], reverse=True)
    
    def analyze_needs(self, context: Dict) -> List[str]:
        """Analisa contexto para identificar necessidades"""
        needs = []
        
        query = context.get('query', '').lower()
        files = context.get('files', [])
        features = context.get('requested_features', [])
        
        # Análise baseada em query
        if any(word in query for word in ['pdf', 'documento', 'arquivo']):
            needs.append('document_processing')
            
        if any(word in query for word in ['áudio', 'voz', 'falar', 'ouvir']):
            needs.append('audio_processing')
            
        if any(word in query for word in ['imagem', 'foto', 'desenho', 'figura']):
            needs.append('image_processing')
            
        if any(word in query for word in ['matemática', 'equação', 'cálculo']):
            needs.append('mathematics')
            
        if any(word in query for word in ['pesquisar', 'buscar', 'internet']):
            needs.append('web_scraping')
            
        if any(word in query for word in ['análise', 'estatística', 'dados']):
            needs.append('data_analysis')
        
        # Análise baseada em arquivos
        for file in files:
            ext = Path(file).suffix.lower()
            if ext in ['.pdf', '.docx', '.doc']:
                needs.append('document_processing')
            elif ext in ['.jpg', '.png', '.jpeg', '.bmp']:
                needs.append('image_processing')
            elif ext in ['.mp3', '.wav', '.m4a']:
                needs.append('audio_processing')
            elif ext in ['.xlsx', '.csv']:
                needs.append('data_analysis')
        
        return list(set(needs))
    
    def matches_needs(self, library_info: Dict, needs: List[str]) -> bool:
        """Verifica se biblioteca atende às necessidades"""
        library_capabilities = {
            'pypdf': ['document_processing'],
            'python-docx': ['document_processing'],
            'speechrecognition': ['audio_processing'],
            'pyttsx3': ['audio_processing'],
            'newspaper3k': ['web_scraping'],
            'requests-html': ['web_scraping'],
            'easyocr': ['image_processing'],
            'openpyxl': ['data_analysis'],
            'textstat': ['document_processing', 'data_analysis'],
            'sympy': ['mathematics'],
            'moviepy': ['video_processing']
        }
        
        lib_name = None
        for name, info in self.available_libraries.items():
            if info == library_info:
                lib_name = name
                break
        
        if lib_name and lib_name in library_capabilities:
            return bool(set(library_capabilities[lib_name]) & set(needs))
        
        return False
        
    def generate_installation_script(self, selected_libraries: List[str]) -> str:
        """Gera script de instalação para bibliotecas selecionadas"""
        script_lines = [
            "#!/bin/bash",
            "# Darcy AI - Instalação Seletiva de Bibliotecas",
            "# Instala apenas bibliotecas necessárias para funcionalidades específicas",
            "",
            "echo '🐍 Instalando bibliotecas Python estratégicas para Darcy AI...'",
            ""
        ]
        
        for lib_name in selected_libraries:
            if lib_name in self.available_libraries:
                lib_info = self.available_libraries[lib_name]
                script_lines.extend([
                    f"echo '📦 Instalando {lib_name} - {lib_info['purpose']}...'",
                    f"{lib_info['install']}",
                    f"echo '✅ {lib_name} instalado com sucesso'",
                    ""
                ])
        
        script_lines.extend([
            "echo '🎉 Instalação concluída!'",
            "echo '💡 Use apenas as funcionalidades que precisar para manter o sistema leve'"
        ])
        
        return "\n".join(script_lines)
    
    def get_usage_examples(self, library_name: str) -> Dict:
        """Fornece exemplos de uso educacional para cada biblioteca"""
        examples = {
            'pypdf': {
                'basic_usage': """
# Extrair texto de PDF educacional
import pypdf
with open('livro_didatico.pdf', 'rb') as file:
    reader = pypdf.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    # Usar texto com Darcy AI
""",
                'educational_scenario': "Processar apostila enviada pelo professor"
            },
            
            'speechrecognition': {
                'basic_usage': """
# Transcrever áudio de aula
import speech_recognition as sr
r = sr.Recognizer()
with sr.AudioFile('aula.wav') as source:
    audio = r.record(source)
    text = r.recognize_google(audio, language='pt-BR')
    # Enviar transcrição para Darcy AI
""",
                'educational_scenario': "Transcrever gravação de aula para estudo"
            },
            
            'easyocr': {
                'basic_usage': """
# Ler texto em exercício fotografado
import easyocr
reader = easyocr.Reader(['pt', 'en'])
result = reader.readtext('exercicio_foto.jpg')
text = ' '.join([item[1] for item in result])
# Usar texto extraído com Darcy AI
""",
                'educational_scenario': "Fotografar exercício do livro e pedir explicação"
            }
        }
        
        return examples.get(library_name, {})

# Instância global para usar no sistema
library_manager = OpenSourceLibraryManager()

def get_strategic_libraries_for_context(context: Dict) -> List[Dict]:
    """Função principal para obter bibliotecas estratégicas"""
    return library_manager.get_strategic_recommendations(context)

def should_use_python_for_task(task: str, context: Dict) -> bool:
    """Decide se Python deve ser usado para uma tarefa específica"""
    python_advantages = {
        'pdf_processing': True,      # JS não consegue
        'audio_transcription': True, # JS limitado
        'ocr_processing': True,      # JS não tem OCR nativo
        'advanced_math': True,       # SymPy é superior
        'web_scraping': True,        # Bypass CORS
        'data_analysis': True,       # pandas/numpy
        'document_generation': True, # Melhor controle
        'chart_generation': False,   # JS faz bem
        'basic_chat': False,         # JS é suficiente
        'ui_interactions': False     # JS nativo
    }
    
    return python_advantages.get(task, False)
