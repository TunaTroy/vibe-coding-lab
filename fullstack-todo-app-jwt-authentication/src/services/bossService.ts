import { BossAttemptQuestion, BossQuestion, Prisma, QuestionType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ProgressionService } from './progressionService';

export class BossError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}

const TOTAL = 10;
type AttemptWithQuestions = Prisma.BossAttemptGetPayload<{ include: { questions: true; boss: true } }>;
const publicQuestion = (q: { id: string; position: number; type: QuestionType; prompt: string; payload: Prisma.JsonValue }) => {
  const p = q.payload && typeof q.payload === 'object' && !Array.isArray(q.payload) ? q.payload : {};
  let payload: Record<string, unknown>;
  switch (q.type) {
    case 'MULTIPLE_CHOICE': payload = { options: p.options }; break;
    case 'FILL_BLANK': payload = { sentence: p.sentence }; break;
    case 'MATCHING': payload = { left: p.left, right: p.right }; break;
    case 'CLOZE': payload = { segments: p.segments, bank: p.bank }; break;
    case 'TRUE_FALSE_NOT_GIVEN': payload = { passage: p.passage, statement: p.statement }; break;
  }
  return { id: q.id, position: q.position, type: q.type, prompt: q.prompt, payload };
};
const starsFor = (score: number, passThreshold = 7) => score < passThreshold ? 0 : score >= 9 ? 3 : score === 8 ? 2 : score === 7 ? 1 : 0;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function validAnswer(type: QuestionType, payload: Prisma.JsonValue, answer: unknown): boolean {
  const p = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload as Record<string, unknown> : {};
  const integerIn = (n: unknown, count: number) => Number.isInteger(n) && (n as number) >= 0 && (n as number) < count;
  switch (type) {
    case 'MULTIPLE_CHOICE': return Array.isArray(p.options) && integerIn(answer, p.options.length);
    case 'FILL_BLANK': return typeof answer === 'string' && answer.trim().length > 0 && answer.length <= 200;
    case 'MATCHING': return Array.isArray(p.left) && Array.isArray(p.right) && Array.isArray(answer) && answer.length === p.left.length && answer.every(n => integerIn(n, (p.right as unknown[]).length));
    case 'CLOZE': return Array.isArray(p.segments) && Array.isArray(p.bank) && Array.isArray(answer) && answer.length === p.segments.length - 1 && answer.every(n => integerIn(n, (p.bank as unknown[]).length));
    case 'TRUE_FALSE_NOT_GIVEN': return answer === 'TRUE' || answer === 'FALSE' || answer === 'NOT_GIVEN';
  }
}

function validQuestion(question: BossQuestion): boolean {
  const payload = question.payload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !question.prompt.trim() || !question.explanation.trim()) return false;
  const p = payload as Record<string, unknown>;
  const strings = (value: unknown, minimum: number) => Array.isArray(value) && value.length >= minimum && value.every(item => typeof item === 'string' && item.trim().length > 0);
  let shape = false;
  switch (question.type) {
    case 'MULTIPLE_CHOICE': shape = strings(p.options, 2); break;
    case 'FILL_BLANK': shape = typeof p.sentence === 'string' && p.sentence.includes('___'); break;
    case 'MATCHING': shape = strings(p.left, 1) && strings(p.right, 2); break;
    case 'CLOZE': shape = Array.isArray(p.segments) && p.segments.length >= 2 && p.segments.every(item => typeof item === 'string') && strings(p.bank, 2); break;
    case 'TRUE_FALSE_NOT_GIVEN': shape = typeof p.passage === 'string' && p.passage.trim().length > 0 && typeof p.statement === 'string' && p.statement.trim().length > 0; break;
  }
  return shape && validAnswer(question.type, payload, question.correctAnswer);
}

export class BossService {
  async journey(userId: string, tenseId: string) {
    const tense = await prisma.tense.findUnique({ where: { id: tenseId } });
    if (!tense) throw new BossError(404, 'Không tìm thấy thì này.');
    const [levels, bosses, levelProgress, bossProgress] = await Promise.all([
      prisma.level.findMany({ where: { tenseId }, orderBy: { order: 'asc' } }),
      prisma.bossCheckpoint.findMany({ where: { tenseId, published: true }, orderBy: { groupIndex: 'asc' } }),
      prisma.levelProgress.findMany({ where: { userId, level: { tenseId } } }),
      prisma.bossProgress.findMany({ where: { userId, boss: { tenseId } } }),
    ]);
    const lp = new Map(levelProgress.map(p => [p.levelId, p]));
    const bp = new Map(bossProgress.map(p => [p.bossId, p]));
    const bossByEnd = new Map(bosses.map(b => [b.sourceEnd, b]));
    const levelByOrder = new Map(levels.map(l => [l.order, l]));
    const nodes: Record<string, unknown>[] = [];
    for (const level of levels) {
      const previous = levelByOrder.get(level.order - 1);
      const previousPassed = level.order === 1 || Boolean(previous && lp.get(previous.id)?.passedAt);
      const gate = (level.order - 1) % 5 === 0 && level.order > 1 ? bossByEnd.get(level.order - 1) : null;
      const unlocked = ProgressionService.levelAccessible(level.order, previousPassed, Boolean(gate && bp.get(gate.id)?.passedAt));
      nodes.push({ type: 'LEVEL', id: level.id, order: level.order, name: level.name, unlocked, passed: Boolean(lp.get(level.id)?.passedAt), starsEarned: lp.get(level.id)?.stars ?? 0 });
      const boss = bossByEnd.get(level.order);
      if (boss) {
        const source = Array.from({ length: 5 }, (_, i) => levelByOrder.get(boss.sourceStart + i));
        const bossUnlocked = ProgressionService.bossAccessible(source.map(l => Boolean(l && lp.get(l.id)?.passedAt)));
        const p = bp.get(boss.id);
        nodes.push({ type: 'BOSS', id: boss.id, name: boss.name, groupIndex: boss.groupIndex, sourceStart: boss.sourceStart, sourceEnd: boss.sourceEnd, unlocked: bossUnlocked, passed: Boolean(p?.passedAt), bestScore: p?.bestScore ?? 0, bestStars: p?.bestStars ?? 0 });
      }
    }
    return { tense: { id: tense.id, name: tense.name }, nodes };
  }

  async getBoss(userId: string, bossId: string) {
    const boss = await prisma.bossCheckpoint.findUnique({ where: { id: bossId } });
    if (!boss?.published) throw new BossError(404, 'Không tìm thấy Boss.');
    const [unlocked, progress] = await Promise.all([
      new ProgressionService().bossUnlocked(userId, boss),
      prisma.bossProgress.findUnique({ where: { userId_bossId: { userId, bossId } } }),
    ]);
    return { id: boss.id, tenseId: boss.tenseId, name: boss.name, groupIndex: boss.groupIndex, sourceStart: boss.sourceStart, sourceEnd: boss.sourceEnd, passThreshold: boss.passThreshold, unlocked, passed: Boolean(progress?.passedAt), bestScore: progress?.bestScore ?? 0, bestStars: progress?.bestStars ?? 0 };
  }

  async start(userId: string, bossId: string) {
    return prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
      const boss = await tx.bossCheckpoint.findUnique({ where: { id: bossId } });
      if (!boss?.published) throw new BossError(404, 'Không tìm thấy Boss.');
      if (!await new ProgressionService(tx).bossUnlocked(userId, boss)) throw new BossError(403, 'Boss chưa mở khóa.');
      const active = await tx.bossAttempt.findFirst({ where: { userId, bossId, status: 'ACTIVE' }, include: { questions: { orderBy: { position: 'asc' } }, boss: true } });
      if (active) return this.serializeAttempt(active);
      const levels = await tx.level.findMany({ where: { tenseId: boss.tenseId, order: { gte: boss.sourceStart, lte: boss.sourceEnd } }, orderBy: { order: 'asc' } });
      if (levels.length !== 5) throw new BossError(409, 'Bài thử thách chưa sẵn sàng.');
      const pool = (await tx.bossQuestion.findMany({ where: { bossId, published: true, sourceLevelId: { in: levels.map(l => l.id) } } })).filter(validQuestion);
      const selected: BossQuestion[] = [];
      for (const level of levels) {
        const candidates = pool.filter(q => q.sourceLevelId === level.id);
        if (candidates.length < 2) throw new BossError(409, 'Bài thử thách chưa đủ câu hỏi.');
        // Random order is server-owned; never use a client-provided selection.
        selected.push(...this.shuffle(candidates).slice(0, 2));
      }
      const shuffled = this.shuffle(selected);
      const attempt = await tx.bossAttempt.create({
        data: { userId, bossId, questions: { create: shuffled.map((q, i) => ({
          bossQuestionId: q.id, sourceLevelId: q.sourceLevelId, position: i + 1, type: q.type,
          prompt: q.prompt, payload: q.payload as Prisma.InputJsonValue, correctAnswer: q.correctAnswer as Prisma.InputJsonValue, explanation: q.explanation,
        })) } },
        include: { questions: { orderBy: { position: 'asc' } }, boss: true },
      });
      return this.serializeAttempt(attempt);
    });
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private serializeAttempt(attempt: AttemptWithQuestions) {
    const finished = attempt.status === 'COMPLETED';
    const victory = finished && attempt.correctCount >= attempt.boss.passThreshold;
    return {
      id: attempt.id, bossId: attempt.bossId, status: attempt.status,
      currentPosition: attempt.currentPosition, correctCount: attempt.correctCount,
      bossHp: victory ? 0 : 100 - attempt.correctCount * 10,
      totalQuestions: TOTAL,
      currentQuestion: finished ? null : publicQuestion(attempt.questions[attempt.currentPosition - 1]),
      result: finished ? { score: attempt.correctCount, passed: victory, stars: starsFor(attempt.correctCount, attempt.boss.passThreshold), bossHp: victory ? 0 : 100 - attempt.correctCount * 10 } : null,
    };
  }

  async getAttempt(userId: string, attemptId: string) {
    const attempt = await prisma.bossAttempt.findFirst({ where: { id: attemptId, userId }, include: { questions: { orderBy: { position: 'asc' } }, boss: true } });
    if (!attempt) throw new BossError(404, 'Không tìm thấy lượt chơi.');
    const boss = await this.getBoss(userId, attempt.bossId);
    return { boss, ...this.serializeAttempt(attempt) };
  }

  async answer(userId: string, attemptId: string, questionId: string, answer: unknown) {
    return prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
      const attempt = await tx.bossAttempt.findFirst({ where: { id: attemptId, userId }, include: { questions: { orderBy: { position: 'asc' } }, boss: true } });
      if (!attempt) throw new BossError(404, 'Không tìm thấy lượt chơi.');
      const question = attempt.questions.find(q => q.id === questionId);
      if (!question) throw new BossError(400, 'Câu hỏi không thuộc lượt chơi.');
      if (question.answeredAt) {
        if (!same(question.submittedAnswer, answer)) throw new BossError(409, 'Câu trả lời đã được chốt.');
        return this.feedback(attempt, question, true);
      }
      if (attempt.status !== 'ACTIVE') throw new BossError(409, 'Lượt chơi đã kết thúc.');
      if (question.position !== attempt.currentPosition) throw new BossError(409, 'Hãy trả lời câu hiện tại.');
      if (!validAnswer(question.type, question.payload, answer)) throw new BossError(400, 'Câu trả lời không hợp lệ.');
      const correct = same(answer, question.correctAnswer);
      const count = attempt.correctCount + Number(correct);
      const completed = question.position === TOTAL;
      await tx.bossAttemptQuestion.update({ where: { id: question.id }, data: { submittedAnswer: answer as Prisma.InputJsonValue, isCorrect: correct, answeredAt: new Date() } });
      const advance = await tx.bossAttempt.updateMany({
        where: { id: attempt.id, status: 'ACTIVE', currentPosition: question.position, version: attempt.version },
        data: { currentPosition: question.position + 1, correctCount: count, version: { increment: 1 }, status: completed ? 'COMPLETED' : 'ACTIVE', completedAt: completed ? new Date() : null },
      });
      if (advance.count !== 1) throw new BossError(409, 'Lượt chơi đã thay đổi. Hãy tải lại.');
      if (completed) {
        const stars = starsFor(count, attempt.boss.passThreshold);
        const passed = count >= attempt.boss.passThreshold;
        const prior = await tx.bossProgress.findUnique({ where: { userId_bossId: { userId, bossId: attempt.bossId } } });
        await tx.bossProgress.upsert({
          where: { userId_bossId: { userId, bossId: attempt.bossId } },
          create: { userId, bossId: attempt.bossId, bestScore: count, bestStars: stars, passedAt: passed ? new Date() : null },
          update: { bestScore: Math.max(prior?.bestScore ?? 0, count), bestStars: Math.max(prior?.bestStars ?? 0, stars), passedAt: prior?.passedAt ?? (passed ? new Date() : null) },
        });
      }
      const updated = await tx.bossAttempt.findUniqueOrThrow({ where: { id: attempt.id }, include: { questions: { orderBy: { position: 'asc' } }, boss: true } });
      return this.feedback(updated, updated.questions[question.position - 1], false);
    });
  }

  private feedback(attempt: AttemptWithQuestions, question: BossAttemptQuestion, duplicate: boolean) {
    const countAtQuestion = attempt.questions.slice(0, question.position).filter(q => q.isCorrect).length;
    const countBefore = countAtQuestion - Number(question.isCorrect);
    const completed = attempt.status === 'COMPLETED';
    const passed = completed && attempt.correctCount >= attempt.boss.passThreshold;
    return {
      questionId: attempt.questions[question.position - 1].id, questionNumber: question.position, totalQuestions: TOTAL,
      isCorrect: question.isCorrect, correctAnswer: question.correctAnswer, explanation: question.explanation,
      correctCount: countAtQuestion, bossHpBefore: 100 - countBefore * 10,
      bossHpAfter: passed && question.position === TOTAL ? 0 : 100 - countAtQuestion * 10,
      status: attempt.status, duplicate,
      nextQuestion: completed ? null : publicQuestion(attempt.questions[attempt.currentPosition - 1]),
      result: completed ? { score: attempt.correctCount, passed, stars: starsFor(attempt.correctCount, attempt.boss.passThreshold), bossHp: passed ? 0 : 100 - attempt.correctCount * 10 } : null,
    };
  }
}
