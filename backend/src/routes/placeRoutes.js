import express from 'express';
import PlaceController from '../controllers/PlaceController.js';

const router = express.Router();

router.get('/', PlaceController.getAll);
router.get('/:id', PlaceController.getById);
router.post('/', PlaceController.create);
router.put('/:id', PlaceController.update);
router.delete('/:id', PlaceController.delete);

export default router;
