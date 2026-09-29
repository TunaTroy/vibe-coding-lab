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
   * - order > 1: mở khi đã vượt qua BossCheckpoint cuối cùng đã xuất bản
   *   của Thì liền trước. Chưa có checkpoint → khóa.
   */
  async getAllTenses(userId: string): Promise<TenseWithUnlock[]> {
    const tenses = await this.tenseRepository.findAllTenses();
    const bosses = await this.tenseRepository.findPublishedBosses(tenses.map(tense => tense.id));
    const passed = new Set((await this.tenseRepository.findPassedBossIds(userId, bosses.map(boss => boss.id))).map(progress => progress.bossId));
    const finalBossByTense = new Map<string, string>();
    for (const boss of bosses) {
      if (!finalBossByTense.has(boss.tenseId)) finalBossByTense.set(boss.tenseId, boss.id);
    }

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

      const prevTense = tenses.find((t) => t.order === tense.order - 1);
      const requiredBossId = prevTense ? finalBossByTense.get(prevTense.id) : undefined;
      const isUnlocked = Boolean(requiredBossId && passed.has(requiredBossId));
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
