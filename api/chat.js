// Vercel Serverless Function - Chat API
import https from 'https';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Fallback free LLM endpoints
const FREE_LLM_ENDPOINTS = [
  'https://api.groq.com/openai/v1/chat/completions'
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
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Invalid JSON response', raw: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
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
    const { message, crew = 'teaching', provider = 'groq' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Crew personalities
    const crewPrompts = {
      teaching: `Você é um professor dedicado e didático. Explique conceitos de forma clara, use exemplos práticos e sempre incentive o aprendizado. Seja paciente e adapte sua linguagem ao nível do estudante.`,
      research: `Você é um pesquisador acadêmico rigoroso. Forneça informações precisas, cite fontes quando possível e ajude a desenvolver pensamento crítico. Seja objetivo e fundamentado.`,
      creative: `Você é um educador criativo e inovador. Proponha projetos interessantes, atividades envolventes e abordagens não convencionais para o aprendizado. Seja inspirador e original.`,
      assessment: `Você é um avaliador educacional construtivo. Crie exercícios, testes e atividades para verificar o conhecimento. Forneça feedback detalhado e sugestões de melhoria.`
    };

    const systemPrompt = crewPrompts[crew] || crewPrompts.teaching;

    // Try Groq first (free tier)
    const groqPayload = {
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    };

    let response;
    let usedProvider = 'groq';

    try {
      // Groq API call
      const groqOptions = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groqPayload)
      };

      if (GROQ_API_KEY) {
        const groqResponse = await makeRequest(GROQ_API_URL, groqOptions);
        
        if (groqResponse.choices && groqResponse.choices[0]) {
          response = groqResponse.choices[0].message.content;
        } else {
          throw new Error('Invalid response from Groq');
        }
      } else {
        throw new Error('No Groq API key available');
      }
      
    } catch (groqError) {
      console.log('Groq failed, using fallback:', groqError.message);
      
      // Fallback response
      usedProvider = 'fallback';
      response = `Olá! Sou o Darcy AI, seu tutor educacional. 

${crew === 'teaching' ? '👨‍🏫 Como seu professor,' : 
  crew === 'research' ? '🔍 Como pesquisador,' : 
  crew === 'creative' ? '🎨 Como educador criativo,' : 
  '📋 Como avaliador,'} estou aqui para ajudar com "${message}".

Atualmente estou operando em modo básico. Para funcionalidade completa, configure uma API key do Groq (gratuita) ou outro provedor.

Como posso ajudar você a aprender mais sobre este tópico?`;
    }

    res.status(200).json({
      response,
      metadata: {
        provider: usedProvider,
        crew,
        model: usedProvider === 'groq' ? 'llama3-8b-8192' : 'fallback',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
