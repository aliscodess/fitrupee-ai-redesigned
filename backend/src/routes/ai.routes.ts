import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createMealPlan, getMealPlan,
  createWorkoutPlan, getWorkoutPlan,
  createGroceryPlan, getGroceryPlans,
  getProteinBudgetPlan, chat, analyzeImage,
  getSubstitutions, getChatHistory, getChatById,
} from '../controllers/ai.controller';

const router = Router();
router.use(authenticate);

router.post('/meal-plan', createMealPlan);
router.get('/meal-plan', getMealPlan);
router.post('/workout-plan', createWorkoutPlan);
router.get('/workout-plan', getWorkoutPlan);
router.post('/grocery-plan', createGroceryPlan);
router.get('/grocery-plans', getGroceryPlans);
router.post('/protein-budget', getProteinBudgetPlan);
router.post('/chat', chat);
router.post('/analyze-image', analyzeImage);
router.post('/substitutions', getSubstitutions);
router.get('/chats', getChatHistory);
router.get('/chats/:id', getChatById);

export default router;
