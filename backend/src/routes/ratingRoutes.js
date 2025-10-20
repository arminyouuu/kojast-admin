import express from 'express';
import RatingController from '../controllers/RatingController.js';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';

const router = express.Router();

router.post('/', apiKeyAuth('write'), RatingController.addOrUpdateRating);
router.delete('/', apiKeyAuth('write'), RatingController.deleteRating);
router.get('/place/:placeId', apiKeyAuth('read'), RatingController.getPlaceRatings);
router.get('/place/:placeId/stats', apiKeyAuth('read'), RatingController.getPlaceRatingStats);
router.get('/user/:userId', apiKeyAuth('read'), RatingController.getUserRatings);
router.get('/user/:userId/place/:placeId', apiKeyAuth('read'), RatingController.getUserRatingForPlace);

export default router;
