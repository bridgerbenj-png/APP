import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt, apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key required. Add it in Settings.' });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });
    res.json({ content: response.content[0].text });
  } catch (err) {
    const message = err?.error?.error?.message ?? err.message ?? 'API call failed';
    res.status(500).json({ error: message });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
