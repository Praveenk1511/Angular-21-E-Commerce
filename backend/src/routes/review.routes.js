import express from 'express';
import { createReview, getReviewsByProduct } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/products/:productId/reviews', getReviewsByProduct);
router.post('/products/:productId/reviews', protect, createReview);

export default router;
