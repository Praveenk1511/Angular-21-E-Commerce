import mongoose from 'mongoose';

const orderLineSchema = new mongoose.Schema({
  id: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productSlug: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: {
    currency: { type: String, default: 'INR' },
    amountMinor: { type: Number, required: true },
    compareAtMinor: { type: Number },
  },
  lineTotalMinor: { type: Number, required: true },
});

const addressSchema = new mongoose.Schema({
  id: String,
  userId: String,
  type: String,
  label: String,
  recipient: String,
  line1: String,
  line2: String,
  city: String,
  region: String,
  postcode: String,
  countryCode: String,
  phone: String,
  isDefault: Boolean,
});

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    reference: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'on-hold',
        'shipped',
        'out-for-delivery',
        'delivered',
        'cancelled',
        'refunded',
        'returned',
      ],
      default: 'pending',
    },
    placedAt: { type: Date, default: Date.now },
    itemCount: { type: Number, required: true },
    totals: {
      currency: { type: String, default: 'INR' },
      subtotalMinor: { type: Number, required: true },
      discountMinor: { type: Number, default: 0 },
      shippingMinor: { type: Number, default: 0 },
      taxMinor: { type: Number, default: 0 },
      grandTotalMinor: { type: Number, required: true },
    },
    lines: [orderLineSchema],
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    payment: {
      kind: { type: String, default: 'card' },
      status: { type: String, default: 'paid' },
      maskedIdentifier: { type: String, default: '•••• 1234' },
      brand: { type: String, default: 'Visa' },
    },
    shipping: {
      method: { type: String, default: 'standard' },
      carrier: { type: String, default: 'Delhivery Express' },
      trackingNumber: { type: String, default: '' },
      estimatedDeliveryAt: Date,
      shippedAt: Date,
      deliveredAt: Date,
    },
    couponCode: { type: String, default: null },
    customerNote: { type: String, default: null },
    timeline: [
      {
        status: String,
        at: Date,
        note: String,
      },
    ],
  },
  { timestamps: true },
);

export const Order = mongoose.model('Order', orderSchema);
