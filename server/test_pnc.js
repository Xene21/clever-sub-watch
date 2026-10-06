require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function testSync() {
  const userId = '1d888b84-09db-4d10-b9cc-dfb29ee731aa';
  const quilttId = 'conn_134bDiqCqjwpZfhRiMdjUR';
  const profileId = 'p_134bMpuDjQMGnqGc8FO5E2';
  
  const apiSecret = process.env.QUILTT_API_SECRET;
  const encoded = Buffer.from(`${profileId}:${apiSecret}`).toString('base64');
  const authHeader = `Basic ${encoded}`;

  // 1. Fetch transactions directly from Quiltt to see what's failing
  const accountsQuery = `
    query GetAccounts($connectionId: ID!) {
      connection(id: $connectionId) { accounts { id } }
    }
  `;
  const accountsRes = await fetch('https://api.quiltt.io/v1/graphql', {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: accountsQuery, variables: { connectionId: quilttId } }),
  });
  const accountsJson = await accountsRes.json();
  console.log(accountsJson); if (accountsJson.errors) {
    console.log('GRAPHQL ERROR:', accountsJson.errors);
    return;
  }
  
  const all = [];
  const cutoffMs = Date.now() - 180 * 24 * 60 * 60 * 1000;
  for (const account of accountsJson.data.connection.accounts) {
    const query = `
      query GetTxs($accountId: ID!) {
        account(id: $accountId) {
          transactions(first: 100, filter: { entryType: DEBIT }) {
            nodes { id amount description date status merchant { name } }
          }
        }
      }
    `;
    const txRes = await fetch('https://api.quiltt.io/v1/graphql', {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { accountId: account.id } }),
    });
    const txJson = await txRes.json();
    if (txJson.errors) {
      console.log('TX ERROR:', txJson.errors);
      continue;
    }
    const nodes = txJson.data.account.transactions.nodes;
    for (const node of nodes) {
      all.push({
        transaction_id: node.id,
        merchant_name: node.merchant?.name ?? null,
        name: node.description ?? '',
        amount: Math.abs(node.amount),
        date: node.date,
        pending: node.status === 'PENDING',
        category: null
      });
    }
  }
  console.log(`Fetched ${all.length} transactions`);
  console.log(all.filter(t => t.name.toLowerCase().includes('apple')));
  
  // 2. Run engine
  const res = await runRecurringEngine(userId, all, 'cede6dea-27c3-4a22-a23e-0702a03e4b84');
  console.log('Engine result:', res);
}

testSync().catch(console.error).finally(() => prisma.$disconnect());
