import PlaceService from '../services/PlaceService.js';

class PlaceController {
  async getAll(req, res, next) {
    try {
      const { categoryId, page, limit, expired } = req.query;
      const result = await PlaceService.getPlaces(categoryId, page, limit, expired);
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

  async uploadImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'https';
      const baseUrl = `${protocol}://${req.get('host')}`;
      const imageUrls = req.files.map(file => `${baseUrl}/api/uploads/${file.filename}`);

      res.json({ urls: imageUrls });
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

  async bulkDelete(req, res, next) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty ids array' });
      }
      await PlaceService.bulkDeletePlaces(ids);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new PlaceController();
