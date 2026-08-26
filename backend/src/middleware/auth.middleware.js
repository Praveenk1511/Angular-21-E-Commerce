import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export async function protect(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lumen_ecommerce_super_secret_jwt_key_2026');
    req.user = await User.findOne({ id: decoded.id }).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User session invalid or expired' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid or expired', error: error.message });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}
