# Darcy AI - Guia de Instalação Python

## 🐍 Por que Python no Darcy AI?

Os componentes Python do Darcy AI adicionam capacidades avançadas que JavaScript não consegue executar nativamente:

### 📊 **Análise de Dados Educacionais**
- **Para que**: Analisar padrões de aprendizado do usuário
- **Por que**: Identificar tópicos de maior dificuldade e gerar recomendações personalizadas
- **Como**: Usando pandas e numpy para análise estatística avançada

### 📄 **Processamento de Arquivos**
- **Para que**: Extrair e analisar conteúdo de PDFs, imagens e documentos
- **Por que**: Permitir que o Darcy "leia" materiais educacionais enviados pelo usuário
- **Como**: OCR com Tesseract, extração de texto com PyPDF2/pymupdf

### ✨ **Melhoria de Respostas com ML**
- **Para que**: Avaliar e melhorar qualidade das respostas educacionais
- **Por que**: Garantir clareza, completude e adequação pedagógica
- **Como**: Análise de texto com técnicas de processamento de linguagem natural

### 🔍 **Busca Educacional Inteligente**
- **Para que**: Buscar informações atualizadas em fontes educacionais confiáveis
- **Por que**: Complementar conhecimento dos LLMs com dados em tempo real
- **Como**: Web scraping responsável e APIs educacionais

## 🚀 Instalação Rápida

### 1. Dependências Básicas (Obrigatórias)
```bash
pip install flask flask-cors requests aiohttp pathlib2
```

### 2. Análise de Dados (Recomendada)
```bash
pip install pandas numpy python-dateutil
```

### 3. Processamento de Arquivos (Recomendada)
```bash
pip install PyPDF2 pymupdf Pillow pytesseract
```

### 4. Machine Learning (Opcional)
```bash
pip install scikit-learn nltk
```

### 5. Web Scraping (Opcional)
```bash
pip install beautifulsoup4 selenium
```

## 📦 Instalação Completa

```bash
cd darcy/python
pip install -r requirements.txt
```

## 🏃‍♂️ Como Executar

### 1. Iniciar o Servidor Python
```bash
cd python
python darcy_api_bridge.py
```

O servidor iniciará em `http://localhost:5000`

### 2. Abrir o Darcy AI
```bash
# Em outro terminal
cd ..
python -m http.server 8080
```

Abra `http://localhost:8080` no navegador

## 🎯 Funcionalidades Disponíveis

### 📊 Analytics de Aprendizado
- Análise de padrões de estudo
- Identificação de tópicos preferidos
- Recomendações personalizadas
- Métricas de progresso

### 📄 Processamento de Arquivos
- **PDFs**: Extração de texto, metadados, análise educacional
- **Imagens**: OCR, identificação de conteúdo educacional
- **Análise**: Nível de leitura, assunto principal, complexidade

### ✨ Melhoria de Respostas
- **Clareza**: Avalia simplicidade da linguagem
- **Qualidade Educacional**: Verifica presença de exemplos e estrutura pedagógica
- **Completude**: Analisa se a resposta aborda adequadamente a pergunta
- **Sugestões**: Recomendações automáticas de melhoria

### 🔍 Busca Educacional
- Busca em fontes educacionais confiáveis
- Filtragem por relevância educacional
- Integração com conteúdo do Darcy

## 🛠️ Configuração Avançada

### Tesseract OCR (Para processamento de imagens com texto)

#### Windows:
1. Baixe o [Tesseract](https://github.com/UB-Mannheim/tesseract/wiki)
2. Instale e adicione ao PATH
3. Configure idiomas: `tessdata` com português

#### Linux:
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-por
```

#### macOS:
```bash
brew install tesseract tesseract-lang
```

### Configuração de Idiomas
```python
# No darcy_python_core.py, configure:
pytesseract.image_to_string(img, lang='por+eng')
```

## 🔧 Solução de Problemas

### "Módulo não encontrado"
```bash
pip list  # Verificar instalações
pip install --upgrade pip
pip install -r requirements.txt
```

### "Tesseract não encontrado"
- Verificar instalação do Tesseract
- Adicionar ao PATH do sistema
- Reiniciar terminal/IDE

### "Erro de CORS"
- Certificar que flask-cors está instalado
- Verificar se o servidor Python está rodando
- Testar endpoints manualmente

### "Erro de porta em uso"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:5000 | xargs kill -9
```

## 📈 Monitoramento

### Health Check
```bash
curl http://localhost:5000/api/python/health
```

### Logs do Sistema
- Console do Python mostra status de inicialização
- Frontend mostra status de conexão
- Cada endpoint registra operações

## 🚦 Status de Desenvolvimento

| Componente | Status | Funcionalidade |
|------------|--------|----------------|
| ✅ Core | Completo | Inicialização, configuração, health checks |
| ✅ Data Analyzer | Completo | Análise de padrões, recomendações |
| ✅ File Processor | Completo | PDF, imagem, OCR, análise educacional |
| ✅ ML Enhancer | Completo | Qualidade, clareza, completude |
| 🟧 Web Scraper | Básico | Estrutura pronta, implementação em andamento |
| ✅ API Bridge | Completo | Endpoints REST, integração com frontend |
| ✅ Frontend Integration | Completo | UI, comunicação, status panels |

## 🎯 Próximos Passos

1. **Implementação Completa do Web Scraper**
   - APIs educacionais (Khan Academy, Coursera)
   - Scraping responsável de Wikipedia
   - Cache inteligente de resultados

2. **Machine Learning Avançado**
   - Modelos de classificação de conteúdo
   - Análise de sentimento educacional
   - Predição de dificuldade de aprendizado

3. **Análise de Voz e Vídeo**
   - Transcrição de áudio
   - Análise de apresentações
   - Processamento de videoaulas

4. **Integração com Bases Educacionais**
   - BNCC (Base Nacional Comum Curricular)
   - Currículos estaduais
   - Repositórios de recursos educacionais

## 💡 Casos de Uso Reais

### Exemplo 1: Professor Analisando Engajamento
```python
# Dados coletados automaticamente
interactions = [
    {"student": "Ana", "topic": "álgebra", "time": 45, "errors": 2},
    {"student": "João", "topic": "geometria", "time": 30, "errors": 0}
]

analysis = analyzer.analyze_class_performance(interactions)
# Resultado: Recomendações personalizadas por aluno
```

### Exemplo 2: Estudante Enviando Material
```python
# Usuário faz upload de PDF de livro
pdf_result = processor.process_pdf("livro_fisica.pdf")
# Resultado: Extração de conceitos, exercícios, nível de complexidade
# Darcy pode usar esse conteúdo para criar explicações personalizadas
```

### Exemplo 3: Melhoria Automática de Respostas
```python
# Resposta do LLM passa por análise
response = "E=mc² é uma equação famosa"
enhancement = enhancer.enhance_response_quality(response, context)
# Resultado: Sugestão para adicionar exemplos, explicar termos, contextualizar
```

---

**🎓 O Darcy AI com Python se torna uma plataforma educacional completa, combinando o melhor de IA conversacional com análise de dados avançada e processamento de conteúdo educacional!**
