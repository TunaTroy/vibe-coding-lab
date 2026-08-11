import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { Role } from '@prisma/client';

const router = Router();

router.get('/test', requireAuth, requireRole(Role.ADMIN), (req, res) => {
  res.status(200).json({ message: 'Admin access granted.' });
});

export default router;
