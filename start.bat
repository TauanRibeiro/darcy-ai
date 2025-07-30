@echo off
echo.
echo ========================================
echo      DARCY AI - INICIALIZACAO RAPIDA
echo ========================================
echo.

REM Verifica se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado!
    echo    Por favor, instale o Node.js: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Menu de opções
echo Escolha uma opcao:
echo.
echo 1. Frontend apenas (rapido)
echo 2. Backend + Frontend (completo)
echo 3. Testar sistema
echo 4. Instalar dependencias
echo 5. Sair
echo.
set /p choice="Digite sua opcao (1-5): "

if "%choice%"=="1" goto frontend_only
if "%choice%"=="2" goto full_system
if "%choice%"=="3" goto test_system
if "%choice%"=="4" goto install_deps
if "%choice%"=="5" goto end

echo Opcao invalida!
pause
goto end

:frontend_only
echo.
echo 🌐 Iniciando frontend apenas...
echo    Abrindo index.html no navegador...
start index.html
echo.
echo ✅ Frontend iniciado!
echo    Configure um provider nas Configuracoes
pause
goto end

:full_system
echo.
echo 🚀 Verificando backend...

REM Verifica se as dependências estão instaladas
if not exist "backend\node_modules" (
    echo ⚠️  Dependencias nao encontradas, instalando...
    cd backend
    call npm install
    cd ..
)

echo.
echo 🔧 Iniciando backend...
cd backend
start "Darcy AI Backend" cmd /k "npm start"
cd ..

timeout /t 3 /nobreak >nul

echo.
echo 🌐 Abrindo frontend...
start index.html

echo.
echo ✅ Sistema completo iniciado!
echo    Backend: http://localhost:3001
echo    Frontend: Aberto no navegador
pause
goto end

:test_system
echo.
echo 🧪 Testando sistema...

REM Verifica se backend está rodando
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend nao esta rodando!
    echo    Execute a opcao 2 primeiro para iniciar o backend
    pause
    goto end
)

echo ✅ Backend detectado, executando testes...
cd backend
node test-validation.js
cd ..
pause
goto end

:install_deps
echo.
echo 📦 Instalando dependencias do backend...
cd backend
call npm install
cd ..
echo.
echo ✅ Dependencias instaladas!
pause
goto end

:end
echo.
echo 👋 Obrigado por usar o Darcy AI!
echo.
pause
