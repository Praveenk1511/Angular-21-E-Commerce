import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProductByIdOrSlug,
  getProducts,
  updateProduct,
} from '../controllers/product.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);
router.post('/', protect, authorize('admin', 'manager'), createProduct);
router.put('/:id', protect, authorize('admin', 'manager'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
