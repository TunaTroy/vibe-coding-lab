import { prisma } from '../config/prisma';
import { LevelRepository } from '../repositories/levelRepository';
import { LevelService } from '../services/levelService';
import { QuestionType } from '@prisma/client';

describe('Level integration tests', () => {
  const createdUserIds: string[] = [];
  const createdTenseIds: string[] = [];
  const createdLevelIds: string[] = [];
  const levelRepository = new LevelRepository();
  const levelService = new LevelService(levelRepository);

  afterEach(async () => {
    // Clean up in reverse order of dependencies
    await prisma.coinTransaction.deleteMany({
      where: { userId: { in: createdUserIds } },
    });

    await prisma.levelProgress.deleteMany({
      where: { userId: { in: createdUserIds } },
    });

    await prisma.question.deleteMany({
      where: { levelId: { in: createdLevelIds } },
    });

    await prisma.level.deleteMany({
      where: { id: { in: createdLevelIds } },
    });

    await prisma.tense.deleteMany({
      where: { id: { in: createdTenseIds } },
    });

    await prisma.user.deleteMany({
      where: { id: { in: createdUserIds } },
    });

    createdUserIds.length = 0;
    createdTenseIds.length = 0;
    createdLevelIds.length = 0;
  });

  it('getLevelQuestions returns questions WITHOUT correctAnswer', async () => {
    // Setup: Create test data
    const user = await prisma.user.create({
      data: { email: `test-${Date.now()}@example.com`, passwordHash: 'hash', coinBalance: 0 },
    });
    createdUserIds.push(user.id);

    const tense = await prisma.tense.create({
      data: { code: 'TEST_TENSE', name: 'Test Tense', order: 99 },
    });
    createdTenseIds.push(tense.id);

    const level = await prisma.level.create({
      data: {
        tenseId: tense.id,
        order: 1,
        passScore: 70,
        coinReward: 50,
      },
    });
    createdLevelIds.push(level.id);

    const question = await prisma.question.create({
      data: {
        levelId: level.id,
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: 'Test question',
        payload: { options: ['A', 'B', 'C', 'D'] },
        correctAnswer: 1,
        order: 1,
      },
    });

    // Test
    const result = await levelService.getLevelQuestions(level.id);

    expect(result.level).toMatchObject({
      id: level.id,
      order: 1,
      passScore: 70,
      coinReward: 50,
    });

    expect(result.questions).toHaveLength(1);
    expect(result.questions[0]).toMatchObject({
      id: question.id,
      type: 'MULTIPLE_CHOICE',
      prompt: 'Test question',
      payload: { options: ['A', 'B', 'C', 'D'] },
      order: 1,
    });

    // CRITICAL: correctAnswer must NOT be in response
    expect(result.questions[0]).not.toHaveProperty('correctAnswer');
  });

  it('submitLevel: First time pass with sufficient score awards Coin and sets passedAt', async () => {
    // Setup: Create test data
    const user = await prisma.user.create({
      data: { email: `test-${Date.now()}@example.com`, passwordHash: 'hash', coinBalance: 0 },
    });
    createdUserIds.push(user.id);

    const tense = await prisma.tense.create({
      data: { code: 'TEST_TENSE', name: 'Test Tense', order: 99 },
    });
    createdTenseIds.push(tense.id);

    const level = await prisma.level.create({
      data: {
        tenseId: tense.id,
        order: 1,
        passScore: 70,
        coinReward: 50,
      },
    });
    createdLevelIds.push(level.id);

    const question1 = await prisma.question.create({
      data: {
        levelId: level.id,
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: 'Question 1',
        payload: { options: ['A', 'B', 'C', 'D'] },
        correctAnswer: 1,
        order: 1,
      },
    });

    const question2 = await prisma.question.create({
      data: {
        levelId: level.id,
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: 'Question 2',
        payload: { options: ['A', 'B', 'C', 'D'] },
        correctAnswer: 2,
        order: 2,
      },
    });

    // Test: Submit with 1 correct answer (50% score) - should NOT pass
    const result1 = await levelService.submitLevel(user.id, {
      levelId: level.id,
      answers: [
        { questionId: question1.id, answer: 1 }, // correct
        { questionId: question2.id, answer: 0 }, // wrong
      ],
    });

    expect(result1.score).toBe(50);
    expect(result1.stars).toBe(0);
    expect(result1.coinAwarded).toBe(0);

    // Verify no LevelProgress was created (or created without passedAt)
    const progress1 = await levelRepository.findLevelProgress(user.id, level.id);
    expect(progress1).not.toBeNull();
    expect(progress1?.passedAt).toBeNull();
    expect(progress1?.bestScore).toBe(50);

    // Test: Submit with 2 correct answers (100% score) - should pass and award Coin
    const result2 = await levelService.submitLevel(user.id, {
      levelId: level.id,
      answers: [
        { questionId: question1.id, answer: 1 }, // correct
        { questionId: question2.id, answer: 2 }, // correct
      ],
    });

    expect(result2.score).toBe(100);
    expect(result2.stars).toBe(3); // 100 >= 90
    expect(result2.coinAwarded).toBe(50);

    // Verify LevelProgress updated with passedAt
    const progress2 = await levelRepository.findLevelProgress(user.id, level.id);
    expect(progress2).not.toBeNull();
    expect(progress2?.passedAt).not.toBeNull();
    expect(progress2?.bestScore).toBe(100);
    expect(progress2?.stars).toBe(3);

    // Verify CoinTransaction created
    const transactions = await prisma.coinTransaction.findMany({
      where: { userId: user.id },
    });
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({
      userId: user.id,
      amount: 50,
      reason: 'Completed Level 1',
    });

    // Verify user coinBalance updated
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updatedUser?.coinBalance).toBe(50);
  });

  it('submitLevel: Second time pass does NOT award Coin (anti-farming)', async () => {
    // Setup: Create test data
    const user = await prisma.user.create({
      data: { email: `test-${Date.now()}@example.com`, passwordHash: 'hash', coinBalance: 0 },
    });
    createdUserIds.push(user.id);

    const tense = await prisma.tense.create({
      data: { code: 'TEST_TENSE', name: 'Test Tense', order: 99 },
    });
    createdTenseIds.push(tense.id);

    const level = await prisma.level.create({
      data: {
        tenseId: tense.id,
        order: 1,
        passScore: 70,
        coinReward: 50,
      },
    });
    createdLevelIds.push(level.id);

    const question = await prisma.question.create({
      data: {
        levelId: level.id,
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: 'Question',
        payload: { options: ['A', 'B', 'C', 'D'] },
        correctAnswer: 1,
        order: 1,
      },
    });

    // First submission: Pass and get Coin
    const result1 = await levelService.submitLevel(user.id, {
      levelId: level.id,
      answers: [{ questionId: question.id, answer: 1 }],
    });

    expect(result1.coinAwarded).toBe(50);

    let transactions = await prisma.coinTransaction.findMany({
      where: { userId: user.id },
    });
    expect(transactions).toHaveLength(1);

    // Second submission: Pass again but NO Coin
    const result2 = await levelService.submitLevel(user.id, {
      levelId: level.id,
      answers: [{ questionId: question.id, answer: 1 }],
    });

    expect(result2.coinAwarded).toBe(0); // CRITICAL: No coin on second pass

    // Verify no additional CoinTransaction
    transactions = await prisma.coinTransaction.findMany({
      where: { userId: user.id },
    });
    expect(transactions).toHaveLength(1); // Still only 1 transaction

    // Verify coinBalance unchanged
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updatedUser?.coinBalance).toBe(50); // Still 50, not 100
  });

  it('submitLevel: Cannot submit to locked level (order > 1 without previous progress)', async () => {
    // Setup: Create test data
    const user = await prisma.user.create({
      data: { email: `test-${Date.now()}@example.com`, passwordHash: 'hash', coinBalance: 0 },
    });
    createdUserIds.push(user.id);

    const tense = await prisma.tense.create({
      data: { code: 'TEST_TENSE', name: 'Test Tense', order: 99 },
    });
    createdTenseIds.push(tense.id);

    // Create Level 1 (order 1) - should be unlocked
    const level1 = await prisma.level.create({
      data: {
        tenseId: tense.id,
        order: 1,
        passScore: 70,
        coinReward: 50,
      },
    });
    createdLevelIds.push(level1.id);

    // Create Level 2 (order 2) - should be locked initially
    const level2 = await prisma.level.create({
      data: {
        tenseId: tense.id,
        order: 2,
        passScore: 70,
        coinReward: 50,
      },
    });
    createdLevelIds.push(level2.id);

    const question1 = await prisma.question.create({
      data: {
        levelId: level1.id,
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: 'Question 1',
        payload: { options: ['A', 'B', 'C', 'D'] },
        correctAnswer: 1,
        order: 1,
      },
    });

    const question2 = await prisma.question.create({
      data: {
        levelId: level2.id,
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: 'Question 2',
        payload: { options: ['A', 'B', 'C', 'D'] },
        correctAnswer: 1,
        order: 1,
      },
    });

    // Test: Try to submit Level 2 without passing Level 1 first
    await expect(
      levelService.submitLevel(user.id, {
        levelId: level2.id,
        answers: [{ questionId: question2.id, answer: 1 }],
      })
    ).rejects.toThrow('Level not unlocked. Complete previous level first.');

    // Verify no LevelProgress created for Level 2
    const progress2 = await levelRepository.findLevelProgress(user.id, level2.id);
    expect(progress2).toBeNull();

    // Pass Level 1 first
    await levelService.submitLevel(user.id, {
      levelId: level1.id,
      answers: [{ questionId: question1.id, answer: 1 }],
    });

    // Now Level 2 should be unlocked
    const result = await levelService.submitLevel(user.id, {
      levelId: level2.id,
      answers: [{ questionId: question2.id, answer: 1 }],
    });

    expect(result.score).toBe(100);
    expect(result.coinAwarded).toBe(50);

    // Verify LevelProgress created for Level 2
    const progress2After = await levelRepository.findLevelProgress(user.id, level2.id);
    expect(progress2After).not.toBeNull();
  });

  it('submitLevel: Stars calculation formula is correct', async () => {
    // Setup: Create test data with passScore = 60 to test all star tiers
    const user = await prisma.user.create({
      data: { email: `test-${Date.now()}@example.com`, passwordHash: 'hash', coinBalance: 0 },
    });
    createdUserIds.push(user.id);

    const tense = await prisma.tense.create({
      data: { code: 'TEST_TENSE', name: 'Test Tense', order: 99 },
    });
    createdTenseIds.push(tense.id);

    const level = await prisma.level.create({
      data: {
        tenseId: tense.id,
        order: 1,
        passScore: 60,
        coinReward: 50,
      },
    });
    createdLevelIds.push(level.id);

    const questions = await Promise.all([
      prisma.question.create({
        data: {
          levelId: level.id,
          type: QuestionType.MULTIPLE_CHOICE,
          prompt: 'Q1',
          payload: { options: ['A', 'B'] },
          correctAnswer: 1,
          order: 1,
        },
      }),
      prisma.question.create({
        data: {
          levelId: level.id,
          type: QuestionType.MULTIPLE_CHOICE,
          prompt: 'Q2',
          payload: { options: ['A', 'B'] },
          correctAnswer: 1,
          order: 2,
        },
      }),
      prisma.question.create({
        data: {
          levelId: level.id,
          type: QuestionType.MULTIPLE_CHOICE,
          prompt: 'Q3',
          payload: { options: ['A', 'B'] },
          correctAnswer: 1,
          order: 3,
        },
      }),
      prisma.question.create({
        data: {
          levelId: level.id,
          type: QuestionType.MULTIPLE_CHOICE,
          prompt: 'Q4',
          payload: { options: ['A', 'B'] },
          correctAnswer: 1,
          order: 4,
        },
      }),
      prisma.question.create({
        data: {
          levelId: level.id,
          type: QuestionType.MULTIPLE_CHOICE,
          prompt: 'Q5',
          payload: { options: ['A', 'B'] },
          correctAnswer: 1,
          order: 5,
        },
      }),
    ]);

    // Test: 100% score (5/5 correct) -> 3 stars (>= 90)
    const result100 = await levelService.submitLevel(user.id, {
      levelId: level.id,
      answers: questions.map((q) => ({ questionId: q.id, answer: 1 })),
    });
    expect(result100.score).toBe(100);
    expect(result100.stars).toBe(3);

    // Test: 80% score (4/5 correct) -> 2 stars (>= 70 but < 90)
    const result80 = await levelService.submitLevel(user.id, {
      levelId: level.id,
      answers: [
        { questionId: questions[0].id, answer: 1 },
        { questionId: questions[1].id, answer: 1 },
        { questionId: questions[2].id, answer: 1 },
        { questionId: questions[3].id, answer: 1 },
        { questionId: questions[4].id, answer: 0 }, // wrong
      ],
    });
    expect(result80.score).toBe(80);
    expect(result80.stars).toBe(2);

    // Test: 60% score (3/5 correct) -> 1 star (>= passScore but < 70)
    const result60 = await levelService.submitLevel(user.id, {
      levelId: level.id,
      answers: [
        { questionId: questions[0].id, answer: 1 },
        { questionId: questions[1].id, answer: 1 },
        { questionId: questions[2].id, answer: 1 },
        { questionId: questions[3].id, answer: 0 }, // wrong
        { questionId: questions[4].id, answer: 0 }, // wrong
      ],
    });
    expect(result60.score).toBe(60);
    expect(result60.stars).toBe(1);

    // Test: 40% score -> 0 stars (< passScore)
    const result40 = await levelService.submitLevel(user.id, {
      levelId: level.id,
      answers: [
        { questionId: questions[0].id, answer: 1 },
        { questionId: questions[1].id, answer: 1 },
        { questionId: questions[2].id, answer: 0 }, // wrong
        { questionId: questions[3].id, answer: 0 }, // wrong
        { questionId: questions[4].id, answer: 0 }, // wrong
      ],
    });
    expect(result40.score).toBe(40);
    expect(result40.stars).toBe(0);
  });
});
