import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    parentId: { type: String, default: null },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    heroImageUrl: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    totalProductCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Category = mongoose.model('Category', categorySchema);
