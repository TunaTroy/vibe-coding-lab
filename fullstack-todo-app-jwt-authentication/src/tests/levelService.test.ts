// Mock prisma import BEFORE importing levelService
const mockPrisma = {
  $transaction: jest.fn(),
};

jest.mock('../config/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock LevelRepository
const mockLevelRepository = {
  findLevelById: jest.fn(),
  findQuestionsByLevelId: jest.fn(),
  findQuestionsByIds: jest.fn(),
  findLevelProgress: jest.fn(),
  findPreviousLevelProgress: jest.fn(),
  createLevelProgress: jest.fn(),
  updateLevelProgress: jest.fn(),
  createCoinTransaction: jest.fn(),
  updateUserCoinBalance: jest.fn(),
};

jest.mock('../repositories/levelRepository', () => ({
  LevelRepository: jest.fn().mockImplementation(() => mockLevelRepository),
}));

import { LevelService } from '../services/levelService';
import { LevelRepository } from '../repositories/levelRepository';

describe('LevelService (unit tests)', () => {
  let levelService: LevelService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create new instance with mocked repository
    levelService = new LevelService(new (LevelRepository as any)());
  });

  describe('getLevelQuestions', () => {
    it('should return level and questions without correctAnswer', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 70, coinReward: 50 };
      const mockQuestions = [
        {
          id: 'q1',
          levelId: 'level1',
          type: 'MULTIPLE_CHOICE',
          prompt: 'Test question',
          payload: { options: ['A', 'B'] },
          correctAnswer: 1,
          order: 1,
        },
      ];

      mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
      mockLevelRepository.findQuestionsByLevelId.mockResolvedValue(mockQuestions);

      const result = await levelService.getLevelQuestions('level1');

      expect(result.level).toMatchObject({
        id: 'level1',
        order: 1,
        passScore: 70,
        coinReward: 50,
      });

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0]).toMatchObject({
        id: 'q1',
        type: 'MULTIPLE_CHOICE',
        prompt: 'Test question',
        payload: { options: ['A', 'B'] },
        order: 1,
      });

      // CRITICAL: correctAnswer must NOT be in response
      expect(result.questions[0]).not.toHaveProperty('correctAnswer');
    });

    it('should throw error if level not found', async () => {
      mockLevelRepository.findLevelById.mockResolvedValue(null);

      await expect(levelService.getLevelQuestions('invalid')).rejects.toThrow('Level not found.');
    });
  });

  describe('submitLevel - score calculation', () => {
    it('should calculate score correctly (100%)', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 70, coinReward: 50 };
      const mockQuestions: any[] = [
        { id: 'q1', correctAnswer: 1 },
        { id: 'q2', correctAnswer: 2 },
      ];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(null);
        mockLevelRepository.createLevelProgress.mockResolvedValue({ id: 'progress1' });

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [
          { questionId: 'q1', answer: 1 }, // correct
          { questionId: 'q2', answer: 2 }, // correct
        ],
      });

      expect(result.score).toBe(100);
      expect(result.stars).toBe(3); // 100 >= 90
    });

    it('should calculate score correctly (50%)', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 70, coinReward: 50 };
      const mockQuestions: any[] = [
        { id: 'q1', correctAnswer: 1 },
        { id: 'q2', correctAnswer: 2 },
      ];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(null);
        mockLevelRepository.createLevelProgress.mockResolvedValue({ id: 'progress1' });

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [
          { questionId: 'q1', answer: 1 }, // correct
          { questionId: 'q2', answer: 0 }, // wrong
        ],
      });

      expect(result.score).toBe(50);
      expect(result.stars).toBe(0); // 50 < passScore (70)
    });

    it('should calculate stars correctly: score >= 90 -> 3 stars', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 60, coinReward: 50 };
      const mockQuestions: any[] = [
        { id: 'q1', correctAnswer: 1 },
        { id: 'q2', correctAnswer: 2 },
        { id: 'q3', correctAnswer: 3 },
        { id: 'q4', correctAnswer: 4 },
        { id: 'q5', correctAnswer: 5 },
      ];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(null);
        mockLevelRepository.createLevelProgress.mockResolvedValue({ id: 'progress1' });

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [
          { questionId: 'q1', answer: 1 },
          { questionId: 'q2', answer: 2 },
          { questionId: 'q3', answer: 3 },
          { questionId: 'q4', answer: 4 },
          { questionId: 'q5', answer: 5 },
        ],
      });

      expect(result.score).toBe(100);
      expect(result.stars).toBe(3);
    });

    it('should calculate stars correctly: score >= 70 but < 90 -> 2 stars', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 60, coinReward: 50 };
      const mockQuestions: any[] = [
        { id: 'q1', correctAnswer: 1 },
        { id: 'q2', correctAnswer: 2 },
        { id: 'q3', correctAnswer: 3 },
        { id: 'q4', correctAnswer: 4 },
        { id: 'q5', correctAnswer: 5 },
      ];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(null);
        mockLevelRepository.createLevelProgress.mockResolvedValue({ id: 'progress1' });

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [
          { questionId: 'q1', answer: 1 },
          { questionId: 'q2', answer: 2 },
          { questionId: 'q3', answer: 3 },
          { questionId: 'q4', answer: 4 },
          { questionId: 'q5', answer: 0 }, // wrong
        ],
      });

      expect(result.score).toBe(80);
      expect(result.stars).toBe(2);
    });

    it('should calculate stars correctly: score >= passScore but < 70 -> 1 star', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 60, coinReward: 50 };
      const mockQuestions: any[] = [
        { id: 'q1', correctAnswer: 1 },
        { id: 'q2', correctAnswer: 2 },
        { id: 'q3', correctAnswer: 3 },
        { id: 'q4', correctAnswer: 4 },
        { id: 'q5', correctAnswer: 5 },
      ];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(null);
        mockLevelRepository.createLevelProgress.mockResolvedValue({ id: 'progress1' });

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [
          { questionId: 'q1', answer: 1 },
          { questionId: 'q2', answer: 2 },
          { questionId: 'q3', answer: 3 },
          { questionId: 'q4', answer: 0 }, // wrong
          { questionId: 'q5', answer: 0 }, // wrong
        ],
      });

      expect(result.score).toBe(60);
      expect(result.stars).toBe(1);
    });

    it('should calculate stars correctly: score < passScore -> 0 stars', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 60, coinReward: 50 };
      const mockQuestions: any[] = [
        { id: 'q1', correctAnswer: 1 },
        { id: 'q2', correctAnswer: 2 },
        { id: 'q3', correctAnswer: 3 },
        { id: 'q4', correctAnswer: 4 },
        { id: 'q5', correctAnswer: 5 },
      ];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(null);
        mockLevelRepository.createLevelProgress.mockResolvedValue({ id: 'progress1' });

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [
          { questionId: 'q1', answer: 1 },
          { questionId: 'q2', answer: 2 },
          { questionId: 'q3', answer: 0 }, // wrong
          { questionId: 'q4', answer: 0 }, // wrong
          { questionId: 'q5', answer: 0 }, // wrong
        ],
      });

      expect(result.score).toBe(40);
      expect(result.stars).toBe(0);
    });
  });

  describe('submitLevel - coin award logic', () => {
    it('should award coin on first pass', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 70, coinReward: 50 };
      const mockQuestions: any[] = [{ id: 'q1', correctAnswer: 1 }];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(null); // First time
        mockLevelRepository.createLevelProgress.mockResolvedValue({ id: 'progress1' });

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [{ questionId: 'q1', answer: 1 }],
      });

      expect(result.coinAwarded).toBe(50);
      expect(mockLevelRepository.createCoinTransaction).toHaveBeenCalledWith({
        userId: 'user1',
        amount: 50,
        reason: 'Completed Level 1',
      });
      expect(mockLevelRepository.updateUserCoinBalance).toHaveBeenCalledWith('user1', 50);
    });

    it('should NOT award coin on second pass (anti-farming)', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 70, coinReward: 50 };
      const mockQuestions: any[] = [{ id: 'q1', correctAnswer: 1 }];
      const mockExistingProgress = {
        id: 'progress1',
        bestScore: 100,
        stars: 3,
        passedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(mockExistingProgress); // Already passed
        mockLevelRepository.updateLevelProgress.mockResolvedValue(mockExistingProgress);

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [{ questionId: 'q1', answer: 1 }],
      });

      expect(result.coinAwarded).toBe(0); // CRITICAL: No coin on second pass
      expect(mockLevelRepository.createCoinTransaction).not.toHaveBeenCalled();
      expect(mockLevelRepository.updateUserCoinBalance).not.toHaveBeenCalled();
    });

    it('should NOT award coin if score < passScore', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 70, coinReward: 50 };
      const mockQuestions: any[] = [{ id: 'q1', correctAnswer: 1 }];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(null);
        mockLevelRepository.createLevelProgress.mockResolvedValue({ id: 'progress1' });

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [{ questionId: 'q1', answer: 0 }], // wrong answer
      });

      expect(result.score).toBe(0);
      expect(result.coinAwarded).toBe(0);
      expect(mockLevelRepository.createCoinTransaction).not.toHaveBeenCalled();
    });

    it('should award coin on first pass when existingProgress exists but passedAt is null', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 70, coinReward: 50 };
      const mockQuestions: any[] = [{ id: 'q1', correctAnswer: 1 }];
      const mockExistingProgress = {
        id: 'progress1',
        bestScore: 50,
        stars: 0,
        passedAt: null, // Played before but never passed
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(mockExistingProgress);
        mockLevelRepository.updateLevelProgress.mockResolvedValue(mockExistingProgress);

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [{ questionId: 'q1', answer: 1 }],
      });

      expect(result.coinAwarded).toBe(50); // Should award coin on first pass
      expect(mockLevelRepository.createCoinTransaction).toHaveBeenCalledWith({
        userId: 'user1',
        amount: 50,
        reason: 'Completed Level 1',
      });
    });
  });

  describe('submitLevel - unlock verification', () => {
    it('should allow submission to level 1 (always unlocked)', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 70, coinReward: 50 };
      const mockQuestions: any[] = [{ id: 'q1', correctAnswer: 1 }];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(null);
        mockLevelRepository.createLevelProgress.mockResolvedValue({ id: 'progress1' });

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [{ questionId: 'q1', answer: 1 }],
      });

      expect(result.score).toBe(100);
      expect(mockLevelRepository.findPreviousLevelProgress).not.toHaveBeenCalled();
    });

    it('should reject submission to locked level (order > 1 without previous progress)', async () => {
      const mockLevel = { id: 'level2', order: 2, passScore: 70, coinReward: 50 };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findPreviousLevelProgress.mockResolvedValue(null); // No previous progress

        return callback(mockPrisma);
      });

      await expect(
        levelService.submitLevel('user1', {
          levelId: 'level2',
          answers: [],
        })
      ).rejects.toThrow('Level not unlocked. Complete previous level first.');
    });

    it('should allow submission to unlocked level (order > 1 with previous progress)', async () => {
      const mockLevel = { id: 'level2', order: 2, passScore: 70, coinReward: 50 };
      const mockQuestions: any[] = [{ id: 'q1', correctAnswer: 1 }];
      const mockPreviousProgress = {
        id: 'prev1',
        passedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findPreviousLevelProgress.mockResolvedValue(mockPreviousProgress);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(null);
        mockLevelRepository.createLevelProgress.mockResolvedValue({ id: 'progress1' });

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level2',
        answers: [{ questionId: 'q1', answer: 1 }],
      });

      expect(result.score).toBe(100);
    });
  });

  describe('submitLevel - correct answer security', () => {
    it('should fetch correct answers from DB, not trust client', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 70, coinReward: 50 };
      const mockQuestions: any[] = [{ id: 'q1', correctAnswer: 1 }];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(null);
        mockLevelRepository.createLevelProgress.mockResolvedValue({ id: 'progress1' });

        return callback(mockPrisma);
      });

      // Client sends wrong answer claiming it's correct
      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [{ questionId: 'q1', answer: 99 }], // Client sends 99, but DB says 1
      });

      expect(result.score).toBe(0); // Should be 0 because DB correctAnswer is 1, not 99
      expect(result.correctAnswers).toEqual({ q1: 1 }); // Returns DB's correct answer
    });

    it('should throw error if question not found', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 70, coinReward: 50 };
      const mockQuestions: any[] = []; // Empty - question not found

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);

        return callback(mockPrisma);
      });

      await expect(
        levelService.submitLevel('user1', {
          levelId: 'level1',
          answers: [{ questionId: 'q1', answer: 1 }],
        })
      ).rejects.toThrow('Question q1 not found.');
    });

    it('should throw error if level not found', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(null);

        return callback(mockPrisma);
      });

      await expect(
        levelService.submitLevel('user1', {
          levelId: 'invalid',
          answers: [],
        })
      ).rejects.toThrow('Level not found.');
    });
  });

  describe('submitLevel - best score update', () => {
    it('should update bestScore if current score is higher', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 70, coinReward: 50 };
      const mockQuestions: any[] = [{ id: 'q1', correctAnswer: 1 }];
      const mockExistingProgress = {
        id: 'progress1',
        bestScore: 50,
        stars: 0,
        passedAt: null,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(mockExistingProgress);
        mockLevelRepository.updateLevelProgress.mockResolvedValue(mockExistingProgress);

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [{ questionId: 'q1', answer: 1 }],
      });

      expect(result.score).toBe(100);
      expect(mockLevelRepository.updateLevelProgress).toHaveBeenCalledWith(
        'progress1',
        expect.objectContaining({
          bestScore: 100, // Updated from 50 to 100
        })
      );
    });

    it('should NOT update bestScore if current score is lower', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 70, coinReward: 50 };
      const mockQuestions: any[] = [{ id: 'q1', correctAnswer: 1 }];
      const mockExistingProgress = {
        id: 'progress1',
        bestScore: 100,
        stars: 3,
        passedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(mockExistingProgress);
        mockLevelRepository.updateLevelProgress.mockResolvedValue(mockExistingProgress);

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [{ questionId: 'q1', answer: 0 }], // wrong answer
      });

      expect(result.score).toBe(0);
      expect(mockLevelRepository.updateLevelProgress).toHaveBeenCalledWith(
        'progress1',
        expect.not.objectContaining({
          bestScore: 0, // Should NOT update bestScore
        })
      );
    });

    it('should update stars if current stars are higher', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 60, coinReward: 50 };
      const mockQuestions: any[] = [
        { id: 'q1', correctAnswer: 1 },
        { id: 'q2', correctAnswer: 2 },
        { id: 'q3', correctAnswer: 3 },
        { id: 'q4', correctAnswer: 4 },
        { id: 'q5', correctAnswer: 5 },
      ];
      const mockExistingProgress = {
        id: 'progress1',
        bestScore: 60,
        stars: 1,
        passedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(mockExistingProgress);
        mockLevelRepository.updateLevelProgress.mockResolvedValue(mockExistingProgress);

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [
          { questionId: 'q1', answer: 1 },
          { questionId: 'q2', answer: 2 },
          { questionId: 'q3', answer: 3 },
          { questionId: 'q4', answer: 4 },
          { questionId: 'q5', answer: 5 },
        ],
      });

      expect(result.score).toBe(100);
      expect(result.stars).toBe(3);
      expect(mockLevelRepository.updateLevelProgress).toHaveBeenCalledWith(
        'progress1',
        expect.objectContaining({
          stars: 3, // Updated from 1 to 3
        })
      );
    });

    it('should NOT update stars if current stars are lower', async () => {
      const mockLevel = { id: 'level1', order: 1, passScore: 60, coinReward: 50 };
      const mockQuestions: any[] = [
        { id: 'q1', correctAnswer: 1 },
        { id: 'q2', correctAnswer: 2 },
        { id: 'q3', correctAnswer: 3 },
        { id: 'q4', correctAnswer: 4 },
        { id: 'q5', correctAnswer: 5 },
      ];
      const mockExistingProgress = {
        id: 'progress1',
        bestScore: 100,
        stars: 3,
        passedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockLevelRepository.findLevelById.mockResolvedValue(mockLevel);
        mockLevelRepository.findQuestionsByIds.mockResolvedValue(mockQuestions);
        mockLevelRepository.findLevelProgress.mockResolvedValue(mockExistingProgress);
        mockLevelRepository.updateLevelProgress.mockResolvedValue(mockExistingProgress);

        return callback(mockPrisma);
      });

      const result = await levelService.submitLevel('user1', {
        levelId: 'level1',
        answers: [
          { questionId: 'q1', answer: 1 },
          { questionId: 'q2', answer: 2 },
          { questionId: 'q3', answer: 3 },
          { questionId: 'q4', answer: 0 }, // wrong
          { questionId: 'q5', answer: 0 }, // wrong
        ],
      });

      expect(result.score).toBe(60);
      expect(result.stars).toBe(1);
      expect(mockLevelRepository.updateLevelProgress).toHaveBeenCalledWith(
        'progress1',
        expect.not.objectContaining({
          stars: 1, // Should NOT update stars (existing is 3)
        })
      );
    });
  });
});
