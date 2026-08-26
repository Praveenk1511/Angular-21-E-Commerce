import express from 'express';
import { getUserNotifications, markNotificationRead } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getUserNotifications);
router.patch('/:id/read', protect, markNotificationRead);

export default router;
