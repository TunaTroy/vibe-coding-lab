import { prisma } from '../config/prisma';

export interface TenseRecord {
  id: string;
  code: string;
  name: string;
  order: number;
}

/** Thì kèm các Level boss (isBoss = true) — dùng để tính mở khoá Thì [15]. */
export interface TenseWithBossLevels extends TenseRecord {
  levels: { id: string; isBoss: boolean }[];
}

export class TenseRepository {
  async findAllTenses(): Promise<TenseRecord[]> {
    return prisma.tense.findMany({
      orderBy: { order: 'asc' },
    });
  }

  /** Toàn bộ Thì kèm các Level boss của nó (isBoss = true). */
  async findAllTensesWithBossLevels(): Promise<TenseWithBossLevels[]> {
    return prisma.tense.findMany({
      orderBy: { order: 'asc' },
      include: {
        levels: {
          where: { isBoss: true },
          select: { id: true, isBoss: true },
        },
      },
    });
  }

  /**
   * LevelProgress của user cho một Level cụ thể.
   * Pattern tham khảo từ levelRepository.findAllLevelProgressByUserId —
   * đọc đúng trường passedAt để kiểm tra "đã pass hay chưa".
   */
  async findLevelProgressByUserIdAndLevelId(
    userId: string,
    levelId: string
  ): Promise<{ passedAt: Date | null } | null> {
    return prisma.levelProgress.findUnique({
      where: { userId_levelId: { userId, levelId } },
      select: { passedAt: true },
    });
  }
}
