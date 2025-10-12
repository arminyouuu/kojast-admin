import express from 'express';
import PlaceController from '../controllers/PlaceController.js';
import { authenticateApiKey, requireRead, requireWrite } from '../middleware/apiKeyAuth.js';

const router = express.Router();

router.get('/', authenticateApiKey, requireRead, PlaceController.getAll);
router.get('/:id', authenticateApiKey, requireRead, PlaceController.getById);
router.post('/', authenticateApiKey, requireWrite, PlaceController.create);
router.put('/:id', authenticateApiKey, requireWrite, PlaceController.update);
router.delete('/:id', authenticateApiKey, requireWrite, PlaceController.delete);

export default router;
