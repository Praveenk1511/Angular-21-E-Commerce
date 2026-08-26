import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    verifiedPurchase: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Review = mongoose.model('Review', reviewSchema);
