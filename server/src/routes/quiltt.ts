import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { runRecurringEngine } from '../lib/recurringEngine';

const router = express.Router();
const prisma = new PrismaClient();

const QUILTT_API_URL = 'https://api.quiltt.io/v1/graphql';
const QUILTT_AUTH_URL = 'https://auth.quiltt.io/v1/users/sessions';

router.use(requireAuth);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quiltt/session
// Mints a short-lived Quiltt session token for the current user.
// The frontend passes this token to QuilttProvider so it can open the
// Connector and query transactions client-side.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/session', async (req: AuthRequest, res) => {
  try {
    const apiSecret = process.env.QUILTT_API_SECRET;
    if (!apiSecret) {
      return res.status(500).json({ error: 'Quiltt API secret not configured' });
    }

    // Look up (or lazily create) this user's Quiltt profile ID
    let user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const body: Record<string, string> = {};
    // If we already have a Quiltt profile ID, scope the session to it.
    // Otherwise send an empty body — Quiltt will auto-create a new profile.
    if (user.quilttProfileId) {
      body.profileId = user.quilttProfileId;
    }

    const authRes = await fetch(QUILTT_AUTH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!authRes.ok) {
      const err = await authRes.text();
      console.error('Quiltt session error:', err);
      return res.status(500).json({ error: 'Failed to create Quiltt session' });
    }

    const { token, profileId } = await authRes.json() as { token: string; profileId: string };

    // Persist the profile ID if this is the first time
    if (!user.quilttProfileId && profileId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { quilttProfileId: profileId },
      });
    }

    res.json({ token });
  } catch (error) {
    console.error('Quiltt session error:', error);
    res.status(500).json({ error: 'Failed to create Quiltt session' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quiltt/connection
// Called by the frontend after the Quiltt Connector succeeds.
// Stores the new connection and triggers an initial transaction sync.
// Body: { connectionId, institutionName }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/connection', async (req: AuthRequest, res) => {
  try {
    const { connectionId, institutionName } = req.body;

    if (!connectionId) {
      return res.status(400).json({ error: 'connectionId is required' });
    }

    // Upsert: if somehow the same connection comes in twice, don't duplicate it
    const connection = await prisma.quilttConnection.upsert({
      where: { quilttId: connectionId },
      create: {
        quilttId: connectionId,
        institutionName: institutionName ?? null,
        userId: req.userId!,
      },
      update: {
        institutionName: institutionName ?? undefined,
      },
    });

    // Immediately sync transactions for this connection
    const transactions = await fetchQuilttTransactions(req.userId!, connectionId);
    const { detected } = await runRecurringEngine(req.userId!, transactions, connection.id);

    await prisma.quilttConnection.update({
      where: { id: connection.id },
      data: { lastSyncedAt: new Date() },
    });

    res.json({
      success: true,
      itemId: connection.id,
      institutionName: connection.institutionName,
      subscriptionsDetected: detected,
    });
  } catch (error) {
    console.error('Quiltt connection error:', error);
    res.status(500).json({ error: 'Failed to connect bank account' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quiltt/sync
// Re-syncs transactions for a given QuilttConnection and re-runs the engine.
// Body: { itemId }  (we keep the same key so the frontend doesn't need changes)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/sync', async (req: AuthRequest, res) => {
  try {
    const { itemId } = req.body;

    const connection = await prisma.quilttConnection.findFirst({
      where: { id: itemId, userId: req.userId },
    });

    if (!connection) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    const transactions = await fetchQuilttTransactions(req.userId!, connection.quilttId);
    const { detected, updated } = await runRecurringEngine(req.userId!, transactions, connection.id);

    await prisma.quilttConnection.update({
      where: { id: connection.id },
      data: { lastSyncedAt: new Date() },
    });

    res.json({
      success: true,
      transactionsFetched: transactions.length,
      subscriptionsDetected: detected,
      subscriptionsUpdated: updated,
    });
  } catch (error) {
    console.error('Quiltt sync error:', error);
    res.status(500).json({ error: 'Failed to sync transactions' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quiltt/items
// Returns all connected bank accounts for the logged-in user.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/items', async (req: AuthRequest, res) => {
  try {
    const items = await prisma.quilttConnection.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        institutionName: true,
        lastSyncedAt: true,
        createdAt: true,
        _count: { select: { subscriptions: true } },
      },
    });

    res.json(items.map(item => {
      const { _count, ...rest } = item;
      return { ...rest, subscriptionsDetected: _count.subscriptions };
    }));
  } catch (error) {
    console.error('Quiltt get-items error:', error);
    res.status(500).json({ error: 'Failed to fetch bank accounts' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/quiltt/items/:id
// Disconnects a bank account — removes the QuilttConnection from DB.
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/items/:id', async (req: AuthRequest, res) => {
  try {
    const connection = await prisma.quilttConnection.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!connection) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    await prisma.quilttConnection.delete({ where: { id: connection.id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Quiltt disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect bank account' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper: fetch up to 24 months of transactions via Quiltt's GraphQL API
// Quiltt uses cursor-based pagination; we page through until hasNextPage = false.
// ─────────────────────────────────────────────────────────────────────────────
interface QuilttTransaction {
  transaction_id: string;
  merchant_name: string | null;
  name: string;
  amount: number;      // positive = debit (money out)
  date: string;        // YYYY-MM-DD
  category: string[] | null;
  pending: boolean;
}

async function fetchQuilttTransactions(
  userId: string,
  quilttConnectionId: string
): Promise<QuilttTransaction[]> {
  const apiSecret = process.env.QUILTT_API_SECRET!;

  // We compute a 24-month date range to keep parity with the old Plaid helper
  const endDate   = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  const query = `
    query GetTransactions($after: String, $connectionId: ID!, $startDate: Date!, $endDate: Date!) {
      transactions(
        after: $after
        filter: {
          connectionId: $connectionId
          date: { gte: $startDate, lte: $endDate }
          entryType: DEBIT
        }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          amount
          description
          date
          status
          merchantName
          category
        }
      }
    }
  `;

  const all: QuilttTransaction[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(QUILTT_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          after: cursor,
          connectionId: quilttConnectionId,
          startDate,
          endDate,
        },
      }),
    });

    const json = await response.json() as any;

    if (json.errors) {
      console.error('Quiltt GraphQL error:', json.errors);
      break;
    }

    const { nodes, pageInfo } = json.data.transactions;

    for (const node of nodes) {
      all.push({
        transaction_id: node.id,
        merchant_name:  node.merchantName ?? null,
        name:           node.description ?? node.merchantName ?? '',
        amount:         Math.abs(node.amount),   // Quiltt debits may be negative
        date:           node.date,
        category:       node.category ? [node.category] : null,
        pending:        node.status === 'PENDING',
      });
    }

    hasMore = pageInfo.hasNextPage;
    cursor  = pageInfo.endCursor ?? null;
  }

  return all;
}

export default router;
