import { Request, Response } from 'express';
import User from '../models/User';
import Profile from '../models/Profile';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  AuthRequest,
} from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('Email already registered', 409);

  const user = await User.create({ name, email, password });

  // Create empty profile
  await Profile.create({ userId: user._id });

  const accessToken = generateAccessToken(user._id.toString(), user.email);
  const refreshToken = generateRefreshToken(user._id.toString(), user.email);

  user.refreshTokens.push(refreshToken);
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const accessToken = generateAccessToken(user._id.toString(), user.email);
  const refreshToken = generateRefreshToken(user._id.toString(), user.email);

  // Keep max 5 refresh tokens
  if (user.refreshTokens.length >= 5) user.refreshTokens.shift();
  user.refreshTokens.push(refreshToken);
  await user.save();

  const profile = await Profile.findOne({ userId: user._id });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
      profile,
      accessToken,
      refreshToken,
    },
  });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;
  if (!token) throw new AppError('Refresh token required', 400);

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.userId);
  if (!user || !user.refreshTokens.includes(token)) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Rotate token
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  const newAccessToken = generateAccessToken(user._id.toString(), user.email);
  const newRefreshToken = generateRefreshToken(user._id.toString(), user.email);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  res.json({
    success: true,
    data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
  });
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;
  const user = req.user!;

  if (token) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    await user.save();
  }

  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const profile = await Profile.findOne({ userId: user._id });

  res.json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
      profile,
    },
  });
};
