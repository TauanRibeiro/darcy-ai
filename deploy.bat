@echo off
CHCP 65001 > nul
setlocal

REM Darcy AI - Script de Deploy Automatizado para Windows
REM =====================================================

echo 🚀 Iniciando deploy do Darcy AI para produção...
echo ================================================
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
    echo ❌ Erro: Este não é um repositório Git. Execute 'git init' primeiro.
    pause
    exit /b 1
)

echo ✅ Verificações iniciais passaram
echo.

REM Gerar timestamp para versão
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set "current_date=%%d%%b%%c"
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set "current_time=%%a%%b"
set "version_suffix=%current_date%-%current_time%"

echo 📝 Atualizando versão para v2.1.%version_suffix%...
echo.

REM Verificar mudanças pendentes
git status --porcelain >nul 2>&1
for /f %%i in ('git status --porcelain ^| find /c /v ""') do set changes=%%i

if %changes% gtr 0 (
    echo 📦 Commitando mudanças pendentes...
    git add .
    git commit -m "Deploy automatizado - v2.1.%version_suffix%"
    echo.
)

REM Push para GitHub
echo 📤 Enviando para GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo ❌ Erro ao fazer push. Verifique sua conexão e permissões.
    pause
    exit /b 1
)

echo.
echo 🎉 Deploy iniciado com sucesso!
echo ================================
echo.
echo 📋 Próximos passos:
echo 1. Acesse https://vercel.com
echo 2. Conecte seu repositório GitHub (TauanRibeiro/darcy-ai)
echo 3. Configure as variáveis de ambiente (se necessário):
echo    - NODE_ENV=production
echo 4. Aguarde o deploy automático
echo.
echo 🔗 URLs esperadas após deploy:
echo    Frontend: https://darcy-ai-[hash].vercel.app
echo    API: https://darcy-ai-[hash].vercel.app/api
echo.
echo ✅ Script concluído!
echo.
pause
