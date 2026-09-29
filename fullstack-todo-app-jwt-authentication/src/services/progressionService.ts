import { prisma } from '../config/prisma';
import { DatabaseClient } from '../repositories/levelRepository';

// The same rule is used for listing, question access, submission, and Boss starts.
export class ProgressionService {
  constructor(private readonly db: DatabaseClient = prisma) {}

  static levelAccessible(order: number, previousPassed: boolean, checkpointPassed: boolean): boolean {
    if (order < 1) return false;
    if (order === 1) return true;
    return previousPassed && ((order - 1) % 5 !== 0 || checkpointPassed);
  }

  static bossAccessible(sourcePassed: boolean[]): boolean {
    return sourcePassed.length === 5 && sourcePassed.every(Boolean);
  }

  async levelUnlocked(userId: string, level: { tenseId: string; order: number }): Promise<boolean> {
    if (level.order < 1) return false;
    if (level.order === 1) return true;
    const previous = await this.db.level.findUnique({
      where: { tenseId_order: { tenseId: level.tenseId, order: level.order - 1 } },
    });
    if (!previous) return false;
    const progress = await this.db.levelProgress.findUnique({
      where: { userId_levelId: { userId, levelId: previous.id } },
    });
    if ((level.order - 1) % 5 !== 0) return ProgressionService.levelAccessible(level.order, Boolean(progress?.passedAt), false);
    const boss = await this.db.bossCheckpoint.findUnique({
      where: { tenseId_groupIndex: { tenseId: level.tenseId, groupIndex: (level.order - 1) / 5 } },
    });
    if (!boss?.published) return false;
    const bossProgress = await this.db.bossProgress.findUnique({
      where: { userId_bossId: { userId, bossId: boss.id } },
    });
    return ProgressionService.levelAccessible(level.order, Boolean(progress?.passedAt), Boolean(bossProgress?.passedAt));
  }

  async bossUnlocked(userId: string, boss: { tenseId: string; groupIndex: number; sourceStart: number; sourceEnd: number; published: boolean }): Promise<boolean> {
    if (!boss.published || boss.groupIndex < 1 || boss.sourceStart !== (boss.groupIndex - 1) * 5 + 1 || boss.sourceEnd !== boss.groupIndex * 5) return false;
    const levels = await this.db.level.findMany({ where: { tenseId: boss.tenseId, order: { gte: boss.sourceStart, lte: boss.sourceEnd } }, select: { id: true, order: true } });
    if (levels.length !== 5) return false;
    const progress = await this.db.levelProgress.findMany({ where: { userId, levelId: { in: levels.map(l => l.id) }, passedAt: { not: null } }, select: { levelId: true } });
    return ProgressionService.bossAccessible(levels.map(l => progress.some(p => p.levelId === l.id)));
  }
}
