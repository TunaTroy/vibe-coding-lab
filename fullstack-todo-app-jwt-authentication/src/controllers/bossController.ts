import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { BossError, BossService } from '../services/bossService';

const service = new BossService();
const answerSchema = z.object({ questionId: z.string().min(1), answer: z.union([z.string(), z.number(), z.array(z.number())]) }).strict();
const param = (value: string | string[]) => Array.isArray(value) ? value[0] : value;

const handle = (fn: (req: Request) => Promise<unknown>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized.' });
    return res.json(await fn(req));
  } catch (error) {
    if (error instanceof BossError) return res.status(error.status).json({ message: error.message });
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Câu trả lời không hợp lệ.' });
    next(error);
  }
};

export const getJourney = handle(req => service.journey(req.user!.id, param(req.params.tenseId)));
export const getBoss = handle(req => service.getBoss(req.user!.id, param(req.params.bossId)));
export const startBossAttempt = handle(req => service.start(req.user!.id, param(req.params.bossId)));
export const getBossAttempt = handle(req => service.getAttempt(req.user!.id, param(req.params.attemptId)));
export const submitBossAnswer = handle(req => {
  const body = answerSchema.parse(req.body);
  return service.answer(req.user!.id, param(req.params.attemptId), body.questionId, body.answer);
});
