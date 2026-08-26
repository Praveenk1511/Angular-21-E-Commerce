import express from 'express';
import { getInventory, updateInventoryStock } from '../controllers/inventory.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'manager', 'staff'), getInventory);
router.patch('/:id', protect, authorize('admin', 'manager', 'staff'), updateInventoryStock);

export default router;
