import express from 'express';
import {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, createOrder);
router.patch('/:id/status', protect, authorize('admin', 'manager', 'staff'), updateOrderStatus);

export default router;
