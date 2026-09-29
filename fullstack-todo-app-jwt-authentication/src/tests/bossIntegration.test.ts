import { QuestionType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { BossService } from '../services/bossService';
import { ProgressionService } from '../services/progressionService';
import { LevelService } from '../services/levelService';
import { LevelRepository } from '../repositories/levelRepository';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { env } from '../config/env';
// Seed lives outside the backend compiler's src root; Jest loads it for this integration test.
const { seedBoss } = require('../../prisma/bossSeed') as { seedBoss: (db: typeof prisma, tenseId: string) => Promise<void> };

jest.setTimeout(60000);

const service = new BossService();
const specs = [
  { type: QuestionType.MULTIPLE_CHOICE, payload: { options: ['a', 'b', 'c'], hint: 'secret' }, correct: 1, wrong: 0 },
  { type: QuestionType.FILL_BLANK, payload: { sentence: 'She ___.' }, correct: 'plays', wrong: 'play' },
  { type: QuestionType.MATCHING, payload: { left: ['I', 'She'], right: ['play', 'plays'] }, correct: [0, 1], wrong: [1, 0] },
  { type: QuestionType.CLOZE, payload: { segments: ['She ', ' and ', '.'], bank: ['play', 'plays', 'run', 'runs'] }, correct: [1, 3], wrong: [0, 2] },
  { type: QuestionType.TRUE_FALSE_NOT_GIVEN, payload: { passage: 'Tom runs.', statement: 'Tom runs.' }, correct: 'TRUE', wrong: 'FALSE' },
];

describe('Boss progression and attempts (PostgreSQL)', () => {
  let userId: string;
  let otherUserId: string;
  let tenseId: string;
  let bossId: string;
  let levelIds: string[];
  let extraTenseId: string | undefined;

  beforeEach(async () => {
    const suffix = `${Date.now()}-${Math.random()}`;
    const [user, other, tense] = await Promise.all([
      prisma.user.create({ data: { email: `boss-${suffix}@test.local` } }),
      prisma.user.create({ data: { email: `other-${suffix}@test.local` } }),
      prisma.tense.create({ data: { code: `BOSS_${suffix}`, name: 'Test', order: 99 } }),
    ]);
    userId = user.id; otherUserId = other.id; tenseId = tense.id;
    const levels = [];
    for (let order = 1; order <= 6; order++) {
      levels.push(await prisma.level.create({ data: { tenseId, order, name: `L${order}`, passScore: 70, coinReward: 0 } }));
    }
    levelIds = levels.map(l => l.id);
    const boss = await prisma.bossCheckpoint.create({ data: { tenseId, groupIndex: 1, sourceStart: 1, sourceEnd: 5, name: 'Guardian', published: true, passThreshold: 7 } });
    bossId = boss.id;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        const spec = specs[i];
        await prisma.bossQuestion.create({ data: { bossId, sourceLevelId: levelIds[i], code: `${i}-${j}`, type: spec.type, prompt: `Question ${i}-${j}`, payload: spec.payload, correctAnswer: spec.correct, explanation: 'Learn the rule.', published: true } });
      }
    }
  });

  afterEach(async () => {
    if (userId) await prisma.user.deleteMany({ where: { id: { in: [userId, otherUserId] } } });
    if (bossId) await prisma.bossQuestion.deleteMany({ where: { bossId } });
    if (tenseId) await prisma.tense.deleteMany({ where: { id: tenseId } });
    if (extraTenseId) await prisma.tense.deleteMany({ where: { id: extraTenseId } });
    extraTenseId = undefined;
  });

  async function passSources(count = 5) {
    await prisma.levelProgress.createMany({ data: levelIds.slice(0, count).map(levelId => ({ userId, levelId, bestScore: 100, stars: 3, passedAt: new Date() })), skipDuplicates: true });
  }

  async function finish(correctCount: number) {
    const started = await service.start(userId, bossId);
    const questions = await prisma.bossAttemptQuestion.findMany({ where: { attemptId: started.id }, orderBy: { position: 'asc' } });
    let last: any;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const spec = specs[levelIds.indexOf(q.sourceLevelId)];
      last = await service.answer(userId, started.id, q.id, i < correctCount ? spec.correct : spec.wrong);
    }
    return { started, questions, last };
  }

  it('locks Boss until all five source levels pass; blocks level 6 until Boss passes', async () => {
    await passSources(4);
    expect(await new ProgressionService().bossUnlocked(userId, (await prisma.bossCheckpoint.findUniqueOrThrow({ where: { id: bossId } })))).toBe(false);
    await expect(service.start(userId, bossId)).rejects.toMatchObject({ status: 403 });
    await passSources(5);
    expect(await new ProgressionService().bossUnlocked(userId, (await prisma.bossCheckpoint.findUniqueOrThrow({ where: { id: bossId } })))).toBe(true);
  });

  it('journey is ordered and returns authoritative Boss and level gates', async () => {
    await passSources();
    const journey = await service.journey(userId, tenseId);
    expect(journey.nodes.map(n => n.type)).toEqual(['LEVEL', 'LEVEL', 'LEVEL', 'LEVEL', 'LEVEL', 'BOSS', 'LEVEL']);
    expect(journey.nodes[5]).toMatchObject({ unlocked: true, passed: false, bestStars: 0 });
    expect(journey.nodes[6]).toMatchObject({ unlocked: false });
    expect(journey.nodes[5]).not.toHaveProperty('correctAnswer');
  });

  it('does not borrow prerequisite progress from another tense', async () => {
    await passSources(1);
    const other = await prisma.tense.create({ data: { code: `OTHER_${Date.now()}_${Math.random()}`, name: 'Other', order: 100 } });
    extraTenseId = other.id;
    await prisma.level.createMany({ data: [1, 2].map(order => ({ tenseId: other.id, order, name: `Other ${order}`, passScore: 70, coinReward: 0 })) });
    expect(await new ProgressionService().levelUnlocked(userId, { tenseId: other.id, order: 2 })).toBe(false);
  });

  it('generalizes the checkpoint gate to levels 6–10 and level 11', async () => {
    await passSources();
    await prisma.bossProgress.create({ data: { userId, bossId, bestScore: 7, bestStars: 1, passedAt: new Date() } });
    for (let order = 7; order <= 11; order++) {
      const level = await prisma.level.create({ data: { tenseId, order, name: `L${order}`, passScore: 70, coinReward: 0 } });
      levelIds.push(level.id);
    }
    const boss2 = await prisma.bossCheckpoint.create({ data: { tenseId, groupIndex: 2, sourceStart: 6, sourceEnd: 10, name: 'Second', published: true, passThreshold: 7 } });
    await prisma.levelProgress.createMany({ data: levelIds.slice(5, 9).map(levelId => ({ userId, levelId, passedAt: new Date() })) });
    expect(await new ProgressionService().bossUnlocked(userId, boss2)).toBe(false);
    await prisma.levelProgress.create({ data: { userId, levelId: levelIds[9], passedAt: new Date() } });
    expect(await new ProgressionService().bossUnlocked(userId, boss2)).toBe(true);
    expect(await new ProgressionService().levelUnlocked(userId, { tenseId, order: 11 })).toBe(false);
    await prisma.bossProgress.create({ data: { userId, bossId: boss2.id, bestScore: 7, bestStars: 1, passedAt: new Date() } });
    expect(await new ProgressionService().levelUnlocked(userId, { tenseId, order: 11 })).toBe(true);
  });

  it('normal levels reject duplicate, missing and foreign IDs, and hide locked questions', async () => {
    const levelService = new LevelService(new LevelRepository());
    const q1 = await prisma.question.create({ data: { levelId: levelIds[0], order: 1, type: 'MULTIPLE_CHOICE', prompt: 'Q1', payload: { options: ['a', 'b'] }, correctAnswer: 1 } });
    const q2 = await prisma.question.create({ data: { levelId: levelIds[0], order: 2, type: 'MULTIPLE_CHOICE', prompt: 'Q2', payload: { options: ['a', 'b'] }, correctAnswer: 1 } });
    const foreign = await prisma.question.create({ data: { levelId: levelIds[1], order: 1, type: 'MULTIPLE_CHOICE', prompt: 'Foreign', payload: { options: ['a', 'b'] }, correctAnswer: 1 } });
    await expect(levelService.getLevelQuestions(levelIds[1], userId)).rejects.toThrow('not unlocked');
    await expect(levelService.submitLevel(userId, { levelId: levelIds[0], answers: [{ questionId: q1.id, answer: 1 }, { questionId: q1.id, answer: 1 }] })).rejects.toThrow('Duplicate question IDs');
    await expect(levelService.submitLevel(userId, { levelId: levelIds[0], answers: [{ questionId: q1.id, answer: 1 }] })).rejects.toThrow('exactly once');
    await expect(levelService.submitLevel(userId, { levelId: levelIds[0], answers: [{ questionId: q1.id, answer: 1 }, { questionId: foreign.id, answer: 1 }] })).rejects.toThrow('exactly once');
    expect(await prisma.levelProgress.count({ where: { userId, levelId: levelIds[0] } })).toBe(0);
    const result = await levelService.submitLevel(userId, { levelId: levelIds[0], answers: [{ questionId: q1.id, answer: 1 }, { questionId: q2.id, answer: 1 }] });
    expect(result.score).toBe(100);
  });

  it('normal first-pass coin reward is granted once under concurrent submission', async () => {
    const levelService = new LevelService(new LevelRepository());
    await prisma.level.update({ where: { id: levelIds[0] }, data: { coinReward: 50 } });
    const question = await prisma.question.create({ data: { levelId: levelIds[0], order: 1, type: 'MULTIPLE_CHOICE', prompt: 'Q', payload: { options: ['a', 'b'] }, correctAnswer: 1 } });
    const input = { levelId: levelIds[0], answers: [{ questionId: question.id, answer: 1 }] };
    const results = await Promise.all([levelService.submitLevel(userId, input), levelService.submitLevel(userId, input)]);
    expect(results.map(r => r.coinAwarded).sort()).toEqual([0, 50]);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: userId } })).coinBalance).toBe(50);
    expect(await prisma.coinTransaction.count({ where: { userId } })).toBe(1);
  });

  it('creates ten snapshots, exactly two per source, resumes, hides answers and enforces ownership', async () => {
    await passSources();
    const attempt = await service.start(userId, bossId);
    expect(attempt.totalQuestions).toBe(10);
    expect(attempt.currentQuestion).not.toHaveProperty('correctAnswer');
    expect((attempt.currentQuestion?.payload as any).hint).toBeUndefined();
    expect((await service.start(userId, bossId)).id).toBe(attempt.id);
    const questions = await prisma.bossAttemptQuestion.findMany({ where: { attemptId: attempt.id } });
    expect(questions).toHaveLength(10);
    for (const id of levelIds.slice(0, 5)) expect(questions.filter(q => q.sourceLevelId === id)).toHaveLength(2);
    await expect(service.getAttempt(otherUserId, attempt.id)).rejects.toMatchObject({ status: 404 });
    await expect(service.answer(otherUserId, attempt.id, questions[0].id, specs[0].correct)).rejects.toMatchObject({ status: 404 });
  });

  it('concurrent starts resume one active attempt', async () => {
    await passSources();
    const [first, second] = await Promise.all([service.start(userId, bossId), service.start(userId, bossId)]);
    expect(first.id).toBe(second.id);
    expect(await prisma.bossAttempt.count({ where: { userId, bossId, status: 'ACTIVE' } })).toBe(1);
  });

  it('serves authenticated journey and attempt APIs without pre-answer leakage', async () => {
    await passSources();
    const cookie = `token=${jwt.sign({ sub: userId, email: 'boss@test.local', role: 'STUDENT' }, env.JWT_SECRET)}`;
    await request(app).get(`/api/tenses/${tenseId}/journey`).expect(401);
    const journey = await request(app).get(`/api/tenses/${tenseId}/journey`).set('Cookie', cookie).expect(200);
    expect(journey.body.nodes[5]).toMatchObject({ type: 'BOSS', unlocked: true });
    const boss = await request(app).get(`/api/bosses/${bossId}`).set('Cookie', cookie).expect(200);
    expect(boss.body).toMatchObject({ id: bossId, unlocked: true });
    const started = await request(app).post(`/api/bosses/${bossId}/attempts`).set('Cookie', cookie).expect(200);
    expect(started.body.currentQuestion).not.toHaveProperty('correctAnswer');
    expect(started.body.currentQuestion).not.toHaveProperty('explanation');
    const attemptId = started.body.id;
    const fetched = await request(app).get(`/api/boss-attempts/${attemptId}`).set('Cookie', cookie).expect(200);
    expect(fetched.body.currentQuestion.id).toBe(started.body.currentQuestion.id);
    await request(app).post(`/api/boss-attempts/${attemptId}/answers`).set('Cookie', cookie).send({ questionId: started.body.currentQuestion.id, answer: { invalid: true } }).expect(400);
    const question = await prisma.bossAttemptQuestion.findUniqueOrThrow({ where: { id: started.body.currentQuestion.id } });
    const graded = await request(app).post(`/api/boss-attempts/${attemptId}/answers`).set('Cookie', cookie).send({ questionId: question.id, answer: question.correctAnswer }).expect(200);
    expect(graded.body).toMatchObject({ isCorrect: true, explanation: 'Learn the rule.' });
    expect(graded.body.nextQuestion).not.toHaveProperty('correctAnswer');
  });

  it('rejects an insufficient published pool without creating an attempt', async () => {
    await passSources();
    await prisma.bossQuestion.deleteMany({ where: { bossId, code: '0-0' } });
    await expect(service.start(userId, bossId)).rejects.toMatchObject({ status: 409 });
    expect(await prisma.bossAttempt.count({ where: { userId, bossId } })).toBe(0);
  });

  it('Boss seed is idempotent and leaves in-progress snapshots intact', async () => {
    await passSources();
    const attempt = await service.start(userId, bossId);
    const before = await prisma.bossAttemptQuestion.findMany({ where: { attemptId: attempt.id }, orderBy: { position: 'asc' } });
    await seedBoss(prisma, tenseId);
    const count = await prisma.bossQuestion.count({ where: { bossId } });
    await seedBoss(prisma, tenseId);
    expect(await prisma.bossQuestion.count({ where: { bossId } })).toBe(count);
    const after = await prisma.bossAttemptQuestion.findMany({ where: { attemptId: attempt.id }, orderBy: { position: 'asc' } });
    expect(after).toEqual(before);
  });

  it('rejects foreign, skipped, malformed and changed answers; identical retry is idempotent', async () => {
    await passSources();
    const attempt = await service.start(userId, bossId);
    const questions = await prisma.bossAttemptQuestion.findMany({ where: { attemptId: attempt.id }, orderBy: { position: 'asc' } });
    const first = questions[0];
    await expect(service.answer(userId, attempt.id, 'foreign', 1)).rejects.toMatchObject({ status: 400 });
    await expect(service.answer(userId, attempt.id, questions[1].id, 1)).rejects.toMatchObject({ status: 409 });
    await expect(service.answer(userId, attempt.id, first.id, { bad: true })).rejects.toMatchObject({ status: 400 });
    const spec = specs[levelIds.indexOf(first.sourceLevelId)];
    const accepted = await service.answer(userId, attempt.id, first.id, spec.correct);
    expect(accepted.isCorrect).toBe(true);
    expect(accepted.correctAnswer).toEqual(spec.correct);
    expect(accepted.explanation).toBe('Learn the rule.');
    const retry = await service.answer(userId, attempt.id, first.id, spec.correct);
    expect(retry.duplicate).toBe(true);
    expect((await prisma.bossAttempt.findUniqueOrThrow({ where: { id: attempt.id } })).correctCount).toBe(1);
    await expect(service.answer(userId, attempt.id, first.id, spec.wrong)).rejects.toMatchObject({ status: 409 });
  });

  it.each([[6, false, 0, 40], [7, true, 1, 0], [8, true, 2, 0], [9, true, 3, 0], [10, true, 3, 0]])('grades %i/10 with correct pass, stars and final HP', async (score, passed, stars, hp) => {
    await passSources();
    const { last } = await finish(score as number);
    expect(last.result).toMatchObject({ score, passed, stars, bossHp: hp });
    const progress = await prisma.bossProgress.findUniqueOrThrow({ where: { userId_bossId: { userId, bossId } } });
    expect(progress.bestScore).toBe(score);
    expect(progress.bestStars).toBe(stars);
    expect(Boolean(progress.passedAt)).toBe(passed);
    expect(await new ProgressionService().levelUnlocked(userId, { tenseId, order: 6 })).toBe(passed);
  });

  it('concurrent final retries update one result and preserve best progress', async () => {
    await passSources();
    const attempt = await service.start(userId, bossId);
    const questions = await prisma.bossAttemptQuestion.findMany({ where: { attemptId: attempt.id }, orderBy: { position: 'asc' } });
    for (const q of questions.slice(0, 9)) {
      const spec = specs[levelIds.indexOf(q.sourceLevelId)];
      await service.answer(userId, attempt.id, q.id, spec.correct);
    }
    const last = questions[9];
    const answer = specs[levelIds.indexOf(last.sourceLevelId)].correct;
    const [a, b] = await Promise.all([service.answer(userId, attempt.id, last.id, answer), service.answer(userId, attempt.id, last.id, answer)]);
    expect(a.result).toEqual(b.result);
    expect(await prisma.bossProgress.count({ where: { userId, bossId } })).toBe(1);
    expect((await prisma.bossAttempt.findUniqueOrThrow({ where: { id: attempt.id } })).correctCount).toBe(10);
  });

  it('allows unlimited retries while preserving the best passed result', async () => {
    await passSources();
    await finish(8);
    const first = await prisma.bossProgress.findUniqueOrThrow({ where: { userId_bossId: { userId, bossId } } });
    await finish(6);
    const best = await prisma.bossProgress.findUniqueOrThrow({ where: { userId_bossId: { userId, bossId } } });
    expect(best).toMatchObject({ bestScore: 8, bestStars: 2 });
    expect(best.passedAt).toEqual(first.passedAt);
    expect(await prisma.bossAttempt.count({ where: { userId, bossId, status: 'COMPLETED' } })).toBe(2);
  });
});
