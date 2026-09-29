import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../config/prisma';

export type DatabaseClient = PrismaClient | Prisma.TransactionClient;

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
  constructor(private readonly db: DatabaseClient = prisma) {}
  withClient(db: DatabaseClient) { return new LevelRepository(db); }
  async findLevelById(levelId: string): Promise<LevelRecord | null> {
    return this.db.level.findUnique({
      where: { id: levelId },
    });
  }

  async findFirstLevel(): Promise<LevelRecord | null> {
    return this.db.level.findFirst({
      where: { order: 1 },
    });
  }

  async findQuestionsByLevelId(levelId: string): Promise<QuestionRecord[]> {
    return this.db.question.findMany({
      where: { levelId },
      orderBy: { order: 'asc' },
    });
  }

  async findLevelProgress(
    userId: string,
    levelId: string
  ): Promise<LevelProgressRecord | null> {
    return this.db.levelProgress.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId,
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
    return this.db.levelProgress.create({
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
    return this.db.levelProgress.update({
      where: { id },
      data,
    });
  }

  async createCoinTransaction(data: {
    userId: string;
    amount: number;
    reason: string;
  }): Promise<any> {
    return this.db.coinTransaction.create({
      data,
    });
  }

  async updateUserCoinBalance(userId: string, amount: number): Promise<any> {
    return this.db.user.update({
      where: { id: userId },
      data: {
        coinBalance: {
          increment: amount,
        },
      },
    });
  }

  async findAllLevels(): Promise<any[]> {
    return this.db.level.findMany({
      include: {
        tense: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findAllLevelProgressByUserId(userId: string): Promise<LevelProgressRecord[]> {
    return this.db.levelProgress.findMany({
      where: { userId },
      include: {
        level: true,
      },
    });
  }
}
