import RatingService from '../services/RatingService.js';

class RatingController {
  async addOrUpdateRating(req, res, next) {
    try {
      const { place_id, rating, comment } = req.body;
      const user_id = req.user.id; // ← trusted from session
      const result = await RatingService.addOrUpdateRating(place_id, user_id, rating, comment);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserRatingForPlace(req, res, next) {
    try {
      const { placeId, userId } = req.params;
      const rating = await RatingService.getUserRatingForPlace(userId, placeId);
      res.json(rating);
    } catch (error) {
      next(error);
    }
  }

  async getPlaceRatings(req, res, next) {
    try {
      const { placeId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const ratings = await RatingService.getPlaceRatings(placeId, parseInt(page), parseInt(limit));
      res.json(ratings);
    } catch (error) {
      next(error);
    }
  }

  async getUserRatings(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const ratings = await RatingService.getUserRatings(userId, parseInt(page), parseInt(limit));
      res.json(ratings);
    } catch (error) {
      next(error);
    }
  }

  async deleteRating(req, res, next) {
    try {
      const { place_id } = req.body;
      const user_id = req.user.id; // ← trusted
      const result = await RatingService.deleteRating(user_id, place_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPlaceRatingStats(req, res, next) {
    try {
      const { placeId } = req.params;
      const stats = await RatingService.getPlaceRatingStats(placeId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new RatingController();
