import express from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'missing_api_key' });

router.use(requireAuth);

// ─────────────────────────────────────────────
// GET /api/ai/sessions — list all sessions for the user
// ─────────────────────────────────────────────
router.get('/sessions', async (req: AuthRequest, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(sessions);
  } catch (error) {
    console.error('Fetch sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// ─────────────────────────────────────────────
// GET /api/ai/sessions/:id/messages — fetch messages for a session
// ─────────────────────────────────────────────
router.get('/sessions/:id/messages', async (req: AuthRequest, res) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session.messages);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/ai/sessions/:id — delete a session + all its messages
// ─────────────────────────────────────────────
router.delete('/sessions/:id', async (req: AuthRequest, res) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prisma.chatSession.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// ─────────────────────────────────────────────
// POST /api/ai/chat — send a message and get a reply, persisted to DB
// ─────────────────────────────────────────────
router.post('/chat', async (req: AuthRequest, res) => {
  try {
    const { messages, sessionId } = req.body as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      sessionId?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Validate existing session belongs to this user (if provided)
    if (sessionId) {
      const existing = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: req.userId },
      });
      if (!existing) {
        return res.status(404).json({ error: 'Session not found' });
      }
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

    // The last item in `messages` is the user's message
    const userContent = messages[messages.length - 1].content;
    const title = userContent.slice(0, 60) + (userContent.length > 60 ? '…' : '');

    // Persist to DB — create or update session
    let resolvedSessionId = sessionId;

    if (resolvedSessionId) {
      // Add only the new user message + AI reply to the existing session
      await prisma.chatMessage.createMany({
        data: [
          { sessionId: resolvedSessionId, role: 'user', content: userContent },
          { sessionId: resolvedSessionId, role: 'assistant', content: reply },
        ],
      });
      // Bump updatedAt
      await prisma.chatSession.update({
        where: { id: resolvedSessionId },
        data: { updatedAt: new Date() },
      });
    } else {
      // Create a brand-new session with all messages
      const session = await prisma.chatSession.create({
        data: {
          title,
          userId: req.userId!,
          messages: {
            create: [
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: 'assistant', content: reply },
            ],
          },
        },
      });
      resolvedSessionId = session.id;
    }

    res.json({ reply, sessionId: resolvedSessionId });
  } catch (error: any) {
    console.error('AI chat error:', error);
    if (error?.status === 401) {
      return res.status(500).json({ error: 'Invalid OpenAI API key. Check your OPENAI_API_KEY in server/.env' });
    }
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

export default router;
