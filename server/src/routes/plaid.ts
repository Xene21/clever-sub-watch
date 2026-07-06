import express from 'express';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
  Transaction,
} from 'plaid';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { encrypt, decrypt } from '../lib/encryption';
import { runRecurringEngine } from '../lib/recurringEngine';

const router = express.Router();

const plaidEnv = (process.env.PLAID_ENV || 'sandbox') as keyof typeof PlaidEnvironments;
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[plaidEnv],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

router.use(requireAuth);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/plaid/create-link-token
// Creates a Plaid Link token for the frontend to open the Link UI
// ─────────────────────────────────────────────────────────────────────────────
router.post('/create-link-token', async (req: AuthRequest, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: req.userId! },
      client_name: 'SubPilot',
      products: [Products.Transactions],
      country_codes: [CountryCode.Gb, CountryCode.Us],
      language: 'en',
    });

    res.json({ link_token: response.data.link_token });
  } catch (error: any) {
    console.error('Plaid create-link-token error:', error?.response?.data || error);
    res.status(500).json({ error: 'Failed to create Plaid link token' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/plaid/exchange-token
// Exchanges the public_token from Plaid Link for an access_token,
// stores it encrypted in PlaidItem, then runs an initial transaction sync
// ─────────────────────────────────────────────────────────────────────────────
router.post('/exchange-token', async (req: AuthRequest, res) => {
  try {
    const { public_token, institution_name, institution_id } = req.body;

    if (!public_token) {
      return res.status(400).json({ error: 'public_token is required' });
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const { access_token, item_id } = exchangeResponse.data;

    // Encrypt access token before storing (PRD Section 5.1)
    const encryptedToken = encrypt(access_token);

    // Store PlaidItem in DB
    const plaidItem = await prisma.plaidItem.create({
      data: {
        accessToken: encryptedToken,
        itemId: item_id,
        institutionName: institution_name || null,
        institutionId: institution_id || null,
        userId: req.userId!,
      },
    });

    // Run initial sync immediately after connection
    const transactions = await fetchAllTransactions(access_token);
    // Normalize Plaid transactions to our internal type
    const normalized = transactions.map(t => ({
      ...t,
      merchant_name: t.merchant_name ?? null,
      category: t.category ?? null,
    }));
    const { detected } = await runRecurringEngine(req.userId!, normalized, plaidItem.id);

    await prisma.plaidItem.update({
      where: { id: plaidItem.id },
      data: { lastSyncedAt: new Date() },
    });

    res.json({
      success: true,
      itemId: plaidItem.id,
      institutionName: institution_name,
      subscriptionsDetected: detected,
    });
  } catch (error: any) {
    console.error('Plaid exchange-token error:', error?.response?.data || error);
    res.status(500).json({ error: 'Failed to connect bank account' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/plaid/sync
// Re-syncs transactions for a given PlaidItem and re-runs the recurring engine
// ─────────────────────────────────────────────────────────────────────────────
router.post('/sync', async (req: AuthRequest, res) => {
  try {
    const { itemId } = req.body;

    const plaidItem = await prisma.plaidItem.findFirst({
      where: { id: itemId, userId: req.userId },
    });

    if (!plaidItem) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    const accessToken = decrypt(plaidItem.accessToken);
    const transactions = await fetchAllTransactions(accessToken);
    // Normalize Plaid transactions to our internal type
    const normalized = transactions.map(t => ({
      ...t,
      merchant_name: t.merchant_name ?? null,
      category: t.category ?? null,
    }));
    const { detected, updated } = await runRecurringEngine(req.userId!, normalized, plaidItem.id);

    await prisma.plaidItem.update({
      where: { id: plaidItem.id },
      data: { lastSyncedAt: new Date() },
    });

    res.json({
      success: true,
      transactionsFetched: transactions.length,
      subscriptionsDetected: detected,
      subscriptionsUpdated: updated,
    });
  } catch (error: any) {
    console.error('Plaid sync error:', error?.response?.data || error);
    res.status(500).json({ error: 'Failed to sync transactions' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/plaid/items
// Returns all connected bank accounts for the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
router.get('/items', async (req: AuthRequest, res) => {
  try {
    const items = await prisma.plaidItem.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        institutionName: true,
        institutionId: true,
        lastSyncedAt: true,
        createdAt: true,
        _count: {
          select: { subscriptions: true }
        }
      },
    });

    res.json(items.map(item => {
      const { _count, ...rest } = item;
      return { ...rest, subscriptionsDetected: _count.subscriptions };
    }));
  } catch (error) {
    console.error('Plaid get-items error:', error);
    res.status(500).json({ error: 'Failed to fetch bank accounts' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/plaid/items/:id
// Disconnects a bank account — removes item from DB and revokes Plaid token
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/items/:id', async (req: AuthRequest, res) => {
  try {
    const plaidItem = await prisma.plaidItem.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!plaidItem) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    // Revoke Plaid access token
    try {
      const accessToken = decrypt(plaidItem.accessToken);
      await plaidClient.itemRemove({ access_token: accessToken });
    } catch (revokeErr) {
      console.warn('Failed to revoke Plaid token (continuing with DB delete):', revokeErr);
    }

    await prisma.plaidItem.delete({ where: { id: plaidItem.id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Plaid disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect bank account' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper: fetch up to 24 months of transactions from Plaid
// ─────────────────────────────────────────────────────────────────────────────
async function fetchAllTransactions(accessToken: string): Promise<Transaction[]> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]; // 2 years back

  let allTransactions: Transaction[] = [];
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: { count: 500, offset },
    });

    allTransactions = allTransactions.concat(response.data.transactions);
    hasMore = allTransactions.length < response.data.total_transactions;
    offset = allTransactions.length;
  }

  return allTransactions;
}

export default router;
