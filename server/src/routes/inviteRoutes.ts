import { Router } from 'express';
import { createRequest, getRequests, approveRequest, rejectRequest } from '../controllers/inviteController';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public route to create a request
router.post('/', createRequest);

// Admin only routes
router.get('/', authenticateToken, isAdmin, getRequests);
router.post('/:id/approve', authenticateToken, isAdmin, approveRequest);
router.post('/:id/reject', authenticateToken, isAdmin, rejectRequest);

export default router;
