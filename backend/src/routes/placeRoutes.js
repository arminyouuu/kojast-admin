import express from 'express';
import PlaceController from '../controllers/PlaceController.js';
import { validateApiKey, checkPermission } from '../middleware/apiKeyAuth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', validateApiKey, checkPermission('write'), upload.array('images', 10), PlaceController.uploadImages);
router.post('/', validateApiKey, checkPermission('write'), PlaceController.create);
router.post('/bulk-delete', validateApiKey, checkPermission('delete'), PlaceController.bulkDelete);
router.get('/', validateApiKey, checkPermission('read'), PlaceController.getAll);
router.get('/:id', validateApiKey, checkPermission('read'), PlaceController.getById);
router.put('/:id', validateApiKey, checkPermission('write'), PlaceController.update);
router.delete('/:id', validateApiKey, checkPermission('delete'), PlaceController.delete);

export default router;
