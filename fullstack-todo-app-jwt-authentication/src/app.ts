import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import levelRoutes from './routes/levelRoutes';
import todoRoutes from './routes/todoRoutes';
import tenseRoutes from './routes/tenseRoutes'; 

export const app = express();

// Configure helmet with COOP allowing popups for Google Sign-In
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tenses', tenseRoutes);

app.use(errorHandler);
