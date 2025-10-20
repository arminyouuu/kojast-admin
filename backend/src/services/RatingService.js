import RatingRepository from '../repositories/RatingRepository.js';

class RatingService {
  async addOrUpdateRating(placeId, userId, rating, comment = null) {
    if (!placeId || !userId || !rating) {
      throw new Error('Place ID, User ID, and rating are required');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const ratingId = await RatingRepository.createRating(placeId, userId, rating, comment);
    return await RatingRepository.getRatingByUserAndPlace(userId, placeId);
  }

  async getUserRatingForPlace(userId, placeId) {
    return await RatingRepository.getRatingByUserAndPlace(userId, placeId);
  }

  async getPlaceRatings(placeId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    return await RatingRepository.getRatingsByPlace(placeId, limit, offset);
  }

  async getUserRatings(userId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    return await RatingRepository.getRatingsByUser(userId, limit, offset);
  }

  async deleteRating(userId, placeId) {
    const deleted = await RatingRepository.deleteRating(userId, placeId);
    if (!deleted) {
      throw new Error('Rating not found');
    }
    return { success: true };
  }

  async getPlaceRatingStats(placeId) {
    return await RatingRepository.getPlaceRatingStats(placeId);
  }
}

export default new RatingService();
