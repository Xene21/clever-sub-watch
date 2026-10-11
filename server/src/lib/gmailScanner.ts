import { google } from 'googleapis';
import OpenAI from 'openai';
import { prisma } from './prisma';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// Bug fix: Gmail API returns base64URL (uses - and _ instead of + and /)
// Node's Buffer only handles standard base64, so we normalise first.
// ─────────────────────────────────────────────────────────────────────────────
function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf-8');
}

// ─────────────────────────────────────────────────────────────────────────────
// Recursively walk a MIME tree to extract the best text body.
// Handles nested multipart/alternative, multipart/related, etc.
// ─────────────────────────────────────────────────────────────────────────────
function extractBody(payload: any): string {
  if (!payload) return '';

  // Leaf node with data
  if (payload.body?.data) {
    let text = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/html') {
      text = text.replace(/<[^>]*>?/gm, ' ');
    }
    return text;
  }

  // Has parts — walk recursively
  if (payload.parts?.length) {
    // Prefer text/plain if available at this level
    const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (plainPart) {
      const result = extractBody(plainPart);
      if (result) return result;
    }

    // Fall back to first part that yields something
    for (const part of payload.parts) {
      const result = extractBody(part);
      if (result) return result;
    }
  }

  return '';
}

function getEmailBody(message: any): string {
  const body = extractBody(message.payload);
  return body.trim().replace(/\s+/g, ' ');
}

export async function scanUserEmails(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.googleRefreshToken) {
    throw new Error('User does not have a connected Google account');
  }

  // ─── Build OAuth2 client ───────────────────────────────────────────────────
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });

  // ─── Auto-refresh: persist the new access token if Google rotates it ───────
  oauth2Client.on('tokens', async (tokens) => {
    const update: Record<string, string | null> = {};
    if (tokens.access_token) update.googleAccessToken = tokens.access_token;
    if (tokens.refresh_token) update.googleRefreshToken = tokens.refresh_token;
    if (Object.keys(update).length) {
      await prisma.user.update({ where: { id: userId }, data: update });
    }
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // ─── Search for receipt/subscription emails (last 3 months) ───────────────
  const query =
    'newer_than:3m (subject:receipt OR subject:invoice OR subject:payment OR ' +
    'subject:order OR subject:subscription OR subject:renewal OR ' +
    'from:billing OR from:receipts OR from:invoices OR from:noreply)';

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 50,
  });

  const messages = listRes.data.messages ?? [];
  if (messages.length === 0) return 0;

  const extractedTexts: string[] = [];

  for (const msg of messages) {
    try {
      const emailRes = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      const body = getEmailBody(emailRes.data);
      if (body) {
        extractedTexts.push(body.substring(0, 1500));
      }
    } catch (err) {
      console.warn(`[Gmail] Failed to fetch email ${msg.id}:`, err);
    }
  }

  if (extractedTexts.length === 0) return 0;

  // ─── Ask OpenAI to extract subscriptions ──────────────────────────────────
  const combinedText = extractedTexts.join('\n\n---NEXT_EMAIL---\n\n');

  const systemPrompt = `You are a receipt parsing engine. I will provide you with the raw text of several emails separated by "---NEXT_EMAIL---".
Your job is to identify recurring subscriptions. 
Look for keywords like "monthly", "yearly", "renewal", "subscription".
Return a JSON array of objects with the following keys:
- name (string, merchant name)
- price (number, amount billed. IMPORTANT: If the receipt is in a foreign currency like Naira/NGN, Euros, or GBP, you MUST convert it to its estimated USD equivalent before returning the number. The returned price must ALWAYS be in USD.)
- billingCycle (string, one of: "weekly", "monthly", "quarterly", "yearly")
- category (string, best guess category e.g. "Entertainment", "Software", "Utilities")
If there are no subscriptions, return an empty array [].
DO NOT return markdown, only the raw JSON array.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: combinedText },
    ],
    temperature: 0.1,
  });

  const responseText = completion.choices[0]?.message?.content ?? '[]';
  let detectedSubscriptions: any[] = [];
  try {
    detectedSubscriptions = JSON.parse(
      responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    );
  } catch (e) {
    console.error('[Gmail] Failed to parse OpenAI response:', responseText);
    return 0;
  }

  // ─── Save to database (deduplicate) ───────────────────────────────────────
  let count = 0;
  for (const sub of detectedSubscriptions) {
    if (!sub.name || typeof sub.price !== 'number' || !sub.billingCycle) continue;

    const existing = await prisma.subscription.findFirst({
      where: { userId, name: { equals: sub.name, mode: 'insensitive' } },
    });

    if (!existing) {
      await prisma.subscription.create({
        data: {
          name: sub.name,
          price: sub.price,
          billingCycle: sub.billingCycle,
          category: sub.category || 'Other',
          status: 'active',
          detectionSource: 'email',
          userId,
        },
      });
      count++;
    }
  }

  return count;
}
