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
}
