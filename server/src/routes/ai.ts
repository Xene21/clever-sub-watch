import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import OpenAI from 'openai';

const router = express.Router();
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.use(requireAuth);

// POST /api/ai/chat
router.post('/chat', async (req: AuthRequest, res) => {
  try {
    const { messages } = req.body as {
      messages: { role: 'user' | 'assistant'; content: string }[];
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Fetch the user's real subscriptions to use as context
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.userId },
      orderBy: { price: 'desc' },
    });

    const totalMonthly = subscriptions.reduce((sum, sub) => {
      if (sub.billingCycle === 'monthly') return sum + sub.price;
      if (sub.billingCycle === 'yearly') return sum + sub.price / 12;
      if (sub.billingCycle === 'weekly') return sum + sub.price * 4.33;
      return sum;
    }, 0);

    const subscriptionContext = subscriptions.length > 0
      ? subscriptions.map(sub =>
          `- ${sub.name}: $${sub.price}/${sub.billingCycle} | category: ${sub.category || 'Uncategorised'} | status: ${sub.status} | next billing: ${sub.nextBillingDate ? sub.nextBillingDate.toISOString().split('T')[0] : 'unknown'}`
        ).join('\n')
      : 'No subscriptions found.';

    const systemPrompt = `You are SubPilot, a smart AI financial assistant. You are friendly, concise, and data-driven. While you specialize in subscription management, you are fully equipped to answer any general personal finance, budgeting, or money-management questions the user has.

The user's current subscriptions are provided below for context if needed:
${subscriptionContext}

Total estimated monthly subscription spend: $${totalMonthly.toFixed(2)} (≈ $${(totalMonthly * 12).toFixed(2)}/year)

Your job is to:
- Answer any general personal finance, budgeting, saving, or investing questions the user asks.
- If the user asks about their subscriptions: analyse them, spot patterns, identify savings (cheaper plans, bundles, duplicates), and flag price increases.
- Format responses clearly using markdown (headings, bullet points, bold).

Keep responses focused and actionable. Do not make up subscription data — only reference what is listed above if discussing their specific subscriptions.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';

    res.json({ reply });
  } catch (error: any) {
    console.error('AI chat error:', error);
    if (error?.status === 401) {
      return res.status(500).json({ error: 'Invalid OpenAI API key. Check your OPENAI_API_KEY in server/.env' });
    }
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

export default router;
