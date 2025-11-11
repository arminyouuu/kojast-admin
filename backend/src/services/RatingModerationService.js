import RatingModerationRepository from '../repositories/RatingModerationRepository.js';

class RatingModerationService {
  async getPendingRatings(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const ratings = await RatingModerationRepository.getPendingRatings(limit, offset);

    // Fixed: countPendingRatings likely returns a single result, not an array
    const countResult = await RatingModerationRepository.countPendingRatings();
    const total = countResult?.count || countResult || 0;

    return {
      data: ratings,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getAllRatings(filters = {}, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const ratings = await RatingModerationRepository.getAllRatings(filters, limit, offset);

    return {
      data: ratings,
      meta: {
        page,
        limit,
        total: ratings.length,
        pages: 1
      }
    };
  }

  async approveRating(ratingId, adminUsername) {
    if (!ratingId || !adminUsername) {
      throw new Error('Rating ID and admin username are required');
    }

    const rating = await RatingModerationRepository.getRatingById(ratingId);
    if (!rating) {
      throw new Error('Rating not found');
    }

    if (rating.status === 'approved') {
      throw new Error('Rating is already approved');
    }

    const updatedRating = await RatingModerationRepository.updateRatingStatus(
      ratingId,
      'approved',
      adminUsername,
      null
    );

    await RatingModerationRepository.recalculatePlaceRatings(rating.place_id);

    return updatedRating;
  }

  async rejectRating(ratingId, adminUsername, reason = null) {
    if (!ratingId || !adminUsername) {
      throw new Error('Rating ID and admin username are required');
    }

    const rating = await RatingModerationRepository.getRatingById(ratingId);
    if (!rating) {
      throw new Error('Rating not found');
    }

    if (rating.status === 'rejected') {
      throw new Error('Rating is already rejected');
    }

    const updatedRating = await RatingModerationRepository.updateRatingStatus(
      ratingId,
      'rejected',
      adminUsername,
      reason
    );

    if (rating.status === 'approved') {
      await RatingModerationRepository.recalculatePlaceRatings(rating.place_id);
    }

    return updatedRating;
  }

  async bulkApprove(ratingIds, adminUsername) {
    if (!ratingIds || ratingIds.length === 0) {
      throw new Error('Rating IDs are required');
    }

    if (!adminUsername) {
      throw new Error('Admin username is required');
    }

    const placeIds = await RatingModerationRepository.getAffectedPlaceIds(ratingIds);

    const affectedRows = await RatingModerationRepository.bulkUpdateRatingStatus(
      ratingIds,
      'approved',
      adminUsername,
      null
    );

    for (const placeId of placeIds) {
      await RatingModerationRepository.recalculatePlaceRatings(placeId);
    }

    return {
      success: true,
      count: affectedRows,
      message: `${affectedRows} rating(s) approved successfully`
    };
  }

  async bulkReject(ratingIds, adminUsername, reason = null) {
    if (!ratingIds || ratingIds.length === 0) {
      throw new Error('Rating IDs are required');
    }

    if (!adminUsername) {
      throw new Error('Admin username is required');
    }

    const placeIds = await RatingModerationRepository.getAffectedPlaceIds(ratingIds);

    const affectedRows = await RatingModerationRepository.bulkUpdateRatingStatus(
      ratingIds,
      'rejected',
      adminUsername,
      reason
    );

    for (const placeId of placeIds) {
      await RatingModerationRepository.recalculatePlaceRatings(placeId);
    }

    return {
      success: true,
      count: affectedRows,
      message: `${affectedRows} rating(s) rejected successfully`
    };
  }

  async getRatingStats() {
    return await RatingModerationRepository.countRatingsByStatus();
  }

  async recalculatePlaceRatings(placeId) {
    if (!placeId) {
      throw new Error('Place ID is required');
    }

    await RatingModerationRepository.recalculatePlaceRatings(placeId);

    return {
      success: true,
      message: 'Place ratings recalculated successfully'
    };
  }
}

export default new RatingModerationService();