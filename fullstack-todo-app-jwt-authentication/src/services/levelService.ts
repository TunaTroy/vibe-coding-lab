import { LevelRepository } from "../repositories/levelRepository";
import { prisma } from "../config/prisma";
import { ProgressionService } from "./progressionService";

export interface AnswerInput {
  questionId: string;
  answer: any;
}

export interface SubmitLevelInput {
  levelId: string;
  answers: AnswerInput[];
}

export interface SubmitLevelResult {
  score: number;
  stars: number;
  coinAwarded: number;
  correctAnswers: Record<string, any>;
}

export interface LevelWithProgress {
  id: string;
  order: number;
  // Tên dạng bài (vd "Trắc Nghiệm", "Nối Câu") — thêm ở Vấn đề 2 [14].
  name: string;
  isBoss: boolean;
  tenseName: string;
  isUnlocked: boolean;
  starsEarned: number;
}

export class LevelService {
  constructor(private readonly levelRepository: LevelRepository) {}

  async getFirstLevel() {
    const level = await this.levelRepository.findFirstLevel();
    if (!level) {
      throw new Error("No levels found.");
    }
    return {
      id: level.id,
      order: level.order,
    };
  }

  async getLevelQuestions(levelId: string, userId: string) {
    const level = await this.levelRepository.findLevelById(levelId);
    if (!level) {
      throw new Error("Level not found.");
    }
    if (!await new ProgressionService().levelUnlocked(userId, level)) {
      throw new Error("Level not unlocked.");
    }

    const questions =
      await this.levelRepository.findQuestionsByLevelId(levelId);

    // Strip correctAnswer from response
    const questionsWithoutAnswer = questions.map((q) => ({
      id: q.id,
      levelId: q.levelId,
      type: q.type,
      prompt: q.prompt,
      payload: q.payload,
      order: q.order,
    }));

    return {
      level: {
        id: level.id,
        // tenseId: cần cho FE điều hướng đúng /tenses/:tenseId/levels sau khi
        // nộp bài (BUGFIX: trước đây thiếu field này → FE chỉ navigate được
        // về "/levels", route đã deprecate và redirect ra "/tenses").
        tenseId: level.tenseId,
        order: level.order,
        name: (level as any).name ?? "",
        isBoss: (level as any).isBoss ?? false,
        passScore: level.passScore,
        coinReward: level.coinReward,
      },
      questions: questionsWithoutAnswer,
    };
  }

  async submitLevel(
    userId: string,
    input: SubmitLevelInput,
  ): Promise<SubmitLevelResult> {
    return prisma.$transaction(async (tx) => {
      // Serialize first-pass rewards across simultaneous submissions by this user.
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
      const repository = this.levelRepository.withClient(tx);
      // Step 1: Verify Level exists
      const level = await repository.findLevelById(input.levelId);
      if (!level) {
        throw new Error("Level not found.");
      }

      // Step 1: Verify unlock permission
      if (!await new ProgressionService(tx).levelUnlocked(userId, level)) {
        throw new Error("Level not unlocked. Complete previous level first.");
      }

      // Step 2: Get correct answers from DB (NEVER trust client)
      const questionIds = input.answers.map((a) => a.questionId);
      if (new Set(questionIds).size !== questionIds.length) {
        throw new Error("Duplicate question IDs.");
      }
      const questions = await repository.findQuestionsByLevelId(input.levelId);
      if (questions.length === 0 || questionIds.length !== questions.length ||
          questionIds.some(id => !questions.some(q => q.id === id))) {
        throw new Error("Submission must include each level question exactly once.");
      }
      const questionMap = new Map(questions.map((q) => [q.id, q]));

      // Step 3: Calculate score
      let correctCount = 0;
      const correctAnswers: Record<string, any> = {};

      for (const answer of input.answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) {
          throw new Error(`Question ${answer.questionId} not found.`);
        }

        correctAnswers[answer.questionId] = question.correctAnswer;

        if (
          JSON.stringify(answer.answer) ===
          JSON.stringify(question.correctAnswer)
        ) {
          correctCount++;
        }
      }

      const totalQuestions = questions.length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      // Step 4: Calculate stars
      let stars = 0;
      if (score >= 90) {
        stars = 3;
      } else if (score >= 70) {
        stars = 2;
      } else if (score >= level.passScore) {
        stars = 1;
      }

      // Step 5: Check existing progress and determine coin award
      const existingProgress = await repository.findLevelProgress(
        userId,
        input.levelId,
      );

      let coinAwarded = 0;
      let passedAt: Date | null = null;

      if (existingProgress) {
        // User has played before
        if (!existingProgress.passedAt && score >= level.passScore) {
          // First time passing
          coinAwarded = level.coinReward;
          passedAt = new Date();
        } else {
          // Already passed or didn't pass this time
          coinAwarded = 0;
          passedAt = existingProgress.passedAt;
        }

        // Update best score and stars if better
        const updateData: any = {
          lastPlayedAt: new Date(),
        };

        if (score > existingProgress.bestScore) {
          updateData.bestScore = score;
        }

        if (stars > existingProgress.stars) {
          updateData.stars = stars;
        }

        if (passedAt && !existingProgress.passedAt) {
          updateData.passedAt = passedAt;
        }

        await repository.updateLevelProgress(
          existingProgress.id,
          updateData,
        );
      } else {
        // First time playing
        if (score >= level.passScore) {
          coinAwarded = level.coinReward;
          passedAt = new Date();
        }

        await repository.createLevelProgress({
          userId,
          levelId: input.levelId,
          bestScore: score,
          stars,
          passedAt,
        });
      }

      // Step 6: Insert CoinTransaction if coin awarded
      if (coinAwarded > 0) {
        await repository.createCoinTransaction({
          userId,
          amount: coinAwarded,
          reason: `Completed Level ${level.order}`,
        });

        await repository.updateUserCoinBalance(userId, coinAwarded);
      }

      // Step 7: Return result with correct answers (only after grading)
      return {
        score,
        stars,
        coinAwarded,
        correctAnswers,
      };
    });
  }

  /**
   * Danh sách Level kèm tiến độ người dùng.
   * @param tenseId optional — truyền vào để chỉ lấy Level của một Thì (Vấn đề 1 [14]).
   *                Logic mở khoá (theo order) được tính TRONG tập đã lọc, nên mỗi Thì
   *                có Level order 1..N độc lập.
   */
  async getAllLevelsWithProgress(
    userId: string,
    tenseId?: string,
  ): Promise<LevelWithProgress[]> {
    const allLevels = await this.levelRepository.findAllLevels();

    // Lọc theo Thì nếu có yêu cầu (mặc định: toàn bộ — giữ tương thích ngược)
    const levels = tenseId
      ? allLevels.filter((l: any) => l.tenseId === tenseId)
      : allLevels;

    const userProgress =
      await this.levelRepository.findAllLevelProgressByUserId(userId);
    const tenseIds = [...new Set(levels.map(level => level.tenseId))];
    const bosses = await prisma.bossCheckpoint.findMany({ where: { tenseId: { in: tenseIds }, published: true } });
    const bossProgress = await prisma.bossProgress.findMany({ where: { userId, bossId: { in: bosses.map(b => b.id) } } });
    const levelByOrder = new Map(levels.map(level => [`${level.tenseId}:${level.order}`, level]));
    const bossByGroup = new Map(bosses.map(boss => [`${boss.tenseId}:${boss.groupIndex}`, boss]));
    const passedBosses = new Set(bossProgress.filter(p => p.passedAt).map(p => p.bossId));

    // Create a map of levelId -> progress for quick lookup
    const progressMap = new Map(
      userProgress.map((progress) => [progress.levelId, progress]),
    );

    // Calculate isUnlocked for each level
    // Level 1 is always unlocked
    // Level > 1 is unlocked if previous level has passedAt
    const levelsWithProgress: LevelWithProgress[] = levels.map((level: any) => {
      const progress = progressMap.get(level.id);
      const starsEarned = progress?.stars || 0;

      // Level 1 is always unlocked
      if (level.order === 1) {
        return {
          id: level.id,
          order: level.order,
          name: level.name,
          isBoss: level.isBoss ?? false,
          tenseName: level.tense.name,
          isUnlocked: true,
          starsEarned,
        };
      }

      // For level > 1, check if previous level is passed (trong cùng tập đã lọc)
      const previous = levelByOrder.get(`${level.tenseId}:${level.order - 1}`);
      const gate = bossByGroup.get(`${level.tenseId}:${Math.floor((level.order - 1) / 5)}`);
      const isUnlocked = ProgressionService.levelAccessible(
        level.order,
        Boolean(previous && progressMap.get(previous.id)?.passedAt),
        Boolean(gate && passedBosses.has(gate.id)),
      );

      return {
        id: level.id,
        order: level.order,
        name: level.name,
        isBoss: level.isBoss ?? false,
        tenseName: level.tense.name,
        isUnlocked,
        starsEarned,
      };
    });

    return levelsWithProgress;
  }
}
