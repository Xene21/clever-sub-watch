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

  const query =
    'newer_than:3m (subject:receipt OR subject:invoice OR subject:payment OR ' +
    'subject:order OR subject:subscription OR subject:renewal OR ' +
    'from:billing OR from:receipts OR from:invoices OR from:noreply)';

  let messages: { id?: string | null }[] = [];
  try {
    const listRes = await gmail.users.messages.list({ userId: 'me', q: query, maxResults: 50 });
    messages = listRes.data.messages ?? [];
  } catch (err) {
    throw describeGoogleError(err);
  }
  if (messages.length === 0) return 0;

  const bodies = await mapWithConcurrency(messages, 8, async (msg) => {
    try {
      const res = await gmail.users.messages.get({ userId: 'me', id: msg.id!, format: 'full' });
      return getEmailBody(res.data).substring(0, 1500);
    } catch (err) {
      console.warn(`[Gmail] Failed to fetch email ${msg.id}:`, err);
      return '';
    }
  });
  const extractedTexts = bodies.filter(Boolean);
  if (extractedTexts.length === 0) return 0;

  const combinedText = extractedTexts.join('\n\n---NEXT_EMAIL---\n\n');

  const systemPrompt = `You are a receipt parsing engine. You will receive the raw text of several emails separated by "---NEXT_EMAIL---".
Identify recurring subscriptions (look for "monthly", "yearly", "renewal", "subscription").
Respond with a JSON object of the form {"subscriptions": [...]} where each item has:
- name (string, merchant name)
- price (number, amount billed in USD. If the receipt is in another currency such as NGN, EUR or GBP, convert to an estimated USD amount.)
- billingCycle (one of: "weekly", "monthly", "quarterly", "yearly")
- category (string, e.g. "Entertainment", "Software", "Utilities")
If there are none, return {"subscriptions": []}.`;

  let responseText = '';
  try {
    // JSON mode guarantees parseable JSON. No temperature: newer reasoning
    // models (e.g. gpt-5-mini) reject non-default temperature values.
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: combinedText },
      ],
    });
    responseText = completion.choices[0]?.message?.content ?? '{}';
  } catch (err: any) {
    throw new SyncError('OPENAI_ERROR', `OpenAI request failed: ${err?.message ?? err}`);
  }

  let detected: any[] = [];
  try {
    const parsed = JSON.parse(responseText);
    // Accept either {"subscriptions":[...]} or a bare array
    detected = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.subscriptions) ? parsed.subscriptions : [];
  } catch {
    console.error('[Gmail] Failed to parse OpenAI response:', responseText);
    return 0;
  }

  // Case-insensitive dedupe in JS: works on every Prisma database (unlike mode: 'insensitive')
  const existing = await prisma.subscription.findMany({ where: { userId }, select: { name: true } });
  const seen = new Set(existing.map((s) => s.name.trim().toLowerCase()));

  let count = 0;
  for (const sub of detected) {
    const name = typeof sub?.name === 'string' ? sub.name.trim() : '';
    const price = Number(sub?.price);
    const cycle = String(sub?.billingCycle ?? '').toLowerCase();
    if (!name || !Number.isFinite(price) || !VALID_CYCLES.has(cycle)) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    await prisma.subscription.create({
      data: {
        name,
        price,
        billingCycle: cycle,
        category: sub.category || 'Other',
        status: 'active',
        detectionSource: 'email',
        userId,
      },
    });
    count++;
  }

  return count;
}
