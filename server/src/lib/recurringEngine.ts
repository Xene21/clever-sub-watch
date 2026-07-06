import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PlaidTransaction {
  transaction_id: string;
  merchant_name: string | null;
  name: string;
  amount: number;        // Plaid: positive = debit (money out)
  date: string;          // YYYY-MM-DD
  category: string[] | null;
  pending: boolean;
}

interface DetectedSubscription {
  name: string;
  amount: number;
  billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  billingCycleDay: number;
  lastBillingDate: Date;
  nextBillingDate: Date;
  category: string | null;
  plaidTransactionId: string;
  transactions: PlaidTransaction[];
}

// ─────────────────────────────────────────────
// Known merchant → category map
// Mirrors the categories in src/lib/brands.ts so the server can resolve
// a meaningful category without importing a frontend module.
// Priority: merchant dict → Plaid raw category → 'Other'
// ─────────────────────────────────────────────
const MERCHANT_CATEGORIES: Record<string, string> = {
  // Streaming
  netflix: 'Streaming', hulu: 'Streaming', disney: 'Streaming', 'disney+': 'Streaming',
  'hbo max': 'Streaming', max: 'Streaming', paramount: 'Streaming', 'paramount+': 'Streaming',
  peacock: 'Streaming', 'apple tv': 'Streaming', 'apple tv+': 'Streaming',
  'amazon prime': 'Streaming', 'prime video': 'Streaming',
  youtube: 'Streaming', 'youtube premium': 'Streaming', twitch: 'Streaming',
  crunchyroll: 'Streaming', 'discovery+': 'Streaming', dazn: 'Streaming',
  mubi: 'Streaming', 'now tv': 'Streaming', nowtv: 'Streaming',
  'sky go': 'Streaming', sky: 'Streaming', 'bbc iplayer': 'Streaming', bbc: 'Streaming',
  britbox: 'Streaming', shudder: 'Streaming', plex: 'Streaming',
  // Music
  spotify: 'Music', 'apple music': 'Music', 'amazon music': 'Music',
  tidal: 'Music', deezer: 'Music', soundcloud: 'Music', pandora: 'Music',
  // Gaming
  xbox: 'Gaming', 'xbox game pass': 'Gaming', playstation: 'Gaming',
  'playstation plus': 'Gaming', 'ps plus': 'Gaming', nintendo: 'Gaming',
  'nintendo switch': 'Gaming', 'ea play': 'Gaming', steam: 'Gaming',
  'epic games': 'Gaming', 'epic games store': 'Gaming',
  // Productivity
  microsoft: 'Productivity', 'microsoft 365': 'Productivity', 'office 365': 'Productivity',
  adobe: 'Productivity', 'creative cloud': 'Productivity', figma: 'Productivity',
  notion: 'Productivity', slack: 'Productivity', zoom: 'Productivity',
  dropbox: 'Productivity', github: 'Productivity', grammarly: 'Productivity',
  evernote: 'Productivity', todoist: 'Productivity', trello: 'Productivity',
  asana: 'Productivity', monday: 'Productivity', canva: 'Productivity',
  webflow: 'Productivity', squarespace: 'Productivity', wix: 'Productivity',
  wordpress: 'Productivity', shopify: 'Productivity', intercom: 'Productivity',
  hubspot: 'Productivity', mailchimp: 'Productivity', zapier: 'Productivity',
  'google workspace': 'Productivity', apple: 'Productivity', linear: 'Productivity',
  jira: 'Productivity', confluence: 'Productivity', atlassian: 'Productivity',
  jetbrains: 'Productivity', autocad: 'Productivity',
  // AI Tools
  'github copilot': 'AI Tools', chatgpt: 'AI Tools', openai: 'AI Tools',
  'claude ai': 'AI Tools', anthropic: 'AI Tools',
  // Cloud Storage
  google: 'Cloud Storage', 'google one': 'Cloud Storage', aws: 'Cloud Storage',
  icloud: 'Cloud Storage', digitalocean: 'Cloud Storage', heroku: 'Cloud Storage',
  vercel: 'Cloud Storage',
  // Security
  '1password': 'Security', lastpass: 'Security', bitwarden: 'Security',
  nordvpn: 'Security', expressvpn: 'Security', surfshark: 'Security',
  dashlane: 'Security', mcafee: 'Security', norton: 'Security',
  kaspersky: 'Security', avast: 'Security', malwarebytes: 'Security',
  // Finance
  monzo: 'Finance', revolut: 'Finance', paypal: 'Finance', coinbase: 'Finance',
  klarna: 'Finance', transferwise: 'Finance', wise: 'Finance', stripe: 'Finance',
  quickbooks: 'Finance', xero: 'Finance',
  // Fitness
  peloton: 'Fitness', strava: 'Fitness', headspace: 'Fitness', calm: 'Fitness',
  myfitnesspal: 'Fitness', whoop: 'Fitness', noom: 'Fitness',
  'the gym group': 'Fitness', 'pure gym': 'Fitness', puregym: 'Fitness',
  'david lloyd': 'Fitness', 'virgin active': 'Fitness',
  // Food & Drink
  hellofresh: 'Food & Drink', 'hello fresh': 'Food & Drink',
  deliveroo: 'Food & Drink', 'uber eats': 'Food & Drink',
  doordash: 'Food & Drink', 'just eat': 'Food & Drink',
  starbucks: 'Food & Drink', mcdonalds: 'Food & Drink', "mcdonald's": 'Food & Drink',
  'burger king': 'Food & Drink', burgerking: 'Food & Drink', kfc: 'Food & Drink',
  dominos: 'Food & Drink', "domino's": 'Food & Drink',
  'pizza hut': 'Food & Drink', pizzahut: 'Food & Drink',
  subway: 'Food & Drink', chipotle: 'Food & Drink', 'five guys': 'Food & Drink',
  nandos: 'Food & Drink', "nando's": 'Food & Drink', greggs: 'Food & Drink',
  pret: 'Food & Drink', 'pret a manger': 'Food & Drink', wagamama: 'Food & Drink',
  leon: 'Food & Drink', 'costa coffee': 'Food & Drink', costa: 'Food & Drink',
  'tim hortons': 'Food & Drink', 'shake shack': 'Food & Drink',
  'papa johns': 'Food & Drink', "papa john's": 'Food & Drink',
  'taco bell': 'Food & Drink', tacobell: 'Food & Drink',
  dunkin: 'Food & Drink', "dunkin'": 'Food & Drink', wetherspoons: 'Food & Drink',
  // News & Reading
  'new york times': 'News & Reading', medium: 'News & Reading',
  substack: 'News & Reading', kindle: 'News & Reading', audible: 'News & Reading',
  // Education
  duolingo: 'Education', coursera: 'Education', skillshare: 'Education',
  udemy: 'Education', linkedin: 'Education', 'linkedin premium': 'Education',
  masterclass: 'Education', 'khan academy': 'Education',
  // Transport
  uber: 'Transport', lyft: 'Transport', 'national rail': 'Transport', tfl: 'Transport',
  // Telecom
  'at&t': 'Telecom', att: 'Telecom', verizon: 'Telecom',
  't-mobile': 'Telecom', tmobile: 'Telecom', o2: 'Telecom',
  vodafone: 'Telecom', ee: 'Telecom', three: 'Telecom', sprint: 'Telecom',
  mintmobile: 'Telecom', 'mint mobile': 'Telecom',
  // Shopping
  amazon: 'Shopping', walmart: 'Shopping', 'walmart+': 'Shopping',
  costco: 'Shopping', target: 'Shopping', asos: 'Shopping',
  instacart: 'Shopping', shipt: 'Shopping', chewy: 'Shopping',
  ebay: 'Shopping', etsy: 'Shopping',
  // Social & Dating
  tinder: 'Social & Dating', bumble: 'Social & Dating', hinge: 'Social & Dating',
  okcupid: 'Social & Dating', match: 'Social & Dating', 'match.com': 'Social & Dating',
  patreon: 'Social & Dating', onlyfans: 'Social & Dating',
  'youtube channel': 'Social & Dating', kickstarter: 'Social & Dating',
  gofundme: 'Social & Dating',
};

/**
 * Resolve a category for a merchant name.
 * 1. Exact match against the merchant dictionary.
 * 2. Partial match (dictionary key contained in merchant name, or vice versa).
 * 3. Fall back to the Plaid category string.
 * 4. Default to 'Other'.
 */
function resolveMerchantCategory(merchantName: string, plaidCategory: string | null): string {
  const normalized = merchantName.toLowerCase()
    .replace(/\*.*$/, '')
    .replace(/\.(com|net|org|io)$/, '')
    .replace(/[^a-z0-9 '&-]/g, '')
    .trim();

  // 1. Exact match
  if (MERCHANT_CATEGORIES[normalized]) return MERCHANT_CATEGORIES[normalized];

  // 2. Partial match
  for (const key of Object.keys(MERCHANT_CATEGORIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return MERCHANT_CATEGORIES[key];
    }
  }

  // 3. Plaid category fallback
  if (plaidCategory) {
    return plaidCategory.charAt(0).toUpperCase() + plaidCategory.slice(1).toLowerCase();
  }

  // 4. Ultimate fallback
  return 'Other';
}


function normalizeMerchant(name: string): string {
  return name
    .toLowerCase()
    .replace(/\*.*$/, '')          // Remove everything after * (e.g. "NETFLIX*1")
    .replace(/\.(com|net|org|io)$/, '') // Strip TLDs
    .replace(/[^a-z0-9 ]/g, '')   // Strip special chars
    .trim();
}

// ─────────────────────────────────────────────
// Fuzzy match: returns true if two merchant names are similar
// ─────────────────────────────────────────────
function isSimilarMerchant(a: string, b: string): boolean {
  const na = normalizeMerchant(a);
  const nb = normalizeMerchant(b);
  if (na === nb) return true;
  // Prefix match (e.g. "amazon" vs "amazon prime")
  if (na.startsWith(nb) || nb.startsWith(na)) return true;
  return false;
}

// ─────────────────────────────────────────────
// Detect billing cycle from gaps between transaction dates (in days)
// ─────────────────────────────────────────────
function detectCycle(gaps: number[]): 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null {
  if (gaps.length === 0) return null;
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;

  if (avg >= 6 && avg <= 8) return 'weekly';
  if (avg >= 28 && avg <= 35) return 'monthly';
  if (avg >= 85 && avg <= 100) return 'quarterly';
  if (avg >= 300 && avg <= 380) return 'yearly';
  return null;
}

// ─────────────────────────────────────────────
// Compute next billing date from last date + cycle
// ─────────────────────────────────────────────
function computeNextBillingDate(lastDate: Date, cycle: string): Date {
  const next = new Date(lastDate);
  switch (cycle) {
    case 'weekly':     next.setDate(next.getDate() + 7);   break;
    case 'monthly':    next.setMonth(next.getMonth() + 1); break;
    case 'quarterly':  next.setMonth(next.getMonth() + 3); break;
    case 'yearly':     next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
}

// ─────────────────────────────────────────────
// Main recurring engine
// ─────────────────────────────────────────────
export async function runRecurringEngine(
  userId: string,
  transactions: PlaidTransaction[],
  plaidItemId: string
): Promise<{ detected: number; updated: number }> {

  // 1. Filter out pending and refund (negative amount) transactions
  const debits = transactions.filter(
    t => !t.pending && t.amount > 0
  );

  // 2. Group by normalized merchant name
  const groups = new Map<string, PlaidTransaction[]>();

  for (const tx of debits) {
    const rawName = tx.merchant_name || tx.name;
    const normalized = normalizeMerchant(rawName);

    // Try to find an existing group with a similar name
    let matched = false;
    for (const [key] of groups) {
      if (isSimilarMerchant(key, normalized)) {
        groups.get(key)!.push(tx);
        matched = true;
        break;
      }
    }
    if (!matched) {
      groups.set(normalized, [tx]);
    }
  }

  let detected = 0;
  let updated = 0;

  for (const [, txGroup] of groups) {
    // Need at least 2 transactions to identify a recurring pattern
    if (txGroup.length < 2) continue;

    // Sort chronologically
    const sorted = txGroup.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Compute gaps in days between consecutive transactions
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const diff =
        (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) /
        (1000 * 60 * 60 * 24);
      gaps.push(Math.round(diff));
    }

    const cycle = detectCycle(gaps);
    if (!cycle) continue; // Not a recognizable recurring pattern

    // Check amount consistency (allow <5% variance per PRD Section 7)
    const amounts = sorted.map(t => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const allConsistent = amounts.every(
      a => Math.abs(a - avgAmount) / avgAmount < 0.05
    );
    if (!allConsistent) continue;

    // Extract subscription metadata
    const latest = sorted[sorted.length - 1];
    const lastBillingDate = new Date(latest.date);
    const nextBillingDate = computeNextBillingDate(lastBillingDate, cycle);
    const billingCycleDay = lastBillingDate.getDate();
    const merchantName = latest.merchant_name || latest.name;

    // Map Plaid category → our category, with brand dictionary taking priority
    const rawCategory = latest.category?.[0] ?? null;
    const category = resolveMerchantCategory(merchantName, rawCategory);


    const existing = await prisma.subscription.findFirst({
      where: {
        userId,
        name: { equals: merchantName, mode: 'insensitive' },
        detectionSource: 'plaid',
      },
    });

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          price: avgAmount,
          billingCycle: cycle,
          billingCycleDay,
          lastBillingDate,
          nextBillingDate,
          plaidTransactionId: latest.transaction_id,
          // NOTE: intentionally NOT updating plaidItemId — the subscription
          // stays linked to whichever bank originally detected it.
        },
      });
      updated++;
    } else {
      detected++; // only count genuinely new subscriptions
      await prisma.subscription.create({
        data: {
          userId,
          name: merchantName,
          price: avgAmount,
          currency: 'USD',
          billingCycle: cycle,
          billingCycleDay,
          startDate: new Date(sorted[0].date),
          lastBillingDate,
          nextBillingDate,
          category,
          status: 'active',
          detectionSource: 'plaid',
          plaidTransactionId: latest.transaction_id,
          plaidItemId,
        },
      });
    }
  }

  return { detected, updated };
}
