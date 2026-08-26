import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['customer', 'staff', 'manager', 'admin'],
      default: 'customer',
    },
    status: {
      type: String,
      enum: ['active', 'invited', 'suspended'],
      default: 'active',
    },
    phone: { type: String, default: null },
    orderCount: { type: Number, default: 0 },
    marketingOptIn: { type: Boolean, default: false },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
