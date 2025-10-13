import express from 'express';
import PlaceController from '../controllers/PlaceController.js';
import { validateApiKey, checkPermission } from '../middleware/apiKeyAuth.js';

const router = express.Router();

router.post('/', validateApiKey, checkPermission('write'), PlaceController.create);
router.get('/', PlaceController.getAll);
router.get('/:id', PlaceController.getById);
router.put('/:id', validateApiKey, checkPermission('write'), PlaceController.update);
router.delete('/:id', validateApiKey, checkPermission('delete'), PlaceController.delete);

export default router;
