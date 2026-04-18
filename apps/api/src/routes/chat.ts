import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env';

type ChatRole = 'user' | 'assistant';

type ChatHistoryItem = {
  role: ChatRole;
  content: string;
};

function getRuleBasedReply(input: string) {
  const normalized = input.toLowerCase();

  if (normalized.includes('help')) {
    return 'I can help with emergency support. You can ask me to track the ambulance, find nearest hospitals, or re-route.';
  }

  if (normalized.includes('track')) {
    return 'Go to the Tracking page to view the live ambulance marker, ETA countdown, and route progress.';
  }

  if (normalized.includes('nearest hospital')) {
    return 'Use the Dashboard view to see matched nearest hospitals. I can also help explain distance and ETA details.';
  }

  return null;
}

async function getOpenAiReply(message: string, history: ChatHistoryItem[]) {
  if (!env.OPENAI_API_KEY) {
    return {
      source: 'fallback',
      reply:
        'OpenAI is not configured yet. Add OPENAI_API_KEY in apps/api/.env to enable advanced emergency assistance.',
    } as const;
  }

  const systemPrompt =
    'You are ResQRoute emergency assistance AI. Be concise, practical, calm, and safety-focused. Help with ambulance tracking, nearest hospitals, rerouting, and emergency triage guidance. Do not provide harmful instructions.';

  const payload = {
    model: env.OPENAI_MODEL ?? 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history.map((item) => ({ role: item.role, content: item.content })),
      { role: 'user', content: message },
    ],
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API request failed with ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return {
      source: 'fallback',
      reply: 'I could not generate a response right now. Please try again in a moment.',
    } as const;
  }

  return {
    source: 'openai',
    reply,
  } as const;
}

const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z.string().max(4000).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      }),
    )
    .max(12)
    .optional(),
});

const chatRouter = Router();

chatRouter.post('/', async (req, res, next) => {
  try {
    const payload = chatRequestSchema.parse(req.body);

    const ruleReply = getRuleBasedReply(payload.message);
    if (ruleReply) {
      return res.json({
        source: 'rule',
        reply: ruleReply,
      });
    }

    const historyWithContext: ChatHistoryItem[] = payload.context
      ? [
          {
            role: 'assistant',
            content: `Emergency context: ${payload.context}`,
          },
          ...(payload.history ?? []),
        ]
      : (payload.history ?? []);

    const aiResponse = await getOpenAiReply(payload.message, historyWithContext);
    return res.json(aiResponse);
  } catch (error) {
    return next(error);
  }
});

export { chatRouter };
