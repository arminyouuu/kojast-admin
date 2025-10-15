import UserRepository from '../repositories/UserRepository.js';

class FavoritesController {
  async getFavorites(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const favorites = await UserRepository.getFavorites(req.user.id, page, limit);

      res.json({
        success: true,
        data: favorites.data,
        meta: {
          total: favorites.total,
          page: favorites.page,
          pages: favorites.pages,
          limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async addFavorite(req, res, next) {
    try {
      const { place_id } = req.body;

      if (!place_id) {
        return res.status(400).json({
          success: false,
          message: 'place_id is required'
        });
      }

      const isFavorite = await UserRepository.isFavorite(req.user.id, place_id);
      if (isFavorite) {
        return res.status(400).json({
          success: false,
          message: 'Place is already in favorites'
        });
      }

      await UserRepository.addFavorite(req.user.id, place_id);

      res.status(201).json({
        success: true,
        message: 'Place added to favorites'
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(req, res, next) {
    try {
      const placeId = req.params.placeId;

      const removed = await UserRepository.removeFavorite(req.user.id, placeId);

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Favorite not found'
        });
      }

      res.json({
        success: true,
        message: 'Place removed from favorites'
      });
    } catch (error) {
      next(error);
    }
  }

  async checkFavorite(req, res, next) {
    try {
      const placeId = req.params.placeId;

      const isFavorite = await UserRepository.isFavorite(req.user.id, placeId);

      res.json({
        success: true,
        data: {
          is_favorite: isFavorite
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FavoritesController();
