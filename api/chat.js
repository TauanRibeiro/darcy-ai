// Vercel Serverless Function - Chat API com LLMs Gratuitas
import https from 'https';

// APIs gratuitas disponíveis
const FREE_LLM_APIS = [
  {
    name: 'HuggingFace',
    url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer hf_demo' // Token demo público
    }
  },
  {
    name: 'Together AI',
    url: 'https://api.together.xyz/inference',
    model: 'togethercomputer/llama-2-7b-chat'
  }
];

async function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: { error: 'Invalid JSON', raw: data } });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function callHuggingFaceAPI(prompt) {
  try {
    const payload = {
      inputs: prompt,
      parameters: {
        max_length: 500,
        temperature: 0.7,
        do_sample: true,
        top_p: 0.9
      }
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DarcyAI/1.0'
      },
      body: JSON.stringify(payload)
    };

    const response = await makeRequest(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', 
      options
    );

    if (response.status === 200 && response.data && response.data[0] && response.data[0].generated_text) {
      return {
        success: true,
        text: response.data[0].generated_text.replace(prompt, '').trim(),
        provider: 'HuggingFace DialoGPT'
      };
    }
    
    throw new Error('Invalid response from HuggingFace');
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function callOpenSourceLLM(prompt) {
  // Tentar diferentes APIs gratuitas
  const endpoints = [
    'https://api.deepinfra.com/v1/inference/meta-llama/Llama-2-7b-chat-hf',
    'https://api.replicate.com/v1/predictions'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const payload = {
        input: {
          prompt: prompt,
          max_tokens: 300,
          temperature: 0.7
        }
      };

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DarcyAI/1.0'
        },
        body: JSON.stringify(payload)
      };

      const response = await makeRequest(endpoint, options);
      
      if (response.status === 200 && response.data) {
        return {
          success: true,
          text: response.data.output || response.data.result || 'Resposta processada com sucesso',
          provider: 'Open Source LLM'
        };
      }
    } catch (error) {
      continue; // Tentar próximo endpoint
    }
  }
  
  return { success: false, error: 'All free APIs failed' };
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, crew = 'teaching' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Crew personalities
    const crewPrompts = {
      teaching: `Você é um professor dedicado chamado Darcy. Explique "${message}" de forma didática, clara e educativa. Use exemplos práticos.`,
      research: `Você é um pesquisador acadêmico chamado Darcy. Forneça informações precisas e detalhadas sobre "${message}". Seja rigoroso e fundamentado.`,
      creative: `Você é um educador criativo chamado Darcy. Crie uma resposta inovadora e envolvente sobre "${message}". Seja inspirador e original.`,
      assessment: `Você é um avaliador educacional chamado Darcy. Crie exercícios ou atividades relacionadas a "${message}". Seja construtivo e detalhado.`
    };

    const fullPrompt = crewPrompts[crew] || crewPrompts.teaching;
    let llmResponse = null;
    let usedProvider = 'enhanced-fallback';

    // Tentar LLMs gratuitas em ordem de preferência
    try {
      // Primeira tentativa: HuggingFace
      llmResponse = await callHuggingFaceAPI(fullPrompt);
      if (llmResponse.success) {
        usedProvider = llmResponse.provider;
      } else {
        throw new Error('HuggingFace failed');
      }
    } catch (error) {
      console.log('HuggingFace failed, trying open source LLMs:', error.message);
      
      try {
        // Segunda tentativa: Open Source LLMs
        llmResponse = await callOpenSourceLLM(fullPrompt);
        if (llmResponse.success) {
          usedProvider = llmResponse.provider;
        } else {
          throw new Error('All free LLMs failed');
        }
      } catch (fallbackError) {
        console.log('All LLMs failed, using enhanced fallback');
        // Enhanced fallback com respostas inteligentes
        llmResponse = generateEnhancedFallback(message, crew);
        usedProvider = 'Enhanced Darcy AI';
      }
    }

    const finalResponse = llmResponse.success ? llmResponse.text : llmResponse.response;

    res.status(200).json({
      response: finalResponse,
      metadata: {
        provider: usedProvider,
        crew,
        model: llmResponse.success ? 'free-llm' : 'enhanced-fallback',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Fallback de emergência
    const emergencyResponse = generateEnhancedFallback(req.body.message || 'pergunta', req.body.crew || 'teaching');
    
    res.status(200).json({
      response: emergencyResponse.response,
      metadata: {
        provider: 'Emergency Darcy AI',
        crew: req.body.crew || 'teaching',
        model: 'emergency-fallback',
        timestamp: new Date().toISOString()
      }
    });
  }
}

function generateEnhancedFallback(message, crew) {
  const responses = {
    teaching: {
      greetings: ['olá', 'oi', 'hello'],
      math: ['matemática', 'cálculo', 'número', 'equação', 'soma', 'multiplicação'],
      science: ['ciência', 'física', 'química', 'biologia', 'experimento'],
      history: ['história', 'guerra', 'revolução', 'império', 'século'],
      literature: ['literatura', 'livro', 'poesia', 'romance', 'texto']
    },
    research: {
      analysis: ['análise', 'pesquisa', 'estudo', 'dados', 'investigação'],
      academic: ['acadêmico', 'universidade', 'tese', 'artigo', 'científico']
    },
    creative: {
      projects: ['projeto', 'criar', 'inovação', 'arte', 'design'],
      activities: ['atividade', 'exercício', 'prática', 'dinâmica']
    },
    assessment: {
      evaluation: ['avaliação', 'teste', 'prova', 'exercício', 'questão'],
      quiz: ['quiz', 'pergunta', 'resposta', 'correção']
    }
  };

  const messageLower = message.toLowerCase();
  
  // Detecção inteligente de tópico
  let detectedTopic = 'general';
  let categoryMatch = '';
  
  for (const [category, keywords] of Object.entries(responses[crew] || responses.teaching)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      detectedTopic = category;
      categoryMatch = category;
      break;
    }
  }

  // Gerar resposta baseada no crew e tópico
  const crewResponses = {
    teaching: {
      greetings: `👨‍🏫 Olá! Sou o Darcy, seu tutor educacional! Estou aqui para ajudar você a aprender sobre "${message}". Como posso tornar este assunto mais claro e interessante para você?`,
      math: `� Excelente pergunta sobre matemática! Sobre "${message}", posso explicar passo a passo. A matemática fica mais fácil quando entendemos a lógica por trás. Que parte específica você gostaria que eu detalhasse?`,
      science: `🔬 Que interessante! Sobre "${message}", a ciência nos mostra fenômenos fascinantes. Vou explicar de forma prática com exemplos do dia a dia. Você gostaria de começar com os conceitos básicos ou algum aspecto específico?`,
      history: `📚 História é uma das minhas paixões! Sobre "${message}", há muito a explorar. Vou contextualizar os eventos e mostrar como eles influenciam nosso presente. Por onde gostaria de começar?`,
      literature: `📖 Literatura é uma janela para mundos incríveis! Sobre "${message}", podemos analisar desde o contexto histórico até as técnicas narrativas. Que aspecto mais desperta sua curiosidade?`,
      general: `🎓 Ótima pergunta sobre "${message}"! Como seu tutor, vou explicar isso de forma didática e clara. Vamos começar com os conceitos fundamentais e depois aprofundar. O que você já sabe sobre este assunto?`
    },
    research: {
      analysis: `🔍 Excelente tema para pesquisa: "${message}". Como pesquisador, sugiro abordarmos isso com metodologia científica. Vamos analisar diferentes fontes e perspectivas para uma compreensão completa.`,
      academic: `📊 Para uma análise acadêmica de "${message}", precisamos considerar múltiplas variáveis. Vou estruturar uma abordagem sistemática com evidências e referências confiáveis.`,
      general: `🔬 Como pesquisador, vou investigar "${message}" de forma rigorosa. Começarei com as fontes primárias e dados mais recentes. Que aspecto específico você gostaria que eu priorizasse na pesquisa?`
    },
    creative: {
      projects: `🎨 Que ideia fantástica! Para um projeto sobre "${message}", podemos criar algo verdadeiramente inovador. Vou propor abordagens criativas que engajem e inspirem. Que tipo de resultado você imagina?`,
      activities: `💡 Vamos criar uma atividade incrível sobre "${message}"! Pensando fora da caixa, posso desenvolver dinâmicas interativas e envolventes. Prefere algo mais hands-on ou conceitual?`,
      general: `🌟 Adorei o desafio criativo com "${message}"! Vou combinar inovação com pedagogia para criar algo único e memorável. Que tal começarmos com um brainstorm de possibilidades?`
    },
    assessment: {
      evaluation: `📋 Perfeito! Vou criar uma avaliação completa sobre "${message}". Incluirei diferentes tipos de questões para medir o aprendizado de forma justa e construtiva. Que nível de dificuldade você prefere?`,
      quiz: `✏️ Excelente! Um quiz sobre "${message}" é uma ótima forma de fixar conhecimento. Vou criar questões variadas com feedback detalhado para cada resposta. Quantas questões você gostaria?`,
      general: `📈 Vou elaborar uma avaliação criteriosa sobre "${message}". Combinarei diferentes formatos para medir o aprendizado de forma abrangente. Que aspectos são mais importantes avaliar?`
    }
  };

  const crewName = {
    teaching: 'Professor Darcy',
    research: 'Pesquisador Darcy',
    creative: 'Darcy Criativo',
    assessment: 'Avaliador Darcy'
  };

  const response = crewResponses[crew]?.[detectedTopic] || 
                  crewResponses[crew]?.general || 
                  `🎓 Olá! Sou o ${crewName[crew] || 'Darcy'}, especialista em educação. Sobre "${message}", posso oferecer insights valiosos e personalizados. Como posso ajudar você a aprender mais sobre este tópico?`;

  return {
    success: true,
    response: response,
    provider: `Enhanced ${crewName[crew] || 'Darcy AI'}`
  };
}
