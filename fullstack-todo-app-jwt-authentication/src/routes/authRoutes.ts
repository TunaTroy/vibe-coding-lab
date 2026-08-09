import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { UserRepository } from '../repositories/userRepository';
import { AuthService } from '../services/authService';

const router = Router();
const authController = new AuthController(new AuthService(new UserRepository()));

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);

export default router;
