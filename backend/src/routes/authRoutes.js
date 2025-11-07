import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticateUser } from '../middleware/userAuth.js';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', authenticateUser, AuthController.logout);
router.get('/profile', authenticateUser, AuthController.getProfile);
router.put('/profile', authenticateUser, AuthController.updateProfile);
router.post('/change-password', authenticateUser, AuthController.changePassword);
router.post('/check-credentials', AuthController.checkCredentials);

export default router;
