#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n========================================"
echo -e "     ${BLUE}DARCY AI - INICIALIZAÇÃO RÁPIDA${NC}"
echo -e "========================================"
echo

# Verifica se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo -e "   Por favor, instale o Node.js: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js detectado${NC}"
echo

# Menu de opções
echo "Escolha uma opção:"
echo
echo "1. Frontend apenas (rápido)"
echo "2. Backend + Frontend (completo)"
echo "3. Testar sistema"
echo "4. Instalar dependências"
echo "5. Sair"
echo
read -p "Digite sua opção (1-5): " choice

case $choice in
    1)
        echo
        echo -e "${BLUE}🌐 Iniciando frontend apenas...${NC}"
        echo "   Abrindo index.html no navegador..."
        
        # Tenta abrir no navegador padrão
        if command -v open &> /dev/null; then
            open index.html  # macOS
        elif command -v xdg-open &> /dev/null; then
            xdg-open index.html  # Linux
        else
            echo "   Abra manualmente: file://$(pwd)/index.html"
        fi
        
        echo
        echo -e "${GREEN}✅ Frontend iniciado!${NC}"
        echo "   Configure um provider nas Configurações"
        ;;
        
    2)
        echo
        echo -e "${BLUE}🚀 Verificando backend...${NC}"
        
        # Verifica se as dependências estão instaladas
        if [ ! -d "backend/node_modules" ]; then
            echo -e "${YELLOW}⚠️  Dependências não encontradas, instalando...${NC}"
            cd backend
            npm install
            cd ..
        fi
        
        echo
        echo -e "${BLUE}🔧 Iniciando backend...${NC}"
        cd backend
        npm start &
        BACKEND_PID=$!
        cd ..
        
        sleep 3
        
        echo
        echo -e "${BLUE}🌐 Abrindo frontend...${NC}"
        if command -v open &> /dev/null; then
            open index.html  # macOS
        elif command -v xdg-open &> /dev/null; then
            xdg-open index.html  # Linux
        else
            echo "   Abra manualmente: file://$(pwd)/index.html"
        fi
        
        echo
        echo -e "${GREEN}✅ Sistema completo iniciado!${NC}"
        echo "   Backend: http://localhost:3001"
        echo "   Frontend: Aberto no navegador"
        echo
        echo "Pressione Ctrl+C para parar o backend"
        wait $BACKEND_PID
        ;;
        
    3)
        echo
        echo -e "${BLUE}🧪 Testando sistema...${NC}"
        
        # Verifica se backend está rodando
        if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
            echo -e "${RED}❌ Backend não está rodando!${NC}"
            echo "   Execute a opção 2 primeiro para iniciar o backend"
            exit 1
        fi
        
        echo -e "${GREEN}✅ Backend detectado, executando testes...${NC}"
        cd backend
        node test-validation.js
        cd ..
        ;;
        
    4)
        echo
        echo -e "${BLUE}📦 Instalando dependências do backend...${NC}"
        cd backend
        npm install
        cd ..
        echo
        echo -e "${GREEN}✅ Dependências instaladas!${NC}"
        ;;
        
    5)
        echo -e "\n${BLUE}👋 Obrigado por usar o Darcy AI!${NC}\n"
        exit 0
        ;;
        
    *)
        echo -e "${RED}Opção inválida!${NC}"
        exit 1
        ;;
esac

echo
read -p "Pressione Enter para continuar..."
