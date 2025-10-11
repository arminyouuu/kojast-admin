import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import PlaceController from '../controllers/PlaceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/categories', CategoryController.create);
router.put('/categories/:id', CategoryController.update);
router.delete('/categories/:id', CategoryController.delete);

router.post('/places', PlaceController.create);
router.put('/places/:id', PlaceController.update);
router.delete('/places/:id', PlaceController.delete);

export default router;
