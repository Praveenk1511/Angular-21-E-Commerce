import { Notification } from '../models/notification.model.js';

export async function getUserNotifications(req, res) {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { id, userId: req.user.id },
      { readAt: new Date() },
      { new: true },
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: 'Error updating notification', error: error.message });
  }
}
