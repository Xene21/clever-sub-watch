import { Router } from 'express';
import { google } from 'googleapis';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === 'production' 
    ? 'https://subpilot.nibravalabs.com/api/auth/google/callback' 
    : 'http://localhost:3000/api/auth/google/callback'
);

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// 1. Get Auth URL (Called by frontend Connect Bank page)
router.get('/url', requireAuth, (req: any, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // get refresh token
    scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
    prompt: 'consent',
    state: req.userId // pass userId through state to associate on callback
  });
  res.json({ url });
});

// 1b. Get Auth URL for Login/Signup (Called by frontend Login page)
router.get('/login-url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // get refresh token
    scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
    prompt: 'consent',
    state: 'login' // tell callback this is a login flow
  });
  res.json({ url });
});

// 2. OAuth Callback
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const passedState = state as string;

  if (!code || !passedState) {
    return res.status(400).send('Missing code or state');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Get user email & profile
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://subpilot.nibravalabs.com' 
      : 'http://localhost:8080';

    if (passedState === 'login') {
      // --- LOGIN / SIGNUP FLOW ---
      const email = userInfo.data.email!;
      let user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        // Create user
        user = await prisma.user.create({
          data: {
            email,
            name: userInfo.data.name || 'Google User',
            passwordHash: 'oauth_user', // placeholder for oauth users
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token,
            googleEmail: email
          }
        });
      } else {
        // Update tokens for existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token || user.googleRefreshToken, // preserve refresh token if not returned
            googleEmail: email
          }
        });
      }
      
      // Log them in
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      return res.redirect(`${frontendUrl}/dashboard`);
    } else {
      // --- CONNECT GMAIL TO EXISTING ACCOUNT FLOW ---
      const userId = passedState;
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleEmail: userInfo.data.email
        }
      });
      return res.redirect(`${frontendUrl}/dashboard/connect?gmail=success`);
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).send('Authentication failed');
  }
});

// 3. Status Check
router.get('/status', requireAuth, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId }
  });
  
  if (!user || !user.googleRefreshToken) {
    return res.json({ connected: false });
  }

  res.json({ 
    connected: true, 
    email: user.googleEmail 
  });
});

import { scanUserEmails } from '../lib/gmailScanner';

// 4. Disconnect
router.post('/disconnect', requireAuth, async (req: any, res) => {
  await prisma.user.update({
    where: { id: req.userId },

    data: {
      googleAccessToken: null,
      googleRefreshToken: null,
      googleEmail: null
    }
  });
  res.json({ success: true });
});

// 5. Sync Emails
router.post('/sync', requireAuth, async (req: any, res) => {
  try {
    const detectedCount = await scanUserEmails(req.userId);
    res.json({ success: true, detected: detectedCount });
  } catch (error: any) {
    console.error('Gmail sync error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync emails' });
  }
});

export default router;
