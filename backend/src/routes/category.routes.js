import express from 'express';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryByIdOrSlug,
  updateCategory,
} from '../controllers/category.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:idOrSlug', getCategoryByIdOrSlug);
router.post('/', protect, authorize('admin', 'manager'), createCategory);
router.put('/:id', protect, authorize('admin', 'manager'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
