import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { runRecurringEngine } from '../lib/recurringEngine';

const router = express.Router();
const prisma = new PrismaClient();
const MONO_SECRET = process.env.MONO_SECRET_KEY!;

// ─────────────────────────────────────────────────────────────────────────────
// Realistic African & international recurring subscriptions for sandbox testing
// ─────────────────────────────────────────────────────────────────────────────
function getMonoSandboxMockTransactions() {
  const now = new Date();
  const createTx = (name: string, merchant: string, amount: number, daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return {
      transaction_id: `mono_mock_${merchant.toLowerCase()}_${daysAgo}`,
      merchant_name: merchant,
      name,
      amount,
      date: d.toISOString().split('T')[0],
      category: null,
      pending: false,
    };
  };

  return [
    // Netflix
    createTx('PAYSTACK* NETFLIX', 'Netflix', 15.99, 60),
    createTx('PAYSTACK* NETFLIX', 'Netflix', 15.99, 30),
    createTx('PAYSTACK* NETFLIX', 'Netflix', 15.99, 0),

    // Spotify
    createTx('FLW* SPOTIFY', 'Spotify', 10.99, 61),
    createTx('FLW* SPOTIFY', 'Spotify', 10.99, 31),
    createTx('FLW* SPOTIFY', 'Spotify', 10.99, 1),

    // Apple iCloud
    createTx('APPLE.COM/BILL', 'Apple', 2.99, 58),
    createTx('APPLE.COM/BILL', 'Apple', 2.99, 29),
    createTx('APPLE.COM/BILL', 'Apple', 2.99, 0),

    // ChatGPT Plus
    createTx('OPENAI CHATGPT', 'ChatGPT', 20.00, 32),
    createTx('OPENAI CHATGPT', 'ChatGPT', 20.00, 2),

    // Showmax / MultiChoice
    createTx('MULTICHOICE SHOWMAX', 'Showmax', 8.99, 64),
    createTx('MULTICHOICE SHOWMAX', 'Showmax', 8.99, 33),
    createTx('MULTICHOICE SHOWMAX', 'Showmax', 8.99, 2),
  ];
}

router.use(requireAuth);

router.post('/exchange', async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });

    // Step 1: Exchange the code for a permanent account ID (Mono v2)
    const exchangeRes = await fetch('https://api.withmono.com/v2/accounts/auth', {
      method: 'POST',
      headers: { 
        'mono-sec-key': MONO_SECRET,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({ code })
    });
    
    const exchangeData = await exchangeRes.json();
    console.log('[Mono] exchange response:', JSON.stringify(exchangeData));

    if (!exchangeRes.ok) {
      throw new Error(`Mono exchange failed: ${JSON.stringify(exchangeData)}`);
    }

    // v2 returns { data: { id: "account_id" }, ... }
    const accountId = exchangeData?.data?.id || exchangeData.id;
    if (!accountId) throw new Error('No account ID in Mono response');

    // Step 2: Fetch account details to get institution name
    const infoRes = await fetch(`https://api.withmono.com/v2/accounts/${accountId}`, {
      headers: { 
        'mono-sec-key': MONO_SECRET,
        'accept': 'application/json',
      }
    });
    const infoData = await infoRes.json();
    console.log('[Mono] account info:', JSON.stringify(infoData));

    // v2 response: { data: { account: { institution: { name: "Zenith Bank" } } } }
    const instName = infoData?.data?.account?.institution?.name 
      || infoData?.data?.institution?.name 
      || infoData?.account?.institution?.name 
      || 'African Bank';

    // Step 3: Save to database
    const monoConn = await prisma.monoConnection.upsert({
      where: { monoId: accountId },
      create: {
        monoId: accountId,
        institutionName: instName,
        userId: req.userId!,
        lastSyncedAt: new Date(),
      },
      update: {
        institutionName: instName,
        lastSyncedAt: new Date(),
      }
    });

    // Step 4: Immediately fetch transactions and run the recurring engine
    let detected = 0;
    try {
      const txRes = await fetch(`https://api.withmono.com/v2/accounts/${accountId}/transactions?limit=100`, {
        headers: {
          'mono-sec-key': MONO_SECRET,
          'accept': 'application/json',
        }
      });
      const txData = await txRes.json();
      const rawTxs = txData?.data ?? txData?.transactions ?? [];

      const transactions = rawTxs
        .filter((t: any) => t.type === 'debit' || t.amount < 0)
        .map((t: any) => ({
          transaction_id: t.id ?? t._id,
          merchant_name: t.narration ?? t.description ?? null,
          name: t.narration ?? t.description ?? 'Unknown',
          amount: Math.abs(t.amount / 100),
          date: t.date?.split('T')[0] ?? new Date().toISOString().split('T')[0],
          category: null,
          pending: false,
        }));

      // In Mono sandbox/test mode, augment with realistic recurring subscriptions
      if (MONO_SECRET?.startsWith('test_')) {
        transactions.push(...getMonoSandboxMockTransactions());
      }

      const result = await runRecurringEngine(req.userId!, transactions, undefined, monoConn.id);
      detected = result.detected;
      console.log(`[Mono] Engine finished for ${instName}: ${detected} subscription(s) detected.`);
    } catch (engineErr) {
      console.error('[Mono] Failed to run initial recurring engine:', engineErr);
    }

    res.json({ success: true, connectionId: monoConn.id, institutionName: instName, subscriptionsDetected: detected });
  } catch (err) {
    console.error('Mono exchange error:', err);
    res.status(500).json({ error: 'Failed to process Mono connection' });
  }
});

router.post('/sync', async (req: AuthRequest, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });

    const monoConn = await prisma.monoConnection.findFirst({
      where: { id: itemId, userId: req.userId! }
    });
    if (!monoConn) return res.status(404).json({ error: 'Mono connection not found' });

    // Fetch transactions from Mono v2
    const txRes = await fetch(`https://api.withmono.com/v2/accounts/${monoConn.monoId}/transactions?limit=100`, {
      headers: {
        'mono-sec-key': MONO_SECRET,
        'accept': 'application/json',
      }
    });

    const txData = await txRes.json();
    console.log('[Mono sync] transactions response status:', txRes.status);

    const rawTxs = txData?.data ?? txData?.transactions ?? [];

    // Map Mono transactions to the same shape the recurring engine expects
    const transactions = rawTxs
      .filter((t: any) => t.type === 'debit' || t.amount < 0)
      .map((t: any) => ({
        transaction_id: t.id ?? t._id,
        merchant_name: t.narration ?? t.description ?? null,
        name: t.narration ?? t.description ?? 'Unknown',
        amount: Math.abs(t.amount / 100), // Mono uses kobo
        date: t.date?.split('T')[0] ?? new Date().toISOString().split('T')[0],
        category: null,
        pending: false,
      }));

    // In Mono sandbox/test mode, augment with realistic recurring subscriptions
    if (MONO_SECRET?.startsWith('test_')) {
      transactions.push(...getMonoSandboxMockTransactions());
    }

    const { detected } = await runRecurringEngine(req.userId!, transactions, undefined, monoConn.id);

    await prisma.monoConnection.update({
      where: { id: monoConn.id },
      data: { lastSyncedAt: new Date() }
    });

    res.json({ success: true, detected, subscriptionsDetected: detected });
  } catch (err) {
    console.error('Mono sync error:', err);
    res.status(500).json({ error: 'Mono sync failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/mono/items/:id
// Disconnects a Mono bank account — removes the MonoConnection from DB.
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/items/:id', async (req: AuthRequest, res) => {
  try {
    const connection = await prisma.monoConnection.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!connection) {
      return res.status(404).json({ error: 'Mono bank account not found' });
    }

    const deleteSubs = req.query.deleteSubscriptions !== 'false';
    if (deleteSubs) {
      await prisma.subscription.deleteMany({
        where: {
          monoConnectionId: connection.id,
          userId: req.userId,
        },
      });
    }

    await prisma.monoConnection.delete({ where: { id: connection.id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Mono disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect bank account' });
  }
});

export default router;
