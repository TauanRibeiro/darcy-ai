# Darcy AI - Quick Start Python
# Script de inicialização rápida dos componentes Python

import subprocess
import sys
import os

def check_python():
    """Verifica versão do Python"""
    print(f"🐍 Python: {sys.version}")
    return sys.version_info >= (3, 8)

def install_basic_requirements():
    """Instala dependências básicas"""
    basic_packages = [
        "flask", "flask-cors", "requests", 
        "aiohttp", "pathlib2", "colorama"
    ]
    
    print("📦 Instalando dependências básicas...")
    for package in basic_packages:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", package], 
                         check=True, capture_output=True)
            print(f"✅ {package}")
        except subprocess.CalledProcessError:
            print(f"❌ Erro ao instalar {package}")

def test_import():
    """Testa importação dos módulos"""
    try:
        from darcy_python_core import DarcyPythonCore
        print("✅ Módulos Python importados com sucesso")
        return True
    except ImportError as e:
        print(f"❌ Erro na importação: {e}")
        print("💡 Certifique-se de que está no diretório correto")
        return False

def main():
    print("🚀 Darcy AI - Inicialização Python")
    print("=" * 50)
    
    # Verificar Python
    if not check_python():
        print("❌ Python 3.8+ necessário")
        return
    
    # Verificar se estamos no diretório correto
    if not os.path.exists("darcy_python_core.py"):
        print("❌ Execute este script do diretório python/")
        print("💡 Use: cd python && python quick_start.py")
        return
    
    # Instalar dependências
    install_basic_requirements()
    
    # Testar importação
    if test_import():
        print("\n🎉 Setup concluído com sucesso!")
        print("📋 Próximos passos:")
        print("   1. python darcy_api_bridge.py")
        print("   2. Abrir Darcy AI no navegador")
        print("   3. Verificar painel 🐍 Python Components")
    else:
        print("\n❌ Setup falhou. Verifique os erros acima.")

if __name__ == "__main__":
    main()
