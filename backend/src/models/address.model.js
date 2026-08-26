import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['shipping', 'billing'], default: 'shipping' },
    label: { type: String, required: true },
    recipient: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: null },
    city: { type: String, required: true },
    region: { type: String, required: true },
    postcode: { type: String, required: true },
    countryCode: { type: String, default: 'IN' },
    phone: { type: String, default: null },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Address = mongoose.model('Address', addressSchema);
