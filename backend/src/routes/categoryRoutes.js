import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import { validateApiKey, checkPermission } from '../middleware/apiKeyAuth.js';

const router = express.Router();

// Public read endpoints (no API key required for mobile app)
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// Protected write endpoints (require API key)
router.post('/', validateApiKey, checkPermission('write'), CategoryController.create);
router.post('/bulk-delete', validateApiKey, checkPermission('delete'), CategoryController.bulkDelete);
router.put('/:id', validateApiKey, checkPermission('write'), CategoryController.update);
router.delete('/:id', validateApiKey, checkPermission('delete'), CategoryController.delete);

export default router;
