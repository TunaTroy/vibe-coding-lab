import { TenseRepository, TenseRecord } from '../repositories/tenseRepository';
import { LevelService, LevelWithProgress } from './levelService';

export class TenseService {
  constructor(
    private readonly tenseRepository: TenseRepository,
    private readonly levelService: LevelService
  ) {}

  /** Toàn bộ Thì trong DB (hiện chỉ có Present Simple). */
  async getAllTenses(): Promise<TenseRecord[]> {
    return this.tenseRepository.findAllTenses();
  }

  /**
   * Level của một Thì, kèm tiến độ người dùng.
   * Delegate sang LevelService.getAllLevelsWithProgress(userId, tenseId)
   * để tái sử dụng đúng logic isUnlocked/starsEarned (không nhân bản).
   */
  async getLevelsByTense(userId: string, tenseId: string): Promise<LevelWithProgress[]> {
    return this.levelService.getAllLevelsWithProgress(userId, tenseId);
  }
}
