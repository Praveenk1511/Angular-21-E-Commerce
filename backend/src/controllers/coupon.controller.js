import { Coupon } from '../models/coupon.model.js';

export async function getCoupons(req, res) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
}

export async function validateCoupon(req, res) {
  try {
    const { code, cartSubtotalMinor } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Invalid promo code.' });

    if (coupon.status !== 'active') {
      return res.status(400).json({ message: `Coupon code is ${coupon.status}.` });
    }

    if (coupon.minimumSpendMinor && cartSubtotalMinor < coupon.minimumSpendMinor) {
      const minAmount = (coupon.minimumSpendMinor / 100).toFixed(2);
      return res.status(400).json({ message: `Minimum order of ₹${minAmount} required for this coupon.` });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error validating coupon', error: error.message });
  }
}

export async function createCoupon(req, res) {
  try {
    const coupon = new Coupon(req.body);
    const saved = await coupon.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create coupon', error: error.message });
  }
}

export async function updateCoupon(req, res) {
  try {
    const { id } = req.params;
    const updated = await Coupon.findOneAndUpdate({ id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Coupon not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update coupon', error: error.message });
  }
}

export async function deleteCoupon(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findOneAndDelete({ id });
    if (!deleted) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
  }
}
