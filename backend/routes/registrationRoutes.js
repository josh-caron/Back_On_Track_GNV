import express from 'express';
import { getMyRegistrations } from '../controllers/registrationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getMyRegistrations);

export default router;
