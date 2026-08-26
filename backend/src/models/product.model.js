import mongoose from 'mongoose';

const productSpecificationSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const productImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brandId: { type: String, required: true },
    categoryId: { type: String, required: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    price: {
      currency: { type: String, default: 'INR' },
      amountMinor: { type: Number, required: true },
      compareAtMinor: { type: Number, default: null },
    },
    thumbnail: { type: productImageSchema, required: true },
    images: [productImageSchema],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      distribution: { type: [Number], default: [0, 0, 0, 0, 0] },
    },
    stock: {
      status: {
        type: String,
        enum: ['in-stock', 'low-stock', 'out-of-stock', 'preorder', 'discontinued'],
        default: 'in-stock',
      },
      available: { type: Number, default: 0 },
    },
    badges: [{ type: String }],
    specifications: [productSpecificationSchema],
    tags: [{ type: String }],
    lifecycle: {
      type: String,
      enum: ['active', 'preorder', 'discontinued'],
      default: 'active',
    },
    weightGrams: { type: Number, default: 1000 },
    warrantyMonths: { type: Number, default: 12 },
    relatedProductIds: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Product = mongoose.model('Product', productSchema);
