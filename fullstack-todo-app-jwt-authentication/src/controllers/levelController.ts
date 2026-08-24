import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { LevelService } from '../services/levelService';
import { submitLevelSchema } from '../validators/authValidators';

export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  getFirstLevel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.levelService.getFirstLevel();
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  getLevelQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const levelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await this.levelService.getLevelQuestions(levelId);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  submitLevel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }

      const levelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      // Zod tự validate + tự reject nếu answer thiếu/null/undefined, throw ZodError
      // được catch ở block bên dưới -> trả 400 luôn, không cần check tay nữa
      const payload = submitLevelSchema.parse({ ...req.body, levelId });

      // Giờ payload.answers đã đúng kiểu AnswerInput[] ngay từ Zod, không cần cast tay
      const result = await this.levelService.submitLevel(userId, payload);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error.',
          errors: error.flatten().fieldErrors,
        });
      }

      // Handle unlock permission error
      if (error instanceof Error && error.message.includes('not unlocked')) {
        return res.status(403).json({ message: error.message });
      }

      next(error);
    }
  };

  getAllLevels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }

      const levels = await this.levelService.getAllLevelsWithProgress(userId);
      return res.status(200).json({ levels });
    } catch (error) {
      next(error);
    }
  };
}