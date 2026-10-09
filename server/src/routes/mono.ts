import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { runRecurringEngine } from '../lib/recurringEngine';

const router = express.Router();
const prisma = new PrismaClient();
const MONO_SECRET = process.env.MONO_SECRET_KEY!;

router.use(requireAuth);

router.post('/exchange', async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    
    const exchangeRes = await fetch('https://api.withmono.com/account/auth', {
      method: 'POST',
      headers: { 
        'mono-sec-key': MONO_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });
    
    const exchangeData = await exchangeRes.json();
    if (!exchangeRes.ok || !exchangeData.id) {
      throw new Error('Failed to exchange code');
    }
    const accountId = exchangeData.id;

    // Fetch account details to get bank name
    const infoRes = await fetch(`https://api.withmono.com/accounts/${accountId}`, {
      headers: { 'mono-sec-key': MONO_SECRET }
    });
    const infoData = await infoRes.json();
    const instName = infoData?.account?.institution?.name || 'Mono Bank Account';

    const monoConn = await prisma.monoConnection.upsert({
      where: { monoId: accountId },
      create: {
        monoId: accountId,
        institutionName: instName,
        userId: req.userId!
      },
      update: {
        institutionName: instName
      }
    });

    res.json({ success: true, connectionId: monoConn.id });
  } catch (err) {
    console.error('Mono exchange error:', err);
    res.status(500).json({ error: 'Failed to process Mono connection' });
  }
});

export default router;
