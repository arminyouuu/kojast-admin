// backend/src/routes/smsRoutes.js
import express from 'express';
import SmsController from '../controllers/SmsController.js';
import { authenticate } from '../middleware/auth.js'; // admin auth middleware

const router = express.Router();

// Protected route: only admins
router.post('/bulk', authenticate, SmsController.sendBulkSms);

export default router;