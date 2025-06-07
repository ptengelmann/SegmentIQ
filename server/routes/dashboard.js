import express from 'express';
import { getDashboardMetrics } from '../controllers/dashboard.js';

const router = express.Router();
router.get('/', getDashboardMetrics);

export default router;
