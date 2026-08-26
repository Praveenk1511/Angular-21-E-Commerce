import express from 'express';
import { getUserById, getUsers, updateUserStatus } from '../controllers/user.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'manager'), getUsers);
router.get('/:id', protect, authorize('admin', 'manager'), getUserById);
router.patch('/:id/status', protect, authorize('admin'), updateUserStatus);

export default router;
