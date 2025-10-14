import PlaceRepository from '../repositories/PlaceRepository.js';
import PlaceImageRepository from '../repositories/PlaceImageRepository.js';
import CategoryRepository from '../repositories/CategoryRepository.js';
import ExpirationCheckerService from './ExpirationCheckerService.js';

class PlaceService {
  async getPlaces(categoryId, page = 1, limit = 10) {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    limit = Math.min(limit, 100);
 
    if (categoryId) {
      const categoryExists = await CategoryRepository.exists(categoryId);
      if (!categoryExists) {
        throw { status: 404, message: 'Category not found' };
      }
    }

    const { places, total } = await PlaceRepository.findAll(
      { categoryId },
      { page, limit }
    );

    const placesWithImages = await Promise.all(
      places.map(async (place) => {
        try {
          const images = await PlaceImageRepository.findByPlaceId(place.id);
          return {
            ...place,
            images: images ? images.map(img => img.image_url) : []
          };
        } catch (error) {
          console.error(`Error fetching images for place ${place.id}:`, error);
          return {
            ...place,
            images: []
          };
        }
      })
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: placesWithImages,
      meta: {
        total,
        page,
        limit,
        pages: totalPages
      }
    };
  }

  async getPlaceById(id) {
    const place = await PlaceRepository.findById(id);
    if (!place) {
      throw { status: 404, message: 'Place not found' };
    }

    const images = await PlaceImageRepository.findByPlaceId(id);
    return {
      ...place,
      images: images.map(img => img.image_url)
    };
  }

  async createPlace(placeData) {
    const categoryId = placeData.categoryId || placeData.category_id;
    const { name, description, address, latitude, longitude, images, expirationDate, expiration_date } = placeData;

    if (!name || name.trim().length === 0) {
      throw { status: 400, message: 'Place name is required' };
    }

    if (!categoryId) {
      throw { status: 400, message: 'Category ID is required' };
    }

    const categoryExists = await CategoryRepository.exists(categoryId);
    if (!categoryExists) {
      throw { status: 404, message: 'Category not found' };
    }

    const placeId = await PlaceRepository.create({
      name: name.trim(),
      description: description || '',
      address: address || '',
      categoryId,
      latitude: latitude || null,
      longitude: longitude || null,
      expirationDate: expirationDate || expiration_date || null
    });

    if (images && Array.isArray(images) && images.length > 0) {
      await PlaceImageRepository.bulkCreate(placeId, images);
    }

    const finalExpirationDate = expirationDate || expiration_date;
    if (finalExpirationDate) {
      this.checkImmediateExpiration(finalExpirationDate);
    }

    return await this.getPlaceById(placeId);
  }

  async updatePlace(id, placeData) {
    const exists = await PlaceRepository.exists(id);
    if (!exists) {
      throw { status: 404, message: 'Place not found' };
    }

    const categoryId = placeData.categoryId || placeData.category_id;
    const { name, description, address, latitude, longitude, images, expirationDate, expiration_date } = placeData;

    if (!name || name.trim().length === 0) {
      throw { status: 400, message: 'Place name is required' };
    }

    if (categoryId) {
      const categoryExists = await CategoryRepository.exists(categoryId);
      if (!categoryExists) {
        throw { status: 404, message: 'Category not found' };
      }
    }

    await PlaceRepository.update(id, {
      name: name.trim(),
      description: description || '',
      address: address || '',
      categoryId,
      latitude: latitude || null,
      longitude: longitude || null,
      expirationDate: expirationDate || expiration_date || null
    });

    if (images && Array.isArray(images)) {
      await PlaceImageRepository.deleteByPlaceId(id);
      if (images.length > 0) {
        await PlaceImageRepository.bulkCreate(id, images);
      }
    }

    const finalExpirationDate = expirationDate || expiration_date;
    if (finalExpirationDate) {
      this.checkImmediateExpiration(finalExpirationDate);
    }

    return await this.getPlaceById(id);
  }

  async deletePlace(id) {
    const exists = await PlaceRepository.exists(id);
    if (!exists) {
      throw { status: 404, message: 'Place not found' };
    }

    await PlaceImageRepository.deleteByPlaceId(id);
    return await PlaceRepository.delete(id);
  }

  checkImmediateExpiration(expirationDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);

    const daysUntilExpiration = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration <= 7) {
      setTimeout(() => {
        ExpirationCheckerService.checkExpirations();
      }, 1000);
    }
  }
}

export default new PlaceService();
