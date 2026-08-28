import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

export interface LeaderboardRow {
  id: string;
  email: string;
  coinBalance: number;
  totalStars: number;
}

export class LeaderboardRepository {
  /**
   * Lấy toàn bộ học sinh (role STUDENT — không tính tài khoản ADMIN của phụ
   * huynh), sort theo coinBalance giảm dần. Tổng stars = tổng stars của mọi
   * LevelProgress người đó có.
   */
  async findAllRanked(): Promise<LeaderboardRow[]> {
    const users = await prisma.user.findMany({
      where: { role: Role.STUDENT },
      select: {
        id: true,
        email: true,
        coinBalance: true,
        levelProgress: { select: { stars: true } },
      },
      orderBy: { coinBalance: 'desc' },
    });

    return users.map((u: { id: string; email: string; coinBalance: number; levelProgress: { stars: number }[] }) => ({
      id: u.id,
      email: u.email,
      coinBalance: u.coinBalance,
      totalStars: u.levelProgress.reduce((sum: number, lp: { stars: number }) => sum + lp.stars, 0),
    }));
  }
}
