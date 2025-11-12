import express from 'express';
import RatingController from '../controllers/RatingController.js';
import { authenticateUser } from '../middleware/userAuth.js';
import { validateApiKey, checkPermission } from '../middleware/apiKeyAuth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', RatingController.addOrUpdateRating);
router.delete('/', RatingController.deleteRating);
router.get('/place/:placeId', RatingController.getPlaceRatings);
router.get('/place/:placeId/stats', RatingController.getPlaceRatingStats);
router.get('/user/:userId', RatingController.getUserRatings); // optional: restrict to self unless admin
router.get('/user/:userId/place/:placeId', RatingController.getUserRatingForPlace);

export default router;
