import { Router } from 'express';
import { createPost, deletePost, getComments } from '../controllers/postController';
import { authenticateToken } from '../middleware/authMiddleware';
import { commentPost } from '../controllers/feedController';

const router = Router();

router.post('/', authenticateToken, createPost);
router.delete('/:id', authenticateToken, deletePost);

// Comments routes
router.post('/:id/comments', authenticateToken, commentPost); // commentPost expects :id param
router.get('/:postId/comments', authenticateToken, getComments); // getComments expects :postId param

export default router;
