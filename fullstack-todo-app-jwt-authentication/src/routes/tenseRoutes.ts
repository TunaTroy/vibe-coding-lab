import { Router } from 'express';
import { TenseController } from '../controllers/tenseController';
import { requireAuth } from '../middleware/requireAuth';
import { TenseRepository } from '../repositories/tenseRepository';
import { TenseService } from '../services/tenseService';
import { LevelService } from '../services/levelService';
import { LevelRepository } from '../repositories/levelRepository';
import { getJourney } from '../controllers/bossController';

const router = Router();

const tenseController = new TenseController(
  new TenseService(new TenseRepository(), new LevelService(new LevelRepository()))
);

// Danh sách Thì (hiện chỉ Present Simple)
router.get('/', requireAuth, tenseController.getTenses);

// Level của một Thì (kèm tiến độ) — đặt TRƯỚC route nào khớp tham số đơn
router.get('/:tenseId/levels', requireAuth, tenseController.getLevelsByTense);
router.get('/:tenseId/journey', requireAuth, getJourney);

export default router;
