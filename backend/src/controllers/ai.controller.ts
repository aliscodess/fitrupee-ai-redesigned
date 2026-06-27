import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Profile from '../models/Profile';
import { MealPlan, WorkoutPlan, GroceryPlan, AIChat } from '../models/Plans';
import {
  generateMealPlan,
  generateWorkoutPlan,
  generateGroceryPlan,
  generateProteinBudgetPlan,
  chatWithAI,
  analyzeFoodImage,
  getFoodSubstitutions,
} from '../services/groq.service';
import { AppError } from '../middleware/errorHandler';

const getProfile = async (userId: string) => {
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new AppError('Please complete your profile first', 400);
  return profile;
};

export const createMealPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await getProfile(req.userId!);

    console.log('Profile for meal plan:', JSON.stringify(profile.toObject()));

    const { days = 7 } = req.body;

    const planData = await generateMealPlan(profile.toObject(), days);

    console.log('Generated meal plan:', JSON.stringify(planData));

    const dailyBudget = Math.round((profile.monthlyBudget || 3000) / 30);

    const mealPlan = await MealPlan.create({
      userId: req.userId,
      title: planData.title || `${days}-Day Meal Plan`,
      duration: days,
      dailyBudget,
      dailyCalorieTarget: profile.dailyCalorieTarget,
      dailyProteinTarget: profile.dailyProteinTarget,
      plan: planData.plan,
      weeklyGroceryCost: planData.weeklyGroceryCost,
      isActive: true,
    });

    // Deactivate old plans
    await MealPlan.updateMany(
      { userId: req.userId, _id: { $ne: mealPlan._id } },
      { isActive: false }
    );

    res.status(201).json({ success: true, message: 'Meal plan generated!', data: mealPlan });
  } catch (error: any) {
    console.error('FULL MEAL PLAN ERROR =>', error);

    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export const getMealPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const plan = await MealPlan.findOne({ userId: req.userId, isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: plan });
};

export const createWorkoutPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await getProfile(req.userId!);

    console.log('Profile for workout plan:', JSON.stringify(profile.toObject()));

    const planData = await generateWorkoutPlan(profile.toObject());

    console.log('Generated workout plan:', JSON.stringify(planData));

    const workoutPlan = await WorkoutPlan.create({
      userId: req.userId,
      title: planData.title,
      level: planData.level,
      type: planData.type,
      goal: profile.fitnessGoal,
      daysPerWeek: planData.daysPerWeek,
      plan: planData.plan,
      isActive: true,
    });

    await WorkoutPlan.updateMany(
      { userId: req.userId, _id: { $ne: workoutPlan._id } },
      { isActive: false }
    );

    res.status(201).json({ success: true, message: 'Workout plan generated!', data: workoutPlan });
  } catch (error: any) {
    console.error('FULL WORKOUT PLAN ERROR =>', error);

    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export const getWorkoutPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const plan = await WorkoutPlan.findOne({ userId: req.userId, isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: plan });
};

export const createGroceryPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await getProfile(req.userId!);

    console.log('Profile for grocery plan:', JSON.stringify(profile.toObject()));

    const weeklyBudget =
      req.body.weeklyBudget || Math.round((profile.monthlyBudget || 3000) / 4.3);

    const planData = await generateGroceryPlan(profile.toObject(), weeklyBudget);

    console.log('Generated grocery plan:', JSON.stringify(planData));

    const groceryPlan = await GroceryPlan.create({
      userId: req.userId,
      title: planData.title || 'Weekly Grocery Plan',
      weeklyBudget,
      items: planData.items,
      totalEstimatedCost: planData.totalEstimatedCost,
      nutritionSummary: planData.nutritionSummary,
    });

    res.status(201).json({
      success: true,
      message: 'Grocery plan generated!',
      data: groceryPlan,
    });
  } catch (error: any) {
    console.error('FULL GROCERY PLAN ERROR =>', error);

    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export const getGroceryPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  const plans = await GroceryPlan.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(5);
  res.json({ success: true, data: plans });
};

export const getProteinBudgetPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await getProfile(req.userId!);

    console.log('Profile for protein budget plan:', JSON.stringify(profile.toObject()));

    const { budget = 100 } = req.body;

    const plan = await generateProteinBudgetPlan(profile.toObject(), budget);

    console.log('Generated protein budget plan:', JSON.stringify(plan));

    res.json({ success: true, data: plan });
  } catch (error: any) {
    console.error('FULL PROTEIN BUDGET ERROR =>', error);

    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messages, chatId } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new AppError('Messages array required', 400);
    }

    const profile = await Profile.findOne({ userId: req.userId });

    console.log('Chat messages:', JSON.stringify(messages));

    const response = await chatWithAI(messages, profile?.toObject() || {});

    console.log('AI chat response:', response);

    // Save chat
    let chat = chatId ? await AIChat.findById(chatId) : null;

    if (!chat) {
      chat = await AIChat.create({
        userId: req.userId,
        title: messages[0].content.substring(0, 50),
        messages: [],
      });
    }

    chat.messages.push(
      ...messages.slice(-1),
      {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
    );

    await chat.save();

    res.json({
      success: true,
      data: {
        response,
        chatId: chat._id,
      },
    });
  } catch (error: any) {
    console.error('FULL CHAT ERROR =>', error);

    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export const analyzeImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) throw new AppError('Image data required', 400);

    console.log('Analyzing image...');

    const analysis = await analyzeFoodImage(imageBase64, mimeType || 'image/jpeg');

    console.log('Image analysis result:', JSON.stringify(analysis));

    res.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('FULL IMAGE ANALYSIS ERROR =>', error);

    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export const getSubstitutions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { food } = req.body;

    if (!food) throw new AppError('Food name required', 400);

    const profile = await Profile.findOne({ userId: req.userId });

    console.log('Food substitution request:', food);

    const substitutions = await getFoodSubstitutions(food, profile?.toObject() || {});

    console.log('Food substitutions result:', JSON.stringify(substitutions));

    res.json({ success: true, data: substitutions });
  } catch (error: any) {
    console.error('FULL SUBSTITUTION ERROR =>', error);

    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const chats = await AIChat.find({ userId: req.userId })
    .select('title createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .limit(20);

  res.json({ success: true, data: chats });
};

export const getChatById = async (req: AuthRequest, res: Response): Promise<void> => {
  const chat = await AIChat.findOne({ _id: req.params.id, userId: req.userId });

  if (!chat) throw new AppError('Chat not found', 404);

  res.json({ success: true, data: chat });
};