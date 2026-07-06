import express from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to ALL subscription routes
router.use(requireAuth);

// GET /api/subscriptions — only returns subscriptions belonging to the logged-in user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      merchant: sub.name,
      logo: sub.logo || '📦',
      amount: sub.price,
      frequency: sub.billingCycle,
      billingCycleDay: sub.billingCycleDay ?? null,
      startDate: sub.startDate.toISOString().split('T')[0],
      lastBillingDate: sub.lastBillingDate
        ? sub.lastBillingDate.toISOString().split('T')[0]
        : null,
      nextBillingDate: sub.nextBillingDate
        ? sub.nextBillingDate.toISOString().split('T')[0]
        : sub.startDate.toISOString().split('T')[0],
      status: sub.status,
      category: sub.category || 'Other',
      color: sub.color || '#000000',
      detectionSource: sub.detectionSource,
      plaidTransactionId: sub.plaidTransactionId ?? null,
      history: [],
    }));

    res.json(formattedSubscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// GET /api/subscriptions/:id — fetch a single subscription (for detail page)
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const sub = await prisma.subscription.findUnique({ where: { id } });

    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    if (sub.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    res.json({
      id: sub.id,
      merchant: sub.name,
      logo: sub.logo || '📦',
      color: sub.color || '#000000',
      amount: sub.price,
      frequency: sub.billingCycle,
      category: sub.category || 'Other',
      status: sub.status,
      startDate: sub.startDate.toISOString().split('T')[0],
      lastBillingDate: sub.lastBillingDate
        ? sub.lastBillingDate.toISOString().split('T')[0]
        : null,
      nextBillingDate: sub.nextBillingDate
        ? sub.nextBillingDate.toISOString().split('T')[0]
        : sub.startDate.toISOString().split('T')[0],
      detectionSource: sub.detectionSource,
      history: [], // history is computed client-side from billing cycle + dates
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// POST /api/subscriptions — userId is taken from the JWT token, not the request body
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      merchant, logo, amount, frequency, billingCycleDay,
      lastBillingDate, nextBillingDate, status, category, color,
      plaidTransactionId, detectionSource,
    } = req.body;

    if (!merchant || amount === undefined || !frequency) {
      return res.status(400).json({ error: 'Missing required fields: merchant, amount, frequency' });
    }

    const newSub = await prisma.subscription.create({
      data: {
        name: merchant,
        logo: logo ?? null,
        price: amount,
        billingCycle: frequency,
        billingCycleDay: billingCycleDay ?? null,
        lastBillingDate: lastBillingDate ? new Date(lastBillingDate) : null,
        nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : null,
        status: status || 'active',
        category: category ?? null,
        color: color ?? null,
        plaidTransactionId: plaidTransactionId ?? null,
        detectionSource: detectionSource || 'manual',
        userId: req.userId!,
      },
    });

    res.status(201).json(newSub);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// PUT /api/subscriptions/:id — only allows updating if the subscription belongs to the logged-in user
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      merchant, logo, amount, frequency, billingCycleDay,
      lastBillingDate, nextBillingDate, status, category, color,
      plaidTransactionId, detectionSource,
    } = req.body;

    // Ownership check
    const existing = await prisma.subscription.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    if (existing.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedSub = await prisma.subscription.update({
      where: { id },
      data: {
        ...(merchant && { name: merchant }),
        ...(logo !== undefined && { logo }),
        ...(amount !== undefined && { price: amount }),
        ...(frequency && { billingCycle: frequency }),
        ...(billingCycleDay !== undefined && { billingCycleDay: billingCycleDay ?? null }),
        ...(lastBillingDate !== undefined && {
          lastBillingDate: lastBillingDate ? new Date(lastBillingDate) : null,
        }),
        ...(nextBillingDate !== undefined && {
          nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : null,
        }),
        ...(status && { status }),
        ...(category !== undefined && { category }),
        ...(color !== undefined && { color }),
        ...(plaidTransactionId !== undefined && { plaidTransactionId: plaidTransactionId ?? null }),
        ...(detectionSource && { detectionSource }),
      },
    });

    res.json(updatedSub);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// DELETE /api/subscriptions/:id — only allows deletion if the subscription belongs to the logged-in user
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Ownership check
    const existing = await prisma.subscription.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    if (existing.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.subscription.delete({ where: { id } });

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

export default router;
