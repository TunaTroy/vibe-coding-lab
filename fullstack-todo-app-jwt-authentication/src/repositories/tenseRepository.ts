import { prisma } from '../config/prisma';

export interface TenseRecord {
  id: string;
  code: string;
  name: string;
  order: number;
}

export class TenseRepository {
  async findAllTenses(): Promise<TenseRecord[]> {
    return prisma.tense.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findPublishedBosses(tenseIds: string[]) {
    return prisma.bossCheckpoint.findMany({
      where: { tenseId: { in: tenseIds }, published: true },
      select: { id: true, tenseId: true, groupIndex: true },
      orderBy: { groupIndex: 'desc' },
    });
  }

  async findPassedBossIds(userId: string, bossIds: string[]) {
    return prisma.bossProgress.findMany({
      where: { userId, bossId: { in: bossIds }, passedAt: { not: null } },
      select: { bossId: true },
    });
  }
}
