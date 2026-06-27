import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ProgressEntry, MealPlan, WorkoutPlan } from '../models/Plans';
import Profile from '../models/Profile';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [profile, progressEntries, activeMealPlan, activeWorkoutPlan] = await Promise.all([
    Profile.findOne({ userId }),
    ProgressEntry.find({ userId, date: { $gte: thirtyDaysAgo } }).sort({ date: 1 }),
    MealPlan.findOne({ userId, isActive: true }),
    WorkoutPlan.findOne({ userId, isActive: true }),
  ]);

  // Calculate streaks
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const day = new Date(today.getTime() - i * 86400000);
    const entry = progressEntries.find(
      (e) => new Date(e.date).toDateString() === day.toDateString()
    );
    if (entry) currentStreak++;
    else break;
  }

  // Weekly averages
  const weekEntries = progressEntries.filter(
    (e) => new Date(e.date) >= new Date(Date.now() - 7 * 86400000)
  );
  const avgCalories = weekEntries.length
    ? Math.round(weekEntries.reduce((s, e) => s + (e.calories || 0), 0) / weekEntries.length)
    : 0;
  const avgProtein = weekEntries.length
    ? Math.round(weekEntries.reduce((s, e) => s + (e.protein || 0), 0) / weekEntries.length)
    : 0;

  // Budget usage this week
  const weeklyBudget = Math.round((profile?.monthlyBudget || 3000) / 4.3);

  res.json({
    success: true,
    data: {
      profile: {
        bmi: profile?.bmi,
        dailyCalorieTarget: profile?.dailyCalorieTarget,
        dailyProteinTarget: profile?.dailyProteinTarget,
        monthlyBudget: profile?.monthlyBudget,
        isProfileComplete: profile?.isProfileComplete,
      },
      stats: {
        currentStreak,
        avgCaloriesThisWeek: avgCalories,
        avgProteinThisWeek: avgProtein,
        weeklyBudget,
        totalWorkoutsThisMonth: progressEntries.filter((e) => e.workoutCompleted).length,
      },
      hasMealPlan: !!activeMealPlan,
      hasWorkoutPlan: !!activeWorkoutPlan,
      recentProgress: progressEntries.slice(-14).map((e) => ({
        date: e.date,
        calories: e.calories,
        protein: e.protein,
        weight: e.weight,
        workoutCompleted: e.workoutCompleted,
      })),
    },
  });
};

export const logProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weight, calories, protein, water, workoutCompleted, mood, notes, date } = req.body;

  const entryDate = date ? new Date(date) : new Date();
  entryDate.setHours(0, 0, 0, 0);

  const entry = await ProgressEntry.findOneAndUpdate(
    { userId: req.userId, date: entryDate },
    { weight, calories, protein, water, workoutCompleted, mood, notes },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(201).json({ success: true, message: 'Progress logged!', data: entry });
};

export const getProgressHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { days = 30 } = req.query;
  const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

  const entries = await ProgressEntry.find({
    userId: req.userId,
    date: { $gte: since },
  }).sort({ date: 1 });

  res.json({ success: true, data: entries });
};
