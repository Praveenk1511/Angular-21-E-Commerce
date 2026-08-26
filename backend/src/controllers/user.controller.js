import { User } from '../models/user.model.js';

export async function getUsers(req, res) {
  try {
    const { role, status, q } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findOne({ id }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
}

export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, role } = req.body;
    const update = {};
    if (status) update.status = status;
    if (role) update.role = role;

    const updated = await User.findOneAndUpdate({ id }, update, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user status', error: error.message });
  }
}
