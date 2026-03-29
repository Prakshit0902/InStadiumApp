import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
  try {
    const { message, stadiumName } = req.body ?? {};

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        reply: `I'm your assistant for ${stadiumName}. I can help you with venue history, seating, and match schedules!`,
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful sports stadium guide for ${stadiumName}. Provide detailed information about its history, seating arrangements, food options, and match day tips. Keep responses concise and engaging.`,
        },
        {
          role: 'user',
          content: String(message ?? ''),
        },
      ],
    });

    const reply = response.choices[0]?.message?.content ?? 'No response available.';

    return res.json({ reply });
  } catch (error) {
    console.error('POST /api/chat failed:', error);
    return res.status(500).json({ error: 'Failed to process chat' });
  }
});

export default router;
