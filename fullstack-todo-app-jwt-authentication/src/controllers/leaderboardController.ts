import { NextFunction, Request, Response } from 'express';
import { LeaderboardService } from '../services/leaderboardService';

export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }

      const players = await this.leaderboardService.getLeaderboard(userId);
      return res.status(200).json({ players });
    } catch (error) {
      next(error);
    }
  };
}
