#!/bin/bash

# Darcy AI - Script de Deploy Automatizado
# =========================================

set -e  # Exit on any error

echo "🚀 Iniciando deploy do Darcy AI para produção..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto Darcy AI"
    exit 1
fi

# Check if git is available and we're in a git repo
if ! command -v git &> /dev/null; then
    echo "❌ Erro: Git não encontrado. Instale o Git primeiro."
    exit 1
fi

if [ ! -d ".git" ]; then
    echo "❌ Erro: Este não é um repositório Git. Execute 'git init' primeiro."
    exit 1
fi

echo "✅ Verificações iniciais passaram"

# Update version in package.json
echo "📝 Atualizando versão..."
CURRENT_DATE=$(date +"%Y%m%d%H%M")
sed -i.bak "s/\"version\": \".*\"/\"version\": \"2.1.${CURRENT_DATE}\"/" package.json

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📦 Commitando mudanças pendentes..."
    git add .
    git commit -m "Deploy automatizado - v2.1.${CURRENT_DATE}"
fi

# Push to GitHub
echo "📤 Enviando para GitHub..."
git push origin main

echo ""
echo "🎉 Deploy iniciado com sucesso!"
echo "================================"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse https://vercel.com"
echo "2. Conecte seu repositório GitHub (TauanRibeiro/darcy-ai)"
echo "3. Configure as variáveis de ambiente (se necessário):"
echo "   - NODE_ENV=production"
echo "4. Aguarde o deploy automático"
echo ""
echo "🔗 URLs esperadas após deploy:"
echo "   Frontend: https://darcy-ai-[hash].vercel.app"
echo "   API: https://darcy-ai-[hash].vercel.app/api"
echo ""
echo "✅ Script concluído!"
