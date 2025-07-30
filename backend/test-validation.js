#!/usr/bin/env node

/**
 * Script de validação do Darcy AI
 * Testa todas as funcionalidades principais do sistema
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:3001';
const TEST_RESULTS = [];

// Cores para output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

/**
 * Função para log colorido
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Testa se o backend está rodando
 */
async function testBackendHealth() {
    log('\n🔍 Testando saúde do backend...', 'blue');
    
    try {
        const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
        
        if (response.status === 200 && response.data.status === 'ok') {
            log('✅ Backend está funcionando corretamente', 'green');
            TEST_RESULTS.push({ test: 'Backend Health', status: 'PASS' });
            return true;
        } else {
            throw new Error('Resposta inválida do backend');
        }
    } catch (error) {
        log(`❌ Backend não está respondendo: ${error.message}`, 'red');
        TEST_RESULTS.push({ test: 'Backend Health', status: 'FAIL', error: error.message });
        return false;
    }
}

/**
 * Testa endpoints de providers
 */
async function testProviders() {
    log('\n🤖 Testando providers de LLM...', 'blue');
    
    try {
        const response = await axios.get(`${BACKEND_URL}/api/providers`);
        
        if (response.status === 200 && Array.isArray(response.data.providers)) {
            log(`✅ Encontrados ${response.data.providers.length} providers`, 'green');
            log(`   Providers: ${response.data.providers.join(', ')}`, 'yellow');
            TEST_RESULTS.push({ test: 'Providers List', status: 'PASS' });
            
            // Testa disponibilidade dos providers
            for (const provider of response.data.providers) {
                await testProviderAvailability(provider);
            }
            
            return true;
        } else {
            throw new Error('Formato de resposta inválido');
        }
    } catch (error) {
        log(`❌ Erro ao testar providers: ${error.message}`, 'red');
        TEST_RESULTS.push({ test: 'Providers List', status: 'FAIL', error: error.message });
        return false;
    }
}

/**
 * Testa disponibilidade de um provider específico
 */
async function testProviderAvailability(provider) {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/providers/check/${provider}`);
        
        if (response.data.available) {
            log(`   ✅ ${provider}: Disponível`, 'green');
            TEST_RESULTS.push({ test: `Provider ${provider}`, status: 'AVAILABLE' });
        } else {
            log(`   ⚠️  ${provider}: Não disponível`, 'yellow');
            TEST_RESULTS.push({ test: `Provider ${provider}`, status: 'UNAVAILABLE' });
        }
    } catch (error) {
        log(`   ❌ ${provider}: Erro ao verificar`, 'red');
        TEST_RESULTS.push({ test: `Provider ${provider}`, status: 'ERROR', error: error.message });
    }
}

/**
 * Testa funcionalidade de chat
 */
async function testChat() {
    log('\n💬 Testando funcionalidade de chat...', 'blue');
    
    const testMessage = 'Olá, este é um teste. Responda brevemente.';
    
    try {
        const response = await axios.post(`${BACKEND_URL}/api/chat`, {
            message: testMessage,
            provider: 'ollama', // Tenta Ollama primeiro
            model: 'llama2',
            context: 'general'
        }, { timeout: 30000 });
        
        if (response.status === 200 && response.data.response) {
            log('✅ Chat funcionando corretamente', 'green');
            log(`   Resposta: ${response.data.response.substring(0, 100)}...`, 'yellow');
            TEST_RESULTS.push({ test: 'Chat Functionality', status: 'PASS' });
            return true;
        } else {
            throw new Error('Resposta de chat inválida');
        }
    } catch (error) {
        log(`❌ Erro no chat: ${error.message}`, 'red');
        TEST_RESULTS.push({ test: 'Chat Functionality', status: 'FAIL', error: error.message });
        return false;
    }
}

/**
 * Testa upload de arquivo
 */
async function testFileUpload() {
    log('\n📄 Testando upload de arquivo...', 'blue');
    
    // Cria um arquivo de teste
    const testFilePath = path.join(__dirname, 'test-document.txt');
    const testContent = 'Este é um documento de teste para o Darcy AI.\nEle contém informações educacionais básicas.\nPor favor, analise este conteúdo.';
    
    try {
        fs.writeFileSync(testFilePath, testContent);
        
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', fs.createReadStream(testFilePath));
        form.append('action', 'analyze');
        
        const response = await axios.post(`${BACKEND_URL}/api/upload`, form, {
            headers: form.getHeaders(),
            timeout: 30000
        });
        
        if (response.status === 200 && response.data.analysis) {
            log('✅ Upload de arquivo funcionando', 'green');
            log(`   Análise: ${response.data.analysis.substring(0, 100)}...`, 'yellow');
            TEST_RESULTS.push({ test: 'File Upload', status: 'PASS' });
            
            // Limpa arquivo de teste
            fs.unlinkSync(testFilePath);
            return true;
        } else {
            throw new Error('Resposta de upload inválida');
        }
    } catch (error) {
        log(`❌ Erro no upload: ${error.message}`, 'red');
        TEST_RESULTS.push({ test: 'File Upload', status: 'FAIL', error: error.message });
        
        // Limpa arquivo de teste se existir
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
        return false;
    }
}

/**
 * Testa busca na web
 */
async function testWebSearch() {
    log('\n🌐 Testando busca na web...', 'blue');
    
    try {
        const response = await axios.post(`${BACKEND_URL}/api/chat`, {
            message: 'Buscar na web: inteligência artificial educação',
            provider: 'ollama',
            context: 'research',
            webSearch: true
        }, { timeout: 30000 });
        
        if (response.status === 200 && response.data.response) {
            log('✅ Busca na web funcionando', 'green');
            TEST_RESULTS.push({ test: 'Web Search', status: 'PASS' });
            return true;
        } else {
            throw new Error('Resposta de busca inválida');
        }
    } catch (error) {
        log(`❌ Erro na busca web: ${error.message}`, 'red');
        TEST_RESULTS.push({ test: 'Web Search', status: 'FAIL', error: error.message });
        return false;
    }
}

/**
 * Testa modelos disponíveis
 */
async function testModels() {
    log('\n🧠 Testando modelos disponíveis...', 'blue');
    
    const providers = ['ollama', 'openai', 'anthropic', 'cohere'];
    
    for (const provider of providers) {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/models/${provider}`);
            
            if (response.status === 200 && Array.isArray(response.data.models)) {
                log(`   ✅ ${provider}: ${response.data.models.length} modelos disponíveis`, 'green');
                TEST_RESULTS.push({ test: `Models ${provider}`, status: 'PASS' });
            } else {
                log(`   ⚠️  ${provider}: Nenhum modelo encontrado`, 'yellow');
                TEST_RESULTS.push({ test: `Models ${provider}`, status: 'NO_MODELS' });
            }
        } catch (error) {
            log(`   ❌ ${provider}: Erro ao buscar modelos`, 'red');
            TEST_RESULTS.push({ test: `Models ${provider}`, status: 'ERROR' });
        }
    }
}

/**
 * Exibe relatório final
 */
function showReport() {
    log('\n📊 RELATÓRIO FINAL DE TESTES', 'blue');
    log('=' .repeat(50), 'blue');
    
    const passed = TEST_RESULTS.filter(t => t.status === 'PASS').length;
    const failed = TEST_RESULTS.filter(t => t.status === 'FAIL').length;
    const warnings = TEST_RESULTS.filter(t => ['UNAVAILABLE', 'NO_MODELS'].includes(t.status)).length;
    
    log(`\n✅ Testes Aprovados: ${passed}`, 'green');
    log(`❌ Testes Falharam: ${failed}`, 'red');
    log(`⚠️  Avisos: ${warnings}`, 'yellow');
    
    log('\nDetalhes dos testes:', 'blue');
    TEST_RESULTS.forEach(result => {
        const color = result.status === 'PASS' ? 'green' : 
                     result.status === 'FAIL' ? 'red' : 'yellow';
        log(`  ${result.test}: ${result.status}`, color);
        if (result.error) {
            log(`    Erro: ${result.error}`, 'red');
        }
    });
    
    log('\n' + '='.repeat(50), 'blue');
    
    if (failed === 0) {
        log('🎉 Todos os testes principais passaram! O Darcy AI está funcionando corretamente.', 'green');
    } else {
        log('⚠️  Alguns testes falharam. Verifique a configuração e tente novamente.', 'yellow');
    }
}

/**
 * Função principal
 */
async function main() {
    log('🚀 INICIANDO VALIDAÇÃO DO DARCY AI', 'blue');
    log('=====================================', 'blue');
    
    const backendRunning = await testBackendHealth();
    
    if (!backendRunning) {
        log('\n❌ Backend não está rodando. Inicie o backend primeiro:', 'red');
        log('   cd backend && npm start', 'yellow');
        return;
    }
    
    await testProviders();
    await testModels();
    await testChat();
    await testFileUpload();
    await testWebSearch();
    
    showReport();
}

// Executa apenas se chamado diretamente
if (require.main === module) {
    main().catch(error => {
        log(`\n💥 Erro fatal: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { main, testBackendHealth, testProviders, testChat };
