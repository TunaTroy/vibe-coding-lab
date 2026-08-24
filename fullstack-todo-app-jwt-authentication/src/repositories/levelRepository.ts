import { prisma } from '../config/prisma';

export interface QuestionRecord {
  id: string;
  levelId: string;
  type: string;
  prompt: string;
  payload: any;
  correctAnswer: any;
  order: number;
}

export interface LevelRecord {
  id: string;
  tenseId: string;
  order: number;
  passScore: number;
  coinReward: number;
}

export interface LevelProgressRecord {
  id: string;
  userId: string;
  levelId: string;
  bestScore: number;
  stars: number;
  passedAt: Date | null;
  lastPlayedAt: Date;
}

export class LevelRepository {
  async findLevelById(levelId: string): Promise<LevelRecord | null> {
    return prisma.level.findUnique({
      where: { id: levelId },
    });
  }

  async findFirstLevel(): Promise<LevelRecord | null> {
    return prisma.level.findFirst({
      where: { order: 1 },
    });
  }

  async findQuestionsByLevelId(levelId: string): Promise<QuestionRecord[]> {
    return prisma.question.findMany({
      where: { levelId },
      orderBy: { order: 'asc' },
    });
  }

  async findQuestionsByIds(questionIds: string[]): Promise<QuestionRecord[]> {
    return prisma.question.findMany({
      where: { id: { in: questionIds } },
    });
  }

  async findLevelProgress(
    userId: string,
    levelId: string
  ): Promise<LevelProgressRecord | null> {
    return prisma.levelProgress.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId,
        },
      },
    });
  }

  async findPreviousLevelProgress(
    userId: string,
    currentLevelOrder: number
  ): Promise<LevelProgressRecord | null> {
    const previousLevel = await prisma.level.findFirst({
      where: { order: currentLevelOrder - 1 },
    });

    if (!previousLevel) {
      return null;
    }

    return prisma.levelProgress.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId: previousLevel.id,
        },
      },
    });
  }

  async createLevelProgress(data: {
    userId: string;
    levelId: string;
    bestScore: number;
    stars: number;
    passedAt: Date | null;
  }): Promise<LevelProgressRecord> {
    return prisma.levelProgress.create({
      data,
    });
  }

  async updateLevelProgress(
    id: string,
    data: {
      bestScore?: number;
      stars?: number;
      passedAt?: Date | null;
      lastPlayedAt?: Date;
    }
  ): Promise<LevelProgressRecord> {
    return prisma.levelProgress.update({
      where: { id },
      data,
    });
  }

  async createCoinTransaction(data: {
    userId: string;
    amount: number;
    reason: string;
  }): Promise<any> {
    return prisma.coinTransaction.create({
      data,
    });
  }

  async updateUserCoinBalance(userId: string, amount: number): Promise<any> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        coinBalance: {
          increment: amount,
        },
      },
    });
  }
}
