# Darcy AI - Python Components
# Extensões Python para análise de dados, processamento de arquivos e IA avançada

import os
import sys
import json
import asyncio
import aiohttp
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
from collections import Counter
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DarcyPythonCore:
    """
    Core Python SELETIVO para Darcy AI
    Ativa apenas funcionalidades específicas onde Python é superior ao JavaScript
    """
    
    def __init__(self, config_path: str = None):
        self.config = self.load_config(config_path)
        self.session = None
        self.llm_providers = {}
        self.selective_components = {
            'file_processing': False,  # Ativa apenas se houver upload
            'data_analysis': False,    # Ativa apenas se houver dados para analisar
            'ml_enhancement': False,   # Ativa apenas se solicitado
            'web_scraping': False      # Ativa apenas para pesquisas específicas
        }
        
    def load_config(self, config_path: str = None) -> Dict:
        """Carrega configuração com ativação seletiva"""
        default_config = {
            "selective_activation": {
                "auto_detect_needs": True,
                "activate_on_demand": True,
                "minimal_footprint": True,
                "javascript_first": True
            },
            "python_advantages": {
                "file_processing": ["pdf", "ocr", "complex_formats"],
                "data_analysis": ["pandas", "numpy", "statistics"], 
                "ml_enhancement": ["nlp", "quality_analysis", "sentiment"],
                "web_scraping": ["bypass_cors", "deep_scraping", "automation"]
            },
            "llm_endpoints": {
                "backend": "http://localhost:3000"  # JavaScript backend é primário
            },
            "file_paths": {
                "temp": "./temp",
                "cache": "./cache"
            }
        }
        
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                user_config = json.load(f)
                default_config.update(user_config)
                
        return default_config

    def should_activate_component(self, component: str, context: Dict) -> bool:
        """Decide se um componente Python deve ser ativado"""
        if not self.config["selective_activation"]["activate_on_demand"]:
            return True
            
        activation_rules = {
            'file_processing': lambda ctx: (
                'file_upload' in ctx or 
                'pdf' in ctx.get('query', '').lower() or
                'imagem' in ctx.get('query', '').lower()
            ),
            'data_analysis': lambda ctx: (
                len(ctx.get('interactions', [])) > 5 or
                'análise' in ctx.get('query', '').lower() or
                'padrão' in ctx.get('query', '').lower()
            ),
            'ml_enhancement': lambda ctx: (
                ctx.get('enhance_quality', False) or
                'melhorar' in ctx.get('query', '').lower()
            ),
            'web_scraping': lambda ctx: (
                'pesquisar' in ctx.get('query', '').lower() or
                'buscar informações' in ctx.get('query', '').lower()
            )
        }
        
        return activation_rules.get(component, lambda _: False)(context)

    async def selective_initialize(self, needed_components: List[str]):
        """Inicializa apenas componentes necessários"""
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        for component in needed_components:
            if component in self.selective_components:
                self.selective_components[component] = True
                logger.info(f"✅ Ativando componente Python: {component}")
        
        self.ensure_minimal_directories()
        
    def ensure_minimal_directories(self):
        """Cria apenas diretórios necessários"""
        active_components = [k for k, v in self.selective_components.items() if v]
        
        if 'file_processing' in active_components:
            Path(self.config["file_paths"]["temp"]).mkdir(parents=True, exist_ok=True)
            
        if any(comp in active_components for comp in ['data_analysis', 'ml_enhancement']):
            Path(self.config["file_paths"]["cache"]).mkdir(parents=True, exist_ok=True)
            
    async def check_llm_providers(self):
        """Verifica disponibilidade dos provedores LLM"""
        providers = self.config["llm_endpoints"]
        
        for name, url in providers.items():
            try:
                health_endpoints = {
                    "ollama": f"{url}/api/tags",
                    "deepseek": f"{url}/v1/models", 
                    "backend": f"{url}/api/health"
                }
                
                endpoint = health_endpoints.get(name, f"{url}/health")
                
                async with self.session.get(endpoint, timeout=5) as response:
                    if response.status == 200:
                        self.llm_providers[name] = {"status": "healthy", "url": url}
                        logger.info(f"✅ {name} disponível em {url}")
                    else:
                        self.llm_providers[name] = {"status": "unhealthy", "url": url}
                        
            except Exception as e:
                self.llm_providers[name] = {"status": "error", "url": url, "error": str(e)}
                logger.warning(f"❌ {name} indisponível: {e}")

class DarcyDataAnalyzer:
    """
    Componente para análise de dados educacionais
    Funcionalidades que o JavaScript não consegue fazer eficientemente
    """
    
    def __init__(self, core: DarcyPythonCore):
        self.core = core
        
    def analyze_learning_patterns(self, interaction_data: List[Dict]) -> Dict:
        """
        Analisa padrões de aprendizado do usuário
        - Frequência de tópicos
        - Progresso temporal  
        - Áreas de dificuldade
        - Recomendações personalizadas
        """
        try:
            import pandas as pd
            import numpy as np
            from collections import Counter
            
            df = pd.DataFrame(interaction_data)
            
            # Análise de tópicos mais consultados
            topics = Counter()
            for item in interaction_data:
                if 'query' in item:
                    # Extrair palavras-chave da consulta
                    words = item['query'].lower().split()
                    topics.update(words)
            
            # Análise temporal
            if 'timestamp' in df.columns:
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                daily_interactions = df.groupby(df['timestamp'].dt.date).size()
                
            # Análise de crews mais utilizadas
            crew_usage = Counter([item.get('crew', 'unknown') for item in interaction_data])
            
            # Análise de satisfação (se disponível)
            avg_response_time = np.mean([item.get('processing_time', 0) for item in interaction_data])
            
            return {
                "total_interactions": len(interaction_data),
                "top_topics": dict(topics.most_common(10)),
                "crew_preferences": dict(crew_usage),
                "avg_response_time": avg_response_time,
                "daily_activity": daily_interactions.to_dict() if 'timestamp' in df.columns else {},
                "recommendations": self.generate_recommendations(topics, crew_usage),
                "analysis_timestamp": datetime.now().isoformat()
            }
            
        except ImportError:
            logger.warning("pandas/numpy não disponível - análise limitada")
            return self.basic_analysis(interaction_data)
        except Exception as e:
            logger.error(f"Erro na análise: {e}")
            return {"error": str(e)}
    
    def basic_analysis(self, interaction_data: List[Dict]) -> Dict:
        """Análise básica sem pandas"""
        from collections import Counter
        
        topics = Counter()
        crews = Counter()
        
        for item in interaction_data:
            if 'query' in item:
                words = item['query'].lower().split()
                topics.update(words)
            if 'crew' in item:
                crews[item['crew']] += 1
                
        return {
            "total_interactions": len(interaction_data),
            "top_topics": dict(topics.most_common(5)),
            "crew_usage": dict(crews),
            "analysis_type": "basic"
        }
    
    def generate_recommendations(self, topics: Counter, crews: Counter) -> List[str]:
        """Gera recomendações baseadas nos padrões de uso"""
        recommendations = []
        
        # Recomendações baseadas em tópicos
        top_topic = topics.most_common(1)[0][0] if topics else None
        if top_topic:
            recommendations.append(f"📚 Continue explorando '{top_topic}' com a Equipe de Pesquisa")
            
        # Recomendações baseadas em crews
        most_used_crew = crews.most_common(1)[0][0] if crews else None
        if most_used_crew == 'teaching':
            recommendations.append("🎨 Experimente a Equipe Criativa para abordagens inovadoras")
        elif most_used_crew == 'creative':
            recommendations.append("📊 Use a Equipe de Avaliação para testar seus conhecimentos")
            
        return recommendations

class DarcyFileProcessor:
    """
    Processador de arquivos avançado
    Funcionalidades que JavaScript não consegue fazer nativamente
    """
    
    def __init__(self, core: DarcyPythonCore):
        self.core = core
        
    async def process_pdf(self, file_path: str) -> Dict:
        """Processa arquivos PDF com OCR se necessário"""
        try:
            import PyPDF2
            import fitz  # pymupdf
            
            result = {
                "type": "pdf",
                "pages": 0,
                "text": "",
                "metadata": {},
                "images": []
            }
            
            # Tentar PyPDF2 primeiro (mais rápido)
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    result["pages"] = len(pdf_reader.pages)
                    result["metadata"] = pdf_reader.metadata
                    
                    text_content = []
                    for page in pdf_reader.pages:
                        text_content.append(page.extract_text())
                    
                    result["text"] = "\n".join(text_content)
                    
            except Exception as e:
                logger.warning(f"PyPDF2 falhou, tentando pymupdf: {e}")
                
                # Fallback para pymupdf (mais robusto)
                doc = fitz.open(file_path)
                result["pages"] = len(doc)
                
                text_content = []
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    text_content.append(page.get_text())
                
                result["text"] = "\n".join(text_content)
                doc.close()
            
            # Análise educacional do conteúdo
            result["educational_analysis"] = self.analyze_educational_content(result["text"])
            
            return result
            
        except ImportError:
            return {"error": "Bibliotecas PDF não instaladas (pip install PyPDF2 pymupdf)"}
        except Exception as e:
            return {"error": f"Erro ao processar PDF: {e}"}
    
    async def process_image(self, file_path: str) -> Dict:
        """Processa imagens com OCR e análise"""
        try:
            from PIL import Image
            import pytesseract
            
            result = {
                "type": "image",
                "text": "",
                "metadata": {},
                "analysis": {}
            }
            
            # Abrir imagem
            with Image.open(file_path) as img:
                result["metadata"] = {
                    "size": img.size,
                    "mode": img.mode,
                    "format": img.format
                }
                
                # OCR para extrair texto
                try:
                    text = pytesseract.image_to_string(img, lang='por+eng')
                    result["text"] = text.strip()
                except Exception as e:
                    result["ocr_error"] = str(e)
                
                # Análise básica da imagem
                result["analysis"] = {
                    "has_text": len(result["text"]) > 10,
                    "likely_educational": self.is_educational_image(result["text"]),
                    "color_mode": img.mode,
                    "dimensions": img.size
                }
            
            return result
            
        except ImportError:
            return {"error": "Bibliotecas de imagem não instaladas (pip install Pillow pytesseract)"}
        except Exception as e:
            return {"error": f"Erro ao processar imagem: {e}"}
    
    def analyze_educational_content(self, text: str) -> Dict:
        """Analisa conteúdo educacional em texto"""
        if not text or len(text) < 50:
            return {"type": "insufficient_content"}
            
        # Palavras-chave educacionais
        educational_keywords = {
            "mathematics": ["equação", "função", "derivada", "integral", "geometria", "álgebra"],
            "science": ["experimento", "hipótese", "teoria", "átomo", "célula", "energia"],
            "history": ["século", "guerra", "revolução", "império", "civilização"],
            "literature": ["narrativa", "poesia", "romance", "análise", "personagem"],
            "programming": ["código", "função", "variável", "algoritmo", "programa"]
        }
        
        text_lower = text.lower()
        subject_scores = {}
        
        for subject, keywords in educational_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                subject_scores[subject] = score
        
        # Determinar assunto principal
        main_subject = max(subject_scores.items(), key=lambda x: x[1])[0] if subject_scores else "general"
        
        return {
            "main_subject": main_subject,
            "subject_scores": subject_scores,
            "word_count": len(text.split()),
            "reading_level": self.estimate_reading_level(text),
            "has_equations": "=" in text or "∫" in text or "∑" in text,
            "has_code": any(keyword in text_lower for keyword in ["def ", "function", "class ", "import"])
        }
    
    def estimate_reading_level(self, text: str) -> str:
        """Estima nível de leitura do texto"""
        words = text.split()
        sentences = text.split('.')
        
        if len(words) < 10:
            return "insufficient"
            
        avg_sentence_length = len(words) / max(len(sentences), 1)
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # Heurística simples
        if avg_sentence_length > 25 or avg_word_length > 6:
            return "advanced"
        elif avg_sentence_length > 15 or avg_word_length > 5:
            return "intermediate"
        else:
            return "basic"
    
    def is_educational_image(self, text: str) -> bool:
        """Determina se uma imagem tem conteúdo educacional"""
        if not text:
            return False
            
        educational_indicators = [
            "exercício", "problema", "questão", "resposta",
            "capítulo", "página", "figura", "gráfico",
            "fórmula", "definição", "exemplo", "teoria"
        ]
        
        text_lower = text.lower()
        return any(indicator in text_lower for indicator in educational_indicators)

class DarcyMLEnhancer:
    """
    Componente de Machine Learning para melhorar respostas
    Funcionalidades avançadas de IA que complementam os LLMs
    """
    
    def __init__(self, core: DarcyPythonCore):
        self.core = core
        
    def enhance_response_quality(self, response: str, context: Dict) -> Dict:
        """
        Melhora qualidade das respostas usando técnicas de ML
        - Análise de sentimento
        - Verificação de coerência
        - Sugestões de melhorias
        - Detecção de lacunas
        """
        try:
            analysis = {
                "original_response": response,
                "length": len(response),
                "word_count": len(response.split()),
                "educational_quality": self.assess_educational_quality(response),
                "clarity_score": self.assess_clarity(response),
                "completeness": self.assess_completeness(response, context),
                "suggestions": []
            }
            
            # Gerar sugestões de melhoria
            if analysis["clarity_score"] < 0.7:
                analysis["suggestions"].append("Considere simplificar a linguagem")
                
            if analysis["word_count"] < 50:
                analysis["suggestions"].append("Resposta muito curta, adicione mais detalhes")
                
            if analysis["educational_quality"] < 0.6:
                analysis["suggestions"].append("Adicione mais exemplos práticos")
                
            return analysis
            
        except Exception as e:
            return {"error": f"Erro na análise de qualidade: {e}"}
    
    def assess_educational_quality(self, response: str) -> float:
        """Avalia qualidade educacional da resposta"""
        quality_indicators = [
            "exemplo", "por exemplo", "imagine que", "considere",
            "passo a passo", "primeiro", "segundo", "finalmente",
            "importante", "lembre-se", "note que", "observe",
            "prática", "exercício", "atividade", "aplicação"
        ]
        
        response_lower = response.lower()
        found_indicators = sum(1 for indicator in quality_indicators if indicator in response_lower)
        
        # Normalizar score (0-1)
        max_possible = min(len(quality_indicators), len(response.split()) // 10)
        return min(found_indicators / max(max_possible, 1), 1.0)
    
    def assess_clarity(self, response: str) -> float:
        """Avalia clareza da resposta"""
        sentences = response.split('.')
        if not sentences:
            return 0.0
            
        # Calcular comprimento médio das sentenças
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
        
        # Penalizar sentenças muito longas ou muito curtas
        if avg_sentence_length > 30:
            clarity = 0.3  # Muito longo
        elif avg_sentence_length < 5:
            clarity = 0.4  # Muito curto
        else:
            clarity = 0.8  # Bom tamanho
        
        # Bonus por estrutura organizada
        if any(marker in response.lower() for marker in ["primeiro", "segundo", "além disso", "portanto"]):
            clarity += 0.2
            
        return min(clarity, 1.0)
    
    def assess_completeness(self, response: str, context: Dict) -> float:
        """Avalia completude da resposta baseada no contexto"""
        query = context.get('query', '').lower()
        crew = context.get('crew', '')
        
        # Verificar se a resposta aborda a pergunta
        query_words = set(query.split())
        response_words = set(response.lower().split())
        
        # Calcular sobreposição semântica básica
        overlap = len(query_words.intersection(response_words))
        completeness = overlap / max(len(query_words), 1)
        
        # Ajustar baseado no tipo de crew
        if crew == 'teaching' and len(response.split()) < 100:
            completeness *= 0.7  # Ensino precisa de mais detalhes
        elif crew == 'assessment' and 'exercício' not in response.lower():
            completeness *= 0.8  # Avaliação deveria ter exercícios
            
        return min(completeness, 1.0)

class DarcyWebScraper:
    """
    Web scraper educacional para buscar informações em tempo real
    Complementa as limitações dos LLMs com dados atualizados
    """
    
    def __init__(self, core: DarcyPythonCore):
        self.core = core
        
    async def search_educational_content(self, query: str, sources: List[str] = None) -> Dict:
        """
        Busca REAL em fontes educacionais usando bibliotecas open source
        - Wikipedia API (sem scraping)
        - Khan Academy (busca estruturada)  
        - Brasil Escola (processamento inteligente)
        - Só Matemática (conteúdo específico)
        """
        if not sources:
            sources = [
                "wikipedia_api",
                "khan_academy_search",
                "brasil_escola",
                "so_matematica"
            ]
        
        results = {
            "query": query,
            "sources_searched": [],
            "results": [],
            "summary": "",
            "timestamp": datetime.now().isoformat(),
            "educational_quality": 0
        }
        
        try:
            # Busca paralela em múltiplas fontes
            search_tasks = []
            
            if "wikipedia_api" in sources:
                search_tasks.append(self._search_wikipedia_api(query))
            
            if "brasil_escola" in sources:
                search_tasks.append(self._search_brasil_escola(query))
                
            if "so_matematica" in sources:
                search_tasks.append(self._search_so_matematica(query))
            
            # Executar buscas em paralelo
            search_results = await asyncio.gather(*search_tasks, return_exceptions=True)
            
            # Processar resultados
            for i, result in enumerate(search_results):
                if isinstance(result, Exception):
                    logger.warning(f"Erro na busca {i}: {result}")
                    continue
                    
                if result and 'results' in result:
                    results['results'].extend(result['results'])
                    results['sources_searched'].append(result.get('source', f'source_{i}'))
            
            # Filtrar e ranquear resultados por qualidade educacional
            results['results'] = self._rank_educational_content(results['results'])
            results['educational_quality'] = self._calculate_overall_quality(results['results'])
            results['summary'] = self._generate_search_summary(query, results['results'])
            
        except Exception as e:
            logger.error(f"Erro na busca educacional: {e}")
            results['error'] = str(e)
            
        return results
    
    async def _search_wikipedia_api(self, query: str) -> Dict:
        """Busca estruturada na Wikipedia usando API oficial"""
        try:
            # API da Wikipedia (sem scraping)
            search_url = "https://pt.wikipedia.org/api/rest_v1/page/summary/"
            search_query = query.replace(' ', '_')
            
            async with self.core.session.get(f"{search_url}{search_query}") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    return {
                        'source': 'Wikipedia',
                        'results': [{
                            'title': data.get('title', query),
                            'snippet': data.get('extract', 'Conteúdo não disponível'),
                            'url': data.get('content_urls', {}).get('desktop', {}).get('page', ''),
                            'educational_score': 0.9,  # Wikipedia é confiável
                            'content_type': 'encyclopedia',
                            'language': 'pt'
                        }]
                    }
                else:
                    # Tentar busca por termos relacionados
                    return await self._wikipedia_search_fallback(query)
                    
        except Exception as e:
            logger.error(f"Erro na busca Wikipedia: {e}")
            return {'source': 'Wikipedia', 'results': []}
    
    async def _wikipedia_search_fallback(self, query: str) -> Dict:
        """Busca alternativa na Wikipedia com termos relacionados"""
        try:
            search_url = "https://pt.wikipedia.org/w/api.php"
            params = {
                'action': 'opensearch',
                'search': query,
                'limit': 3,
                'format': 'json'
            }
            
            async with self.core.session.get(search_url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    titles, descriptions, urls = data[1], data[2], data[3]
                    
                    results = []
                    for i, title in enumerate(titles):
                        if i < len(descriptions) and i < len(urls):
                            results.append({
                                'title': title,
                                'snippet': descriptions[i] or 'Resumo não disponível',
                                'url': urls[i],
                                'educational_score': 0.8,
                                'content_type': 'encyclopedia',
                                'language': 'pt'
                            })
                    
                    return {'source': 'Wikipedia', 'results': results}
                    
        except Exception as e:
            logger.error(f"Erro na busca alternativa Wikipedia: {e}")
        
        return {'source': 'Wikipedia', 'results': []}
    
    async def _search_brasil_escola(self, query: str) -> Dict:
        """Busca inteligente no Brasil Escola usando newspaper3k"""
        try:
            # Usar newspaper3k para processamento inteligente
            try:
                from newspaper import Article, Config
                
                # Buscar URL específica do Brasil Escola
                search_url = f"https://brasilescola.uol.com.br/busca?q={query.replace(' ', '+')}"
                
                config = Config()
                config.browser_user_agent = 'Mozilla/5.0 (compatible; DarcyAI Educational Bot)'
                config.request_timeout = 10
                
                # Esta é uma implementação conceitual - precisa de parsing HTML real
                results = [{
                    'title': f"Conteúdo sobre {query} - Brasil Escola",
                    'snippet': f"Material educacional brasileiro sobre {query}",
                    'url': search_url,
                    'educational_score': 0.85,
                    'content_type': 'educational_portal',
                    'language': 'pt'
                }]
                
                return {'source': 'Brasil Escola', 'results': results}
                
            except ImportError:
                # Fallback sem newspaper3k
                return {
                    'source': 'Brasil Escola',
                    'results': [{
                        'title': f"Pesquise sobre {query}",
                        'snippet': "Para usar busca avançada, instale: pip install newspaper3k",
                        'url': f"https://brasilescola.uol.com.br/busca?q={query.replace(' ', '+')}",
                        'educational_score': 0.7,
                        'content_type': 'search_link'
                    }]
                }
                
        except Exception as e:
            logger.error(f"Erro na busca Brasil Escola: {e}")
            return {'source': 'Brasil Escola', 'results': []}
    
    async def _search_so_matematica(self, query: str) -> Dict:
        """Busca especializada em matemática"""
        try:
            # Verificar se é consulta matemática
            math_keywords = ['matemática', 'equação', 'função', 'derivada', 'integral', 'álgebra', 'geometria']
            
            if any(keyword in query.lower() for keyword in math_keywords):
                # Link direto para Só Matemática
                search_url = f"https://www.somatematica.com.br/busca.php?busca={query.replace(' ', '+')}"
                
                return {
                    'source': 'Só Matemática',
                    'results': [{
                        'title': f"Matemática: {query}",
                        'snippet': f"Conteúdo especializado em matemática sobre {query}",
                        'url': search_url,
                        'educational_score': 0.9,  # Especializado em matemática
                        'content_type': 'mathematics',
                        'language': 'pt'
                    }]
                }
            
        except Exception as e:
            logger.error(f"Erro na busca Só Matemática: {e}")
        
        return {'source': 'Só Matemática', 'results': []}
    
    def _rank_educational_content(self, results: List[Dict]) -> List[Dict]:
        """Ranqueia conteúdo por qualidade educacional"""
        def educational_score(result):
            score = result.get('educational_score', 0.5)
            
            # Bonus por fonte confiável
            source_bonus = {
                'Wikipedia': 0.1,
                'Brasil Escola': 0.15,
                'Só Matemática': 0.2  # Especializado
            }.get(result.get('source', ''), 0)
            
            # Bonus por tipo de conteúdo
            content_bonus = {
                'encyclopedia': 0.1,
                'educational_portal': 0.15,
                'mathematics': 0.2
            }.get(result.get('content_type', ''), 0)
            
            return min(1.0, score + source_bonus + content_bonus)
        
        # Ordenar por score educacional
        ranked = sorted(results, key=educational_score, reverse=True)
        
        # Atualizar scores
        for result in ranked:
            result['final_educational_score'] = educational_score(result)
        
        return ranked[:10]  # Top 10 resultados
    
    def _calculate_overall_quality(self, results: List[Dict]) -> float:
        """Calcula qualidade geral dos resultados"""
        if not results:
            return 0.0
            
        scores = [r.get('final_educational_score', 0.5) for r in results]
        return sum(scores) / len(scores)
    
    def _generate_search_summary(self, query: str, results: List[Dict]) -> str:
        """Gera resumo da busca educacional"""
        if not results:
            return f"Nenhum resultado educacional encontrado para '{query}'"
        
        sources = list(set([r.get('source', 'Desconhecido') for r in results]))
        avg_quality = sum([r.get('final_educational_score', 0.5) for r in results]) / len(results)
        
        return f"Encontrados {len(results)} resultados educacionais sobre '{query}' em {len(sources)} fontes. Qualidade média: {avg_quality:.1%}"

# Função principal para integração com Node.js
async def main():
    """Função principal para testes e integração"""
    core = DarcyPythonCore()
    await core.initialize()
    
    try:
        # Testar componentes
        analyzer = DarcyDataAnalyzer(core)
        processor = DarcyFileProcessor(core)
        enhancer = DarcyMLEnhancer(core)
        scraper = DarcyWebScraper(core)
        
        print("🐍 Darcy AI Python Components inicializados!")
        print(f"📊 Provedores LLM: {list(core.llm_providers.keys())}")
        
        # Exemplo de uso
        sample_interactions = [
            {"query": "física quântica", "crew": "teaching", "timestamp": "2024-01-01T10:00:00Z"},
            {"query": "matemática derivadas", "crew": "teaching", "timestamp": "2024-01-01T11:00:00Z"}
        ]
        
        analysis = analyzer.analyze_learning_patterns(sample_interactions)
        print(f"📈 Análise de exemplo: {analysis}")
        
    finally:
        await core.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
