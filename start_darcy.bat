@echo off
CHCP 65001 > nul
setlocal

:: --- Configurações ---
set "PYTHON_DIR=%~dp0python"
set "VENV_DIR=%PYTHON_DIR%\.venv"
set "BACKEND_DIR=%~dp0backend"
set "FRONTEND_PORT=8080"
set "BACKEND_PORT=3000"
set "PYTHON_PORT=5000"

:: --- Funções ---
:log
echo [%date% %time%] %*
goto :eof

:check_command
where %1 >nul 2>nul
if %errorlevel% neq 0 (
    call :log "❌ ERRO: O comando '%1' não foi encontrado."
    call :log "� Por favor, instale-o e certifique-se de que está no PATH do sistema."
    goto :error_exit
)
goto :eof

:: --- Início da Execução ---
title Darcy AI - Gerenciador de Inicialização

echo �🚀 Darcy AI - Inicialização Completa para Windows
echo ==================================================
echo.

call :log "Verificando ferramentas essenciais (node, npm, python)..."
call :check_command node
call :check_command npm
call :check_command python
echo.

call :log "📊 Verificando estrutura do projeto..."
if not exist "%BACKEND_DIR%\server.js" (
    call :log "❌ Diretório backend não encontrado em %BACKEND_DIR%"
    goto :error_exit
)
if not exist "%PYTHON_DIR%\darcy_api_bridge.py" (
    call :log "❌ Componentes Python não encontrados em %PYTHON_DIR%"
    goto :error_exit
)
call :log "✅ Estrutura do projeto OK."
echo.

call :log "🔧 Configurando e instalando dependências do Backend (Node.js)..."
pushd "%BACKEND_DIR%"
if exist "package.json" (
    call :log "Executando 'npm install'..."
    npm install
) else (
    call :log "⚠️ package.json não encontrado. Pulando instalação de dependências do Node."
)
popd
echo.

call :log "🐍 Configurando ambiente virtual e dependências Python..."
pushd "%PYTHON_DIR%"

if not exist "%VENV_DIR%\Scripts\activate.bat" (
    call :log " Ambiente virtual não encontrado. Criando em %VENV_DIR%..."
    python -m venv .venv
    if %errorlevel% neq 0 (
        call :log "❌ Falha ao criar o ambiente virtual."
        goto :error_exit
    )
    call :log "✅ Ambiente virtual criado."
) else (
    call :log "✅ Ambiente virtual encontrado."
)

call :log " Ativando ambiente virtual e instalando dependências de requirements.txt..."
call "%VENV_DIR%\Scripts\activate.bat"
pip install -r requirements.txt
if %errorlevel% neq 0 (
    call :log "❌ Falha ao instalar as dependências Python."
    goto :error_exit
)
call :log "✅ Dependências Python OK."
popd
echo.

call :log "🚀 Iniciando todos os serviços..."
echo.

call :log "📡 Iniciando backend Node.js na porta %BACKEND_PORT%..."
start "Darcy Backend (Node.js)" cmd /c "cd /d %BACKEND_DIR% && npm start"

timeout /t 4 /nobreak > nul

call :log "🐍 Iniciando servidor Python na porta %PYTHON_PORT%..."
start "Darcy Python Bridge" cmd /c "cd /d %PYTHON_DIR% && call .venv\Scripts\activate.bat && python darcy_api_bridge.py"

timeout /t 4 /nobreak > nul

call :log "🌐 Iniciando servidor web para o Frontend na porta %FRONTEND_PORT%..."
start "Darcy Frontend (Web Server)" cmd /c "cd /d %~dp0 && python -m http.server %FRONTEND_PORT%"

timeout /t 2 /nobreak > nul

echo.
echo 🎉 Darcy AI iniciado com sucesso!
echo ====================================
echo.
echo    - Frontend acessível em: http://localhost:%FRONTEND_PORT%
echo    - Backend (Node.js) em:  http://localhost:%BACKEND_PORT%
echo    - Python API em:         http://localhost:%PYTHON_PORT%
echo.
echo 💡 Abrindo a interface do Darcy no seu navegador padrão...
start http://localhost:%FRONTEND_PORT%
echo.

goto :end

:error_exit
echo.
echo 🛑 A inicialização falhou. Por favor, verifique os erros acima.
pause
exit /b 1

:end
echo.
echo ==================================================
echo  Pressione Ctrl+C nas janelas dos servidores para
echo  finalizar o Darcy AI completamente.
echo ==================================================
echo.
pause
exit /b 0
