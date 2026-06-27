import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getDashboardStats, logProgress, getProgressHistory } from '../controllers/analytics.controller';

const router = Router();
router.use(authenticate);
router.get('/dashboard', getDashboardStats);
router.post('/progress', logProgress);
router.get('/progress', getProgressHistory);
export default router;
