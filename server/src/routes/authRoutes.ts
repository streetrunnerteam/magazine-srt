import { Router } from 'express';
import { register, login, requestPasswordReset, resetPassword } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
