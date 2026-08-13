import express from 'express';
import {
  createRecurring,
  getRecurrings,
  getRecurringById,
  updateRecurring,
  deleteRecurring,
  pauseRecurring,
  resumeRecurring,
} from '../controllers/recurring.controller.js';

import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createRecurring);
router.get('/', getRecurrings);
router.get('/:id', getRecurringById);
router.put('/:id', updateRecurring);
router.delete('/:id', deleteRecurring);
router.post('/:id/pause', pauseRecurring);
router.post('/:id/resume', resumeRecurring);

export default router;
