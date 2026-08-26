import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    productId: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true },
    onHand: { type: Number, required: true, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 5 },
    reorderQuantity: { type: Number, default: 20 },
    warehouseLocation: { type: String, default: 'Warehouse-A' },
  },
  { timestamps: true },
);

export const Inventory = mongoose.model('Inventory', inventorySchema);
