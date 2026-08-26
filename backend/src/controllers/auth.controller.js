import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

function generateToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'lumen_ecommerce_super_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account is suspended' });
    }

    user.lastSeenAt = new Date();
    await user.save();

    const token = generateToken(user.id, user.role);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      user: userObj,
      token,
      expiresAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
}

export async function register(req, res) {
  try {
    const { firstName, lastName, email, password, marketingOptIn } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      id: `usr-${Date.now()}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: 'customer',
      status: 'active',
      marketingOptIn: !!marketingOptIn,
    });

    await newUser.save();

    const token = generateToken(newUser.id, newUser.role);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      user: userObj,
      token,
      expiresAt,
    });
  } catch (error) {
    res.status(400).json({ message: 'Registration error', error: error.message });
  }
}

export async function me(req, res) {
  try {
    const user = req.user.toObject();
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
}

export async function logout(req, res) {
  res.json({ message: 'Logged out successfully' });
}
