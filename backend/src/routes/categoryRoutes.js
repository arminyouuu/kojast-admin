import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import { authenticateApiKey, requireRead, requireWrite } from '../middleware/apiKeyAuth.js';

const router = express.Router();

router.get('/', authenticateApiKey, requireRead, CategoryController.getAll);
router.get('/:id', authenticateApiKey, requireRead, CategoryController.getById);
router.post('/', authenticateApiKey, requireWrite, CategoryController.create);
router.put('/:id', authenticateApiKey, requireWrite, CategoryController.update);
router.delete('/:id', authenticateApiKey, requireWrite, CategoryController.delete);

export default router;
