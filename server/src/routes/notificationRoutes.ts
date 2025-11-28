import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.put('/:id/read', authenticateToken, markAsRead);

export default router;
