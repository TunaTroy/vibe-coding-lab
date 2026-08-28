import { Router } from 'express';
import { LeaderboardController } from '../controllers/leaderboardController';
import { requireAuth } from '../middleware/requireAuth';
import { LeaderboardRepository } from '../repositories/leaderboardRepository';
import { LeaderboardService } from '../services/leaderboardService';

const router = Router();
const leaderboardController = new LeaderboardController(
  new LeaderboardService(new LeaderboardRepository())
);

router.get('/', requireAuth, leaderboardController.getLeaderboard);

export default router;
