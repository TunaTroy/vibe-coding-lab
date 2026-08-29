import { LevelRepository } from '../repositories/levelRepository';
import { prisma } from '../config/prisma';

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
  tenseName: string;
  isUnlocked: boolean;
  starsEarned: number;
}

export class LevelService {
  constructor(private readonly levelRepository: LevelRepository) {}

  async getFirstLevel() {
    const level = await this.levelRepository.findFirstLevel();
    if (!level) {
      throw new Error('No levels found.');
    }
    return {
      id: level.id,
      order: level.order,
    };
  }

  async getLevelQuestions(levelId: string) {
    const level = await this.levelRepository.findLevelById(levelId);
    if (!level) {
      throw new Error('Level not found.');
    }

    const questions = await this.levelRepository.findQuestionsByLevelId(levelId);

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
        order: level.order,
        passScore: level.passScore,
        coinReward: level.coinReward,
      },
      questions: questionsWithoutAnswer,
    };
  }

  async submitLevel(userId: string, input: SubmitLevelInput): Promise<SubmitLevelResult> {
    return prisma.$transaction(async (tx) => {
      // Step 1: Verify Level exists
      const level = await this.levelRepository.findLevelById(input.levelId);
      if (!level) {
        throw new Error('Level not found.');
      }

      // Step 1: Verify unlock permission
      if (level.order > 1) {
        const previousProgress = await this.levelRepository.findPreviousLevelProgress(
          userId,
          level.order
        );
        if (!previousProgress || !previousProgress.passedAt) {
          throw new Error('Level not unlocked. Complete previous level first.');
        }
      }

      // Step 2: Get correct answers from DB (NEVER trust client)
      const questionIds = input.answers.map((a) => a.questionId);
      const questions = await this.levelRepository.findQuestionsByIds(questionIds);
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

        if (JSON.stringify(answer.answer) === JSON.stringify(question.correctAnswer)) {
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
      const existingProgress = await this.levelRepository.findLevelProgress(
        userId,
        input.levelId
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

        await this.levelRepository.updateLevelProgress(existingProgress.id, updateData);
      } else {
        // First time playing
        if (score >= level.passScore) {
          coinAwarded = level.coinReward;
          passedAt = new Date();
        }

        await this.levelRepository.createLevelProgress({
          userId,
          levelId: input.levelId,
          bestScore: score,
          stars,
          passedAt,
        });
      }

      // Step 6: Insert CoinTransaction if coin awarded
      if (coinAwarded > 0) {
        await this.levelRepository.createCoinTransaction({
          userId,
          amount: coinAwarded,
          reason: `Completed Level ${level.order}`,
        });

        await this.levelRepository.updateUserCoinBalance(userId, coinAwarded);
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
  async getAllLevelsWithProgress(userId: string, tenseId?: string): Promise<LevelWithProgress[]> {
    const allLevels = await this.levelRepository.findAllLevels();

    // Lọc theo Thì nếu có yêu cầu (mặc định: toàn bộ — giữ tương thích ngược)
    const levels = tenseId ? allLevels.filter((l: any) => l.tenseId === tenseId) : allLevels;

    const userProgress = await this.levelRepository.findAllLevelProgressByUserId(userId);

    // Create a map of levelId -> progress for quick lookup
    const progressMap = new Map(
      userProgress.map((progress) => [progress.levelId, progress])
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
          tenseName: level.tense.name,
          isUnlocked: true,
          starsEarned,
        };
      }

      // For level > 1, check if previous level is passed (trong cùng tập đã lọc)
      const previousLevel = levels.find((l: any) => l.order === level.order - 1);
      let isUnlocked = false;

      if (previousLevel) {
        const previousProgress = progressMap.get(previousLevel.id);
        isUnlocked = previousProgress !== undefined && previousProgress.passedAt !== null;
      }

      return {
        id: level.id,
        order: level.order,
        name: level.name,
        tenseName: level.tense.name,
        isUnlocked,
        starsEarned,
      };
    });

    return levelsWithProgress;
  }
}
