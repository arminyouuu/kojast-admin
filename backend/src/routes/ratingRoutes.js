import express from 'express';
import RatingController from '../controllers/RatingController.js';
import { authenticateUser } from '../middleware/userAuth.js';

const router = express.Router();

// 🟢 Public routes (no auth)
router.get('/place/:placeId', RatingController.getPlaceRatings);
router.get('/place/:placeId/stats', RatingController.getPlaceRatingStats);

// 🔒 Private routes (user auth required)
router.use(authenticateUser); // applies to all routes below

router.post('/', RatingController.addOrUpdateRating);
router.delete('/', RatingController.deleteRating);
router.get('/me', RatingController.getUserRatingsForSelf); // new: `/me` instead of `/user/:userId`
router.get('/me/place/:placeId', RatingController.getUserRatingForPlaceSelf); // self-only

// Optional: allow unauthenticated users to *check* if a place is rated (but hide user identity)
// router.get('/check/place/:placeId', optionalAuth, RatingController.checkUserHasRated);

export default router;