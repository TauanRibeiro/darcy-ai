#!/bin/bash

# Darcy AI Deployment Script for SSH Server
# Usage: ./deploy-to-server.sh

set -e

echo "🚀 Darcy AI - Script de Deploy para Servidor SSH"
echo "================================================"

# Configuration
SSH_HOST="164.41.168.25"
SSH_PORT="13508"
SSH_USER="darcy"
REMOTE_PATH="/home/darcy/darcy-ai"
LOCAL_PATH="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if SSH key exists or ask for password
check_ssh_connection() {
    log_info "Verificando conexão SSH..."
    
    if ssh -o BatchMode=yes -o ConnectTimeout=5 -p $SSH_PORT $SSH_USER@$SSH_HOST exit 2>/dev/null; then
        log_success "Conexão SSH estabelecida (chave SSH)"
        SSH_METHOD="key"
    else
        log_warning "Chave SSH não encontrada, será necessário inserir senha"
        SSH_METHOD="password"
    fi
}

# Create remote directory structure
create_remote_structure() {
    log_info "Criando estrutura de diretórios no servidor..."
    
    ssh -p $SSH_PORT $SSH_USER@$SSH_HOST << 'EOF'
        mkdir -p /home/darcy/darcy-ai
        mkdir -p /home/darcy/darcy-ai/backend
        mkdir -p /home/darcy/darcy-ai/js
        mkdir -p /home/darcy/darcy-ai/css
        mkdir -p /home/darcy/darcy-ai/icons
        mkdir -p /home/darcy/darcy-ai/logs
        mkdir -p /home/darcy/darcy-ai/temp-uploads
EOF
    
    log_success "Estrutura de diretórios criada"
}

# Upload files to server
upload_files() {
    log_info "Fazendo upload dos arquivos..."
    
    # Frontend files
    rsync -avz -e "ssh -p $SSH_PORT" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='temp-uploads' \
        --exclude='logs' \
        --exclude='.env' \
        ./ $SSH_USER@$SSH_HOST:$REMOTE_PATH/
    
    log_success "Arquivos enviados para o servidor"
}

# Install Node.js and dependencies on server
install_dependencies() {
    log_info "Instalando dependências no servidor..."
    
    ssh -p $SSH_PORT $SSH_USER@$SSH_HOST << 'EOF'
        cd /home/darcy/darcy-ai
        
        # Check if Node.js is installed
        if ! command -v node &> /dev/null; then
            echo "📦 Instalando Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
        
        # Install backend dependencies
        if [ -f "backend/package.json" ]; then
            echo "📦 Instalando dependências do backend..."
            cd backend
            npm install
            cd ..
        fi
        
        # Create .env file if it doesn't exist
        if [ ! -f "backend/.env" ]; then
            echo "⚙️ Criando arquivo .env..."
            cp backend/.env.example backend/.env
            echo "ATENÇÃO: Configure as variáveis no arquivo backend/.env"
        fi
EOF
    
    log_success "Dependências instaladas"
}

# Setup PM2 for process management
setup_pm2() {
    log_info "Configurando PM2 para gerenciamento de processos..."
    
    ssh -p $SSH_PORT $SSH_USER@$SSH_HOST << 'EOF'
        cd /home/darcy/darcy-ai
        
        # Install PM2 globally if not installed
        if ! command -v pm2 &> /dev/null; then
            echo "📦 Instalando PM2..."
            sudo npm install -g pm2
        fi
        
        # Create PM2 ecosystem file
        cat > ecosystem.config.js << 'EOL'
module.exports = {
  apps: [
    {
      name: 'darcy-ai-backend',
      script: 'backend/server.js',
      cwd: '/home/darcy/darcy-ai',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    }
  ]
};
EOL
        
        echo "✅ Arquivo PM2 ecosystem criado"
EOF
    
    log_success "PM2 configurado"
}

# Setup Nginx reverse proxy
setup_nginx() {
    log_info "Configurando Nginx..."
    
    ssh -p $SSH_PORT $SSH_USER@$SSH_HOST << 'EOF'
        # Install Nginx if not present
        if ! command -v nginx &> /dev/null; then
            echo "📦 Instalando Nginx..."
            sudo apt update
            sudo apt install -y nginx
        fi
        
        # Create Nginx configuration
        sudo tee /etc/nginx/sites-available/darcy-ai << 'EOL'
server {
    listen 80;
    server_name _;
    
    # Frontend files
    root /home/darcy/darcy-ai;
    index index.html;
    
    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
        
        # Enable CORS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOL
        
        # Enable site
        sudo ln -sf /etc/nginx/sites-available/darcy-ai /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        
        # Test and reload Nginx
        sudo nginx -t && sudo systemctl reload nginx
        
        echo "✅ Nginx configurado"
EOF
    
    log_success "Nginx configurado"
}

# Start services
start_services() {
    log_info "Iniciando serviços..."
    
    ssh -p $SSH_PORT $SSH_USER@$SSH_HOST << 'EOF'
        cd /home/darcy/darcy-ai
        
        # Start backend with PM2
        pm2 start ecosystem.config.js
        pm2 save
        pm2 startup
        
        # Enable Nginx
        sudo systemctl enable nginx
        sudo systemctl start nginx
        
        echo "✅ Serviços iniciados"
        
        # Show status
        echo ""
        echo "📊 Status dos serviços:"
        pm2 status
        sudo systemctl status nginx --no-pager -l
EOF
    
    log_success "Serviços iniciados"
}

# Show deployment information
show_deployment_info() {
    echo ""
    echo "🎉 Deploy concluído com sucesso!"
    echo "================================"
    echo ""
    echo "📡 Servidor: $SSH_HOST:$SSH_PORT"
    echo "🌐 Frontend: http://$SSH_HOST"
    echo "🔧 Backend API: http://$SSH_HOST/api"
    echo "📁 Diretório: $REMOTE_PATH"
    echo ""
    echo "🔧 Comandos úteis no servidor:"
    echo "  pm2 status          - Status dos processos"
    echo "  pm2 logs            - Ver logs"
    echo "  pm2 restart all     - Reiniciar serviços"
    echo "  sudo nginx -t       - Testar configuração Nginx"
    echo "  sudo systemctl reload nginx - Recarregar Nginx"
    echo ""
    echo "⚙️  Para configurar:"
    echo "  1. SSH no servidor: ssh -p $SSH_PORT $SSH_USER@$SSH_HOST"
    echo "  2. Edite: nano $REMOTE_PATH/backend/.env"
    echo "  3. Configure as chaves de API necessárias"
    echo "  4. Reinicie: pm2 restart darcy-ai-backend"
    echo ""
    log_success "Deploy finalizado!"
}

# Main deployment process
main() {
    echo "Iniciando deploy do Darcy AI..."
    echo ""
    
    # Pre-flight checks
    if ! command -v ssh &> /dev/null; then
        log_error "SSH não encontrado. Instale o openssh-client"
        exit 1
    fi
    
    if ! command -v rsync &> /dev/null; then
        log_error "rsync não encontrado. Instale o rsync"
        exit 1
    fi
    
    # Deployment steps
    check_ssh_connection
    create_remote_structure
    upload_files
    install_dependencies
    setup_pm2
    setup_nginx
    start_services
    show_deployment_info
}

# Handle script arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    upload-only)
        log_info "Fazendo apenas upload dos arquivos..."
        upload_files
        ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "cd $REMOTE_PATH && pm2 restart darcy-ai-backend"
        log_success "Upload concluído e backend reiniciado"
        ;;
    restart)
        log_info "Reiniciando serviços..."
        ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "pm2 restart all && sudo systemctl reload nginx"
        log_success "Serviços reiniciados"
        ;;
    logs)
        log_info "Mostrando logs do backend..."
        ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "pm2 logs darcy-ai-backend --lines 50"
        ;;
    status)
        log_info "Status dos serviços..."
        ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "pm2 status && sudo systemctl status nginx --no-pager"
        ;;
    help)
        echo "Uso: $0 [comando]"
        echo ""
        echo "Comandos disponíveis:"
        echo "  deploy      - Deploy completo (padrão)"
        echo "  upload-only - Apenas upload de arquivos"
        echo "  restart     - Reiniciar serviços"
        echo "  logs        - Ver logs do backend"
        echo "  status      - Ver status dos serviços"
        echo "  help        - Mostrar esta ajuda"
        ;;
    *)
        log_error "Comando inválido: $1"
        echo "Use '$0 help' para ver os comandos disponíveis"
        exit 1
        ;;
esac
