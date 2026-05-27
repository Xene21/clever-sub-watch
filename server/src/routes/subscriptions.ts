import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all subscriptions (Currently gets all subscriptions. In a real app, filter by userId from auth token)
router.get('/', async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Map Prisma models to match frontend expected Subscription format
    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      merchant: sub.name,
      logo: sub.logo || '📦',
      amount: sub.price,
      frequency: sub.billingCycle,
      nextBillingDate: sub.nextBillingDate ? sub.nextBillingDate.toISOString().split('T')[0] : sub.startDate.toISOString().split('T')[0],
      status: sub.status,
      category: sub.category || 'Other',
      color: sub.color || '#000000',
      startDate: sub.startDate.toISOString().split('T')[0],
      history: [] // We don't have history in DB yet, so return empty array
    }));

    res.json(formattedSubscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Create a new subscription
router.post('/', async (req, res) => {
  try {
    const { merchant, logo, amount, frequency, nextBillingDate, status, category, color, userId } = req.body;
    
    // Default userId for testing if not provided (should come from auth token)
    // Actually, looking at the schema, userId is required. Let's assume it's passed or we fetch a user.
    // Let's find any user to associate with if userId is missing just for testing purposes.
    let targetUserId = userId;
    if (!targetUserId) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        return res.status(400).json({ error: 'No users found in database to associate subscription' });
      }
      targetUserId = firstUser.id;
    }

    const newSub = await prisma.subscription.create({
      data: {
        name: merchant,
        logo: logo,
        price: amount,
        billingCycle: frequency,
        nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : null,
        status: status || 'active',
        category: category,
        color: color,
        userId: targetUserId
      }
    });

    res.status(201).json(newSub);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Update a subscription
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { merchant, logo, amount, frequency, nextBillingDate, status, category, color } = req.body;
    
    const updatedSub = await prisma.subscription.update({
      where: { id },
      data: {
        ...(merchant && { name: merchant }),
        ...(logo && { logo }),
        ...(amount !== undefined && { price: amount }),
        ...(frequency && { billingCycle: frequency }),
        ...(nextBillingDate !== undefined && { nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : null }),
        ...(status && { status }),
        ...(category && { category }),
        ...(color && { color }),
      }
    });
    
    res.json(updatedSub);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Delete a subscription
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.subscription.delete({
      where: { id }
    });
    
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

export default router;
