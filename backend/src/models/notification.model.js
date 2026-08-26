import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    kind: {
      type: String,
      enum: ['order', 'price-drop', 'account', 'stock', 'system', 'promotion'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    readAt: { type: Date, default: null },
    actionUrl: { type: String, default: null },
  },
  { timestamps: true },
);

export const Notification = mongoose.model('Notification', notificationSchema);
