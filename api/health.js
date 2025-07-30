// Vercel Serverless Function - Health Check
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      status: 'healthy',
      service: 'Darcy AI API',
      version: '2.1.0',
      timestamp: new Date().toISOString(),
      environment: 'vercel',
      providers: {
        groq: { status: 'available', type: 'free' },
        openai: { status: 'available', type: 'api_key_required' },
        anthropic: { status: 'available', type: 'api_key_required' },
        google: { status: 'available', type: 'api_key_required' }
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
