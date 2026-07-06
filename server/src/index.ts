import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import subscriptionsRoutes from './routes/subscriptions';
import aiRoutes from './routes/ai';
import plaidRoutes from './routes/plaid';

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin) return callback(null, true);
    
    // Check exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    // Forgive trailing slashes in the FRONTEND_URL environment variable
    const cleanEnvUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');
    if (cleanEnvUrl && origin === cleanEnvUrl) return callback(null, true);

    // Ultimate fallback: allow ANY vercel.app preview or production URL to prevent headaches
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    // Log for debugging, but reject cleanly without throwing
    console.warn(`CORS: blocked request from origin: ${origin}`);
    console.warn(`CORS: allowed origins are: ${allowedOrigins.join(', ')}`);
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/plaid', plaidRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
