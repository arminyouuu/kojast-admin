import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import { validateApiKey, checkPermission } from '../middleware/apiKeyAuth.js';

const router = express.Router();

router.post('/', validateApiKey, checkPermission('write'), CategoryController.create);
router.post('/bulk-delete', validateApiKey, checkPermission('delete'), CategoryController.bulkDelete);
router.get('/', validateApiKey, checkPermission('read'), CategoryController.getAll);
router.get('/:id', validateApiKey, checkPermission('read'), CategoryController.getById);
router.put('/:id', validateApiKey, checkPermission('write'), CategoryController.update);
router.delete('/:id', validateApiKey, checkPermission('delete'), CategoryController.delete);

export default router;
