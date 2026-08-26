import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    kind: {
      type: String,
      enum: ['percentage', 'fixed', 'free-shipping'],
      required: true,
    },
    description: { type: String, required: true },
    value: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    minimumSpendMinor: { type: Number, default: 0 },
    maximumDiscountMinor: { type: Number, default: null },
    startsAt: { type: Date, default: Date.now },
    endsAt: { type: Date, default: null },
    usageLimit: { type: Number, default: null },
    usageCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'scheduled', 'expired', 'exhausted', 'disabled'],
      default: 'active',
    },
    appliesToCategoryIds: [{ type: String }],
  },
  { timestamps: true },
);

export const Coupon = mongoose.model('Coupon', couponSchema);
