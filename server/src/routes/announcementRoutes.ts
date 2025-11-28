import { Router } from 'express';
import { createAnnouncement, getAnnouncements, getActiveAnnouncement, deleteAnnouncement, toggleActive } from '../controllers/announcementController';

const router = Router();

router.post('/', createAnnouncement);
router.get('/', getAnnouncements);
router.get('/active', getActiveAnnouncement);
router.delete('/:id', deleteAnnouncement);
router.put('/:id/toggle', toggleActive);

export default router;
