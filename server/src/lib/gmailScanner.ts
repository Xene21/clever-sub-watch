import { google } from 'googleapis';
import OpenAI from 'openai';
import { prisma } from './prisma';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

// Typed error so your API route can send a useful message to the frontend
export class SyncError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8');
}

function extractBody(payload: any): string {
  if (!payload) return '';

  if (payload.body?.data) {
    let text = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/html') {
      text = text
        .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<[^>]*>?/gm, ' ');
    }
    return text;
  }

  if (payload.parts?.length) {
    const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (plainPart) {
      const result = extractBody(plainPart);
      if (result) return result;
    }
    for (const part of payload.parts) {
      const result = extractBody(part);
      if (result) return result;
    }
  }
  return '';
}

function getEmailBody(message: any): string {
  return extractBody(message.payload).trim().replace(/\s+/g, ' ');
}

// Run async tasks with limited concurrency (avoids timeouts AND Gmail rate limits)
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

function describeGoogleError(err: any): SyncError {
  const msg = err?.response?.data?.error ?? err?.message ?? '';
  const status = err?.code ?? err?.response?.status;
  if (String(msg).includes('invalid_grant')) {
    return new SyncError(
      'GOOGLE_REAUTH',
      'Google access expired or was revoked. Please reconnect your Google account.'
    );
  }
  if (status === 403) {
    return new SyncError(
      'GOOGLE_SCOPE',
      'Missing Gmail permission (gmail.readonly) or Gmail API not enabled.'
    );
  }
  return new SyncError('GOOGLE_ERROR', `Gmail request failed: ${msg || err}`);
}

const VALID_CYCLES = new Set(['weekly', 'monthly', 'quarterly', 'yearly']);

// Extract the email Date header (falls back to internalDate epoch ms)
function getEmailDate(message: any): string | null {
  const headers: { name: string; value: string }[] = message.payload?.headers ?? [];
  const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date');
  if (dateHeader?.value) {
    const parsed = new Date(dateHeader.value);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  }
  if (message.internalDate) {
    const parsed = new Date(Number(message.internalDate));
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  }
  return null;
}

function computeNextDate(from: Date, cycle: string): Date {
  const next = new Date(from);
  switch (cycle) {
    case 'weekly':    next.setDate(next.getDate() + 7); break;
    case 'monthly':   next.setMonth(next.getMonth() + 1); break;
    case 'quarterly': next.setMonth(next.getMonth() + 3); break;
    case 'yearly':    next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
}

// Per-email AI classification — returns structured subscription data or null
async function classifyEmail(
  body: string,
  emailDate: string | null
): Promise<{
  name: string;
  price: number;
  billingCycle: string;
  category: string;
  startDate: string;
} | null> {
  const systemPrompt = `You are a subscription receipt detector. Given the text of a single email, decide if it is a receipt or confirmation for a RECURRING subscription charge.

Rules — the email MUST qualify ALL of the following to count:
1. It is a charge/payment confirmation (not a marketing email, promotional offer, sign-up welcome, or shipping notification).
2. It explicitly relates to a RECURRING charge — look for words like "subscription", "renewal", "auto-renewed", "next billing date", "recurring charge", "monthly plan", "annual plan", "billing cycle".
3. It includes a specific monetary amount charged (not just a price quote or future estimate).

One-time purchases, gift card purchases, order confirmations for physical goods, trial start emails (where no money was charged yet), and password reset/account emails do NOT qualify.

If the email qualifies, respond with ONLY this JSON object:
{"isSubscription": true, "name": "<merchant/service name>", "price": <amount charged in USD, as a number>, "billingCycle": "<weekly|monthly|quarterly|yearly>", "category": "<Streaming|Music|Gaming|Productivity|AI Tools|Cloud Storage|Security|Finance|Fitness|Food & Drink|News & Reading|Education|Telecom|Shopping|Other>"}

If it does not qualify, respond with ONLY:
{"isSubscription": false}`;

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: body.substring(0, 2500) },
      ],
    });
    const text = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(text);

    if (!parsed.isSubscription) return null;

    const name = typeof parsed.name === 'string' ? parsed.name.trim() : '';
    const price = Number(parsed.price);
    const cycle = String(parsed.billingCycle ?? '').toLowerCase();

    if (!name || !Number.isFinite(price) || price <= 0 || !VALID_CYCLES.has(cycle)) return null;

    return {
      name,
      price,
      billingCycle: cycle,
      category: typeof parsed.category === 'string' ? parsed.category : 'Other',
      startDate: emailDate ?? new Date().toISOString().split('T')[0],
    };
  } catch {
    return null;
  }
}

export async function scanUserEmails(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.googleRefreshToken) {
    throw new SyncError('NO_GOOGLE', 'User does not have a connected Google account');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });

  // Async listener must catch its own errors, or they become unhandled rejections
  oauth2Client.on('tokens', (tokens) => {
    const update: Record<string, string> = {};
    if (tokens.access_token) update.googleAccessToken = tokens.access_token;
    if (tokens.refresh_token) update.googleRefreshToken = tokens.refresh_token;
    if (Object.keys(update).length) {
      prisma.user
        .update({ where: { id: userId }, data: update })
        .catch((e) => console.error('[Gmail] Failed to persist tokens:', e));
    }
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Tight query: only subject lines that explicitly mention subscription/renewal/billing
  // Avoids pulling generic marketing, shipping, or one-time purchase emails
  const query =
    'newer_than:6m (' +
    'subject:"subscription" OR subject:"renewal" OR subject:"your receipt" OR ' +
    'subject:"billing confirmation" OR subject:"payment confirmation" OR ' +
    'subject:"invoice" OR subject:"auto-renew" OR subject:"recurring" OR ' +
    'subject:"plan renewed" OR subject:"plan renewal" OR subject:"membership renewed" OR ' +
    'subject:"membership renewal" OR subject:"charged" OR subject:"billing statement"' +
    ')';

  let messages: { id?: string | null }[] = [];
  try {
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 40,
    });
    messages = listRes.data.messages ?? [];
  } catch (err) {
    throw describeGoogleError(err);
  }

  if (messages.length === 0) return 0;

  console.log(`[Gmail] Found ${messages.length} candidate email(s) matching subscription query`);

  // Fetch full message details with limited concurrency to avoid rate limits
  const messageDetails = await mapWithConcurrency(messages, 5, async (msg) => {
    try {
      const res = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });
      return res.data;
    } catch (err) {
      console.warn(`[Gmail] Failed to fetch email ${msg.id}:`, err);
      return null;
    }
  });

  // Load existing subscription names for deduplication (case-insensitive)
  const existing = await prisma.subscription.findMany({
    where: { userId },
    select: { name: true },
  });
  const seen = new Set(existing.map((s) => s.name.trim().toLowerCase()));

  let count = 0;

  // Process each email individually — focused context per email gives much better accuracy
  for (const detail of messageDetails) {
    if (!detail) continue;

    const body = getEmailBody(detail);
    if (!body || body.length < 80) continue; // Skip near-empty / image-only emails

    const emailDate = getEmailDate(detail);

    const result = await classifyEmail(body, emailDate);
    if (!result) continue;

    const key = result.name.toLowerCase();
    if (seen.has(key)) {
      console.log(`[Gmail] Skipping duplicate: "${result.name}"`);
      continue;
    }
    seen.add(key);

    const startDate = new Date(result.startDate);
    const nextBillingDate = computeNextDate(startDate, result.billingCycle);

    await prisma.subscription.create({
      data: {
        name: result.name,
        price: result.price,
        billingCycle: result.billingCycle,
        category: result.category,
        status: 'active',
        detectionSource: 'email',
        startDate,
        lastBillingDate: startDate,
        nextBillingDate,
        userId,
      },
    });

    console.log(
      `[Gmail] Detected: "${result.name}" $${result.price}/${result.billingCycle} (from email dated ${result.startDate})`
    );
    count++;
  }

  return count;
}
