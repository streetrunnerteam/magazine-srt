import { Router } from 'express';
import { getRanking, getBadges, getRewards, redeemReward, createReward, deleteReward, dailyLogin, getMyRedemptions, getDailyLoginStatus } from '../controllers/gamificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/ranking', authenticateToken, getRanking);
router.get('/badges', authenticateToken, getBadges);
router.get('/rewards', authenticateToken, getRewards);
router.get('/rewards/my', authenticateToken, getMyRedemptions);
router.post('/rewards/redeem', authenticateToken, redeemReward);
router.post('/rewards', authenticateToken, createReward);
router.delete('/rewards/:id', authenticateToken, deleteReward);
router.post('/daily-login', authenticateToken, dailyLogin);
router.get('/daily-login/status', authenticateToken, getDailyLoginStatus);

export default router;
