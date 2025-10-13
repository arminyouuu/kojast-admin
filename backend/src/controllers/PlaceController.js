import PlaceService from '../services/PlaceService.js';

class PlaceController {
  async getAll(req, res, next) {
    try {
      const { categoryId, page, limit } = req.query;
      const result = await PlaceService.getPlaces(categoryId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const place = await PlaceService.getPlaceById(req.params.id);
      res.json(place);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      console.log('Create place request body:', JSON.stringify(req.body, null, 2));
      console.log('Request headers:', req.headers);
      const place = await PlaceService.createPlace(req.body);
      res.status(201).json(place);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const place = await PlaceService.updatePlace(req.params.id, req.body);
      res.json(place);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await PlaceService.deletePlace(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new PlaceController();
