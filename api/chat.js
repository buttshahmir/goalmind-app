export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { messages, system } = req.body;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
'Authorization': 'Bearer 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',
        'HTTP-Referer': 'https://goalmind-app.vercel.app',
        'X-Title': 'GoalMind AI',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: system },
          ...messages
        ],
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data });
    const text = data.choices?.[0]?.message?.content || 'No response';
    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}
