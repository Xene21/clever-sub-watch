import { google } from 'googleapis';
import OpenAI from 'openai';
import { prisma } from './prisma';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Ensure we decode base64url correctly
function decodeBase64(data: string) {
  return Buffer.from(data, 'base64').toString('utf-8');
}

function getEmailBody(message: any): string {
  let body = '';
  
  if (message.payload?.parts) {
    // Look for text/plain parts first
    const textPart = message.payload.parts.find((part: any) => part.mimeType === 'text/plain');
    if (textPart && textPart.body?.data) {
      body = decodeBase64(textPart.body.data);
    } else {
      // Fallback to HTML and strip tags
      const htmlPart = message.payload.parts.find((part: any) => part.mimeType === 'text/html');
      if (htmlPart && htmlPart.body?.data) {
        const html = decodeBase64(htmlPart.body.data);
        body = html.replace(/<[^>]*>?/gm, ''); // simple html strip
      }
    }
  } else if (message.payload?.body?.data) {
    body = decodeBase64(message.payload.body.data);
    if (message.payload.mimeType === 'text/html') {
      body = body.replace(/<[^>]*>?/gm, '');
    }
  }
  
  return body.trim().replace(/\s+/g, ' '); // Compress whitespace
}

export async function scanUserEmails(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user || !user.googleRefreshToken) {
    throw new Error('User does not have a connected Google account');
  }

  // Setup OAuth client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Search for recent receipts/subscriptions
  // newer_than:3m restricts to the last 3 months to avoid overloading
  const query = 'newer_than:3m (subject:receipt OR subject:subscription OR subject:renewal OR from:billing)';
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 20 // Let's test with the 20 most recent
  });

  const messages = response.data.messages || [];
  if (messages.length === 0) return 0; // No emails found

  const extractedTexts: string[] = [];

  // Fetch full email bodies
  for (const msg of messages) {
    try {
      const emailRes = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full'
      });
      
      const body = getEmailBody(emailRes.data);
      if (body) {
        // truncate to avoid massive token usage
        extractedTexts.push(body.substring(0, 1500)); 
      }
    } catch (err) {
      console.warn(`Failed to fetch email ${msg.id}`);
    }
  }

  if (extractedTexts.length === 0) return 0;

  // Use OpenAI to analyze the chunked texts
  // We'll combine them to save calls, separating with a delimiter
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
    model: 'gpt-4o-mini', // Fast and cheap
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: combinedText }
    ],
    temperature: 0.1
  });

  const responseText = completion.choices[0].message.content || '[]';
  let detectedSubscriptions: any[] = [];
  try {
    detectedSubscriptions = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (e) {
    console.error('Failed to parse OpenAI response:', responseText);
  }

  let count = 0;
  // Save to database
  for (const sub of detectedSubscriptions) {
    // Basic deduplication check: Does this sub exist for this user?
    const existing = await prisma.subscription.findFirst({
      where: {
        userId,
        name: { equals: sub.name, mode: 'insensitive' }
      }
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
          userId
        }
      });
      count++;
    }
  }

  return count;
}
