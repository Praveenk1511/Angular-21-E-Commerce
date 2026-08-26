import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Brand = mongoose.model('Brand', brandSchema);
