import express from 'express';
import FavoritesController from '../controllers/FavoritesController.js';
import { authenticateUser } from '../middleware/userAuth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', FavoritesController.getFavorites);
router.post('/', FavoritesController.addFavorite);
router.delete('/:placeId', FavoritesController.removeFavorite);
router.get('/check/:placeId', FavoritesController.checkFavorite);

export default router;
