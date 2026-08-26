import express from 'express';
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
  validateCoupon,
} from '../controllers/coupon.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'manager'), getCoupons);
router.post('/validate', validateCoupon);
router.post('/', protect, authorize('admin', 'manager'), createCoupon);
router.put('/:id', protect, authorize('admin', 'manager'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

export default router;
