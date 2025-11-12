import express from 'express';
import RatingController from '../controllers/RatingController.js';
import { authenticateUser } from '../middleware/userAuth.js';
import { validateApiKey, checkPermission } from '../middleware/apiKeyAuth.js';

const router = express.Router();

router.post('/', validateApiKey, checkPermission('write'), RatingController.addOrUpdateRating);
router.delete('/', validateApiKey, checkPermission('write'), RatingController.deleteRating);
router.get('/place/:placeId', validateApiKey, checkPermission('read'), RatingController.getPlaceRatings);
router.get('/place/:placeId/stats', validateApiKey, checkPermission('read'), RatingController.getPlaceRatingStats);
router.get('/user/:userId', validateApiKey, checkPermission('read'), RatingController.getUserRatings);
router.get('/user/:userId/place/:placeId', validateApiKey, checkPermission('read'), RatingController.getUserRatingForPlace);

export default router;
