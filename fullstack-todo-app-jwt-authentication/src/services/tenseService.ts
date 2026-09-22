import { TenseRepository, TenseRecord } from '../repositories/tenseRepository';
import { LevelService, LevelWithProgress } from './levelService';

/** Thì kèm trạng thái mở khoá theo tiến độ người dùng [15]. */
export interface TenseWithUnlock extends TenseRecord {
  isUnlocked: boolean;
}

export class TenseService {
  constructor(
    private readonly tenseRepository: TenseRepository,
    private readonly levelService: LevelService
  ) {}

  /**
   * Toàn bộ Thì kèm trạng thái mở khoá THEO TIẾN ĐỘ THẬT:
   * - order === 1: luôn mở.
   * - order > 1: mở NẾU user đã pass (passedAt != null) Level boss của Thì liền trước.
   *   Thì liền trước chưa có Level boss nào (vd chưa seed) → khoá (an toàn, không crash).
   */
  async getAllTenses(userId: string): Promise<TenseWithUnlock[]> {
    const tenses = await this.tenseRepository.findAllTensesWithBossLevels();

    const result: TenseWithUnlock[] = [];
    for (const tense of tenses) {
      const base: TenseRecord = {
        id: tense.id,
        code: tense.code,
        name: tense.name,
        order: tense.order,
      };

      if (tense.order === 1) {
        result.push({ ...base, isUnlocked: true });
        continue;
      }

      let isUnlocked = false;
      const prevTense = tenses.find((t) => t.order === tense.order - 1);
      if (prevTense) {
        const bossLevel = prevTense.levels.find((l) => l.isBoss);
        if (bossLevel) {
          const progress = await this.tenseRepository.findLevelProgressByUserIdAndLevelId(
            userId,
            bossLevel.id
          );
          isUnlocked = progress !== null && progress.passedAt !== null;
        }
      }

      result.push({ ...base, isUnlocked });
    }

    return result;
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
