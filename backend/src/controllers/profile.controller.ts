import { Response } from 'express';
import Profile from '../models/Profile';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await Profile.findOne({ userId: req.userId });
  if (!profile) throw new AppError('Profile not found', 404);

  res.json({ success: true, data: profile });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    age, gender, height, weight, activityLevel, fitnessGoal,
    foodPreference, allergies, monthlyBudget, city, gymPreference, targetWeight,
  } = req.body;

  // Use find + save so the pre('save') hook runs and recalculates
  // BMI, dailyCalorieTarget, dailyProteinTarget, isProfileComplete
  let profile = await Profile.findOne({ userId: req.userId });
  if (!profile) {
    profile = new Profile({ userId: req.userId });
  }

  if (age !== undefined) profile.age = age;
  if (gender !== undefined) profile.gender = gender;
  if (height !== undefined) profile.height = height;
  if (weight !== undefined) profile.weight = weight;
  if (activityLevel !== undefined) profile.activityLevel = activityLevel;
  if (fitnessGoal !== undefined) profile.fitnessGoal = fitnessGoal;
  if (foodPreference !== undefined) profile.foodPreference = foodPreference;
  if (allergies !== undefined) profile.allergies = allergies;
  if (monthlyBudget !== undefined) profile.monthlyBudget = monthlyBudget;
  if (city !== undefined) profile.city = city;
  if (gymPreference !== undefined) profile.gymPreference = gymPreference;
  if (targetWeight !== undefined) profile.targetWeight = targetWeight;

  await profile.save(); // triggers pre('save') for BMI + calorie calculations

  res.json({ success: true, message: 'Profile updated', data: profile });
};
