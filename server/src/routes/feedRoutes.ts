import { Router } from 'express';
import * as feedController from '../controllers/feedController';
import { authenticateToken, authenticateTokenOptional } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateTokenOptional, feedController.getFeed);
router.post('/', authenticateToken, feedController.createPost);
router.post('/:id/like', authenticateToken, feedController.likePost);
router.post('/:id/comment', authenticateToken, feedController.commentPost);
router.post('/stories/:storyUserId/like', authenticateToken, feedController.likeStory);

export default router;
