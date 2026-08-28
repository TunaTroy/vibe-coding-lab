import { LeaderboardRepository } from '../repositories/leaderboardRepository';

export interface LeaderboardPlayer {
  rank: number;
  name: string;
  coins: number;
  stars: number;
  isCurrentUser: boolean;
}

export class LeaderboardService {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  async getLeaderboard(currentUserId: string): Promise<LeaderboardPlayer[]> {
    const rows = await this.leaderboardRepository.findAllRanked();

    // rows đã sort theo coinBalance ở tầng Repository -> rank = vị trí + 1
    return rows.map((row, index) => ({
      rank: index + 1,
      name: row.email.split('@')[0],
      coins: row.coinBalance,
      stars: row.totalStars,
      isCurrentUser: row.id === currentUserId,
    }));
  }
}
