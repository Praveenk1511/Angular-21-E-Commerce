import { Order } from '../models/order.model.js';

export async function getOrders(req, res) {
  try {
    const { status, userId, page = 1, pageSize = 10 } = req.query;
    const query = {};

    if (req.user.role === 'customer') {
      query.userId = req.user.id;
    } else if (userId) {
      query.userId = userId;
    }

    if (status) query.status = status;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(pageSize));
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await Order.countDocuments(query);
    const items = await Order.find(query).sort({ placedAt: -1 }).skip(skip).limit(limitNum);

    res.json({
      items,
      meta: {
        page: pageNum,
        pageSize: limitNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
        totalItems,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ id });

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role === 'customer' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: Access denied to this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order details', error: error.message });
  }
}

export async function createOrder(req, res) {
  try {
    const orderData = req.body;
    const count = await Order.countDocuments();
    const reference = `LUM-2026-${(9000 + count + 1).toString().padStart(4, '0')}`;
    const id = `ord-${Date.now()}`;

    const newOrder = new Order({
      ...orderData,
      id,
      reference,
      userId: req.user ? req.user.id : orderData.userId,
      placedAt: new Date(),
      status: 'confirmed',
      timeline: [
        { status: 'confirmed', at: new Date(), note: 'Order placed successfully.' },
      ],
    });

    const saved = await newOrder.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create order', error: error.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = await Order.findOne({ id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.timeline.push({ status, at: new Date(), note: note || `Status updated to ${status}` });

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update order status', error: error.message });
  }
}
