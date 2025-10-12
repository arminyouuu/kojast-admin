import express from 'express';
import PlaceController from '../controllers/PlaceController.js';

const router = express.Router();

router.get('/', PlaceController.getAll);
router.get('/:id', PlaceController.getById);

export default router;
