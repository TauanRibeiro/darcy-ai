@echo off
CHCP 65001 > nul
setlocal

REM Darcy AI - Script de Deploy AUTOMÁTICO para Vercel
REM =================================================

echo 🚀 DEPLOY AUTOMÁTICO DO DARCY AI PARA VERCEL
echo ===============================================
echo.

REM Verificar se estamos no diretório correto
if not exist "index.html" (
    echo ❌ Erro: Execute este script na pasta raiz do projeto Darcy AI
    pause
    exit /b 1
)

REM Verificar se Git está disponível
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Erro: Git não encontrado. Instale o Git primeiro.
    pause
    exit /b 1
)

REM Verificar se é um repositório Git
if not exist ".git" (
    echo 🔧 Inicializando repositório Git...
    git init
    git branch -M main
    echo.
)

echo ✅ Verificações iniciais passaram
echo.

REM Verificar se há remote origin
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔗 Configurando repositório remoto...
    git remote add origin https://github.com/TauanRibeiro/darcy-ai.git
    echo.
)

REM Gerar timestamp para versão
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "MIN=%dt:~10,2%"
set "version_suffix=%YY%%MM%%DD%-%HH%%MIN%"

echo 📝 Commitando como v2.1.%version_suffix%...
echo.

REM Adicionar todos os arquivos
git add .

REM Commit com mensagem detalhada
git commit -m "🚀 Deploy Automático Darcy AI v2.1.%version_suffix%

✅ Features incluídas:
- Sistema modular de LLM (OpenAI, Anthropic, Google, Groq, Ollama)
- Interface responsiva e moderna
- Backend Node.js otimizado para Vercel
- Componentes Python para análise avançada
- OCR com fallback graceful
- Web scraping educacional
- Sistema de crews especializado

🔧 Configurações de produção:
- CORS configurado para Vercel
- Detecção automática de ambiente
- Cache otimizado para assets
- Routing inteligente para SPA
- Headers de segurança aplicados

🌐 Pronto para: https://vercel.com/deploy"

if %errorlevel% neq 0 (
    echo ⚠️ Nada novo para commitar ou erro no commit
)

echo.
echo 📤 Fazendo push para GitHub...
git push -u origin main --force

if %errorlevel% neq 0 (
    echo ❌ Erro ao fazer push. Tentando novamente...
    timeout /t 3 >nul
    git push -u origin main --force
    
    if %errorlevel% neq 0 (
        echo ❌ Falha no push. Verifique sua conexão e permissões.
        echo 💡 Dica: Configure seu token GitHub pessoal
        pause
        exit /b 1
    )
)

echo.
echo 🎉 PUSH REALIZADO COM SUCESSO!
echo ==============================
echo.
echo � DEPLOY AUTOMÁTICO NO VERCEL:
echo 1. Acesse: https://vercel.com/new
echo 2. Conecte: github.com/TauanRibeiro/darcy-ai
echo 3. Deploy é AUTOMÁTICO! (já configurado)
echo.
echo 🌟 URLs após deploy:
echo    Frontend: https://darcy-ai-[hash].vercel.app
echo    API: https://darcy-ai-[hash].vercel.app/api/chat
echo    Health: https://darcy-ai-[hash].vercel.app/api/health
echo.
echo 📋 O que foi otimizado:
echo ✅ Vercel.json com cache inteligente
echo ✅ CORS configurado para produção  
echo ✅ Routing SPA otimizado
echo ✅ Assets com cache de 1 ano
echo ✅ API com headers de segurança
echo ✅ Functions com 30s timeout
echo.
echo 🚀 SEU DARCY AI ESTÁ ONLINE EM ~2 MINUTOS!
echo.
pause
