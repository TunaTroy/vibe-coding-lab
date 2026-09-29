import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getBoss, getBossAttempt, startBossAttempt, submitBossAnswer } from '../controllers/bossController';

export const bossRoutes = Router();
bossRoutes.use(requireAuth);
bossRoutes.get('/bosses/:bossId', getBoss);
bossRoutes.post('/bosses/:bossId/attempts', startBossAttempt);
bossRoutes.get('/boss-attempts/:attemptId', getBossAttempt);
bossRoutes.post('/boss-attempts/:attemptId/answers', submitBossAnswer);
