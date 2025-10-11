const placeRepository = require('../repositories/placeRepository');

class PlaceService {
  async getAllPlaces(filters) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const categoryId = filters.categoryId;

    if (page < 1) {
      throw { status: 400, message: 'Page must be greater than 0' };
    }

    if (limit < 1 || limit > 100) {
      throw { status: 400, message: 'Limit must be between 1 and 100' };
    }

    return await placeRepository.findAll({ categoryId, page, limit });
  }

  async getPlaceById(id) {
    const place = await placeRepository.findById(id);
    if (!place) {
      throw { status: 404, message: 'Place not found' };
    }
    return place;
  }

  async createPlace(placeData) {
    if (!placeData.name || placeData.name.trim() === '') {
      throw { status: 400, message: 'Place name is required' };
    }

    if (!placeData.address || placeData.address.trim() === '') {
      throw { status: 400, message: 'Address is required' };
    }

    const data = {
      name: placeData.name.trim(),
      description: placeData.description?.trim() || '',
      address: placeData.address.trim(),
      category_id: placeData.category_id || null,
      latitude: placeData.latitude || null,
      longitude: placeData.longitude || null,
      images: placeData.images || []
    };

    return await placeRepository.create(data);
  }

  async updatePlace(id, placeData) {
    const existing = await placeRepository.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Place not found' };
    }

    if (placeData.name !== undefined && placeData.name.trim() === '') {
      throw { status: 400, message: 'Place name cannot be empty' };
    }

    if (placeData.address !== undefined && placeData.address.trim() === '') {
      throw { status: 400, message: 'Address cannot be empty' };
    }

    const data = {};
    if (placeData.name !== undefined) data.name = placeData.name.trim();
    if (placeData.description !== undefined) data.description = placeData.description.trim();
    if (placeData.address !== undefined) data.address = placeData.address.trim();
    if (placeData.category_id !== undefined) data.category_id = placeData.category_id;
    if (placeData.latitude !== undefined) data.latitude = placeData.latitude;
    if (placeData.longitude !== undefined) data.longitude = placeData.longitude;
    if (placeData.images !== undefined) data.images = placeData.images;

    return await placeRepository.update(id, data);
  }

  async deletePlace(id) {
    const existing = await placeRepository.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Place not found' };
    }

    return await placeRepository.delete(id);
  }
}

module.exports = new PlaceService();
