import { Router } from 'express';
import { LevelController } from '../controllers/levelController';
import { requireAuth } from '../middleware/requireAuth';
import { LevelRepository } from '../repositories/levelRepository';
import { LevelService } from '../services/levelService';

const router = Router();
const levelController = new LevelController(new LevelService(new LevelRepository()));

router.get('/first', requireAuth, levelController.getFirstLevel);
router.get('/:id/questions', requireAuth, levelController.getLevelQuestions);
router.post('/:id/submit', requireAuth, levelController.submitLevel);

export default router;
