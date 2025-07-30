// Vercel Serverless Function - Crews Info
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const crews = {
      teaching: {
        name: 'Equipe de Ensino',
        description: 'Especializada em explicações didáticas e estruturadas',
        agents: ['👨‍🏫 Professor Principal', '📝 Criador de Exemplos', '🎯 Facilitador de Aprendizado'],
        specialization: 'Ensino estruturado e didático',
        icon: '👨‍🏫',
        examples: [
          'Explique a fotossíntese de forma didática',
          'Como funciona a matemática básica?',
          'Ensine-me sobre história do Brasil'
        ]
      },
      research: {
        name: 'Equipe de Pesquisa',
        description: 'Focada em análise acadêmica e informações verificáveis',
        agents: ['🔍 Pesquisador Senior', '📊 Analista de Dados', '✅ Verificador de Fontes'],
        specialization: 'Pesquisa acadêmica e análise',
        icon: '🔍',
        examples: [
          'Pesquise sobre inteligência artificial na educação',
          'Analise as tendências da educação moderna',
          'Fontes confiáveis sobre mudanças climáticas'
        ]
      },
      creative: {
        name: 'Equipe Criativa',
        description: 'Desenvolve projetos inovadores e atividades envolventes',
        agents: ['🎨 Designer Educacional', '💡 Inovador Pedagógico', '🛠️ Desenvolvedor de Projetos'],
        specialization: 'Criatividade e inovação pedagógica',
        icon: '🎨',
        examples: [
          'Crie um projeto sobre sustentabilidade',
          'Atividade criativa para ensinar química',
          'Jogo educativo sobre geografia'
        ]
      },
      assessment: {
        name: 'Equipe de Avaliação',
        description: 'Cria avaliações construtivas e feedback personalizado',
        agents: ['📋 Especialista em Avaliação', '✏️ Criador de Exercícios', '📈 Analista de Progresso'],
        specialization: 'Avaliação e feedback educacional',
        icon: '📋',
        examples: [
          'Crie um teste sobre matemática básica',
          'Avalie meu conhecimento em português',
          'Exercícios práticos de física'
        ]
      }
    };

    res.status(200).json({
      crews,
      total: Object.keys(crews).length,
      defaultCrew: 'teaching'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
