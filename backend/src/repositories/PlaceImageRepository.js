import { query } from '../database/connection.js';

class PlaceImageRepository {
  async findByPlaceId(placeId) {
    return await query(
      'SELECT * FROM place_images WHERE place_id = ? ORDER BY display_order, id',
      [placeId]
    );
  }

  async create(placeId, imageUrl, displayOrder = 0) {
    const result = await query(
      'INSERT INTO place_images (place_id, image_url, display_order) VALUES (?, ?, ?)',
      [placeId, imageUrl, displayOrder]
    );
    return result.insertId;
  }

  async deleteByPlaceId(placeId) {
    await query('DELETE FROM place_images WHERE place_id = ?', [placeId]);
    return true;
  }

  async deleteById(id) {
    await query('DELETE FROM place_images WHERE id = ?', [id]);
    return true;
  }

  async bulkCreate(placeId, imageUrls) {
    if (!imageUrls || imageUrls.length === 0) return [];

    const values = imageUrls.map((url, index) => [placeId, url, index]);
    const placeholders = values.map(() => '(?, ?, ?)').join(', ');
    const flatValues = values.flat();

    await query(
      `INSERT INTO place_images (place_id, image_url, display_order) VALUES ${placeholders}`,
      flatValues
    );

    return await this.findByPlaceId(placeId);
  }
}

export default new PlaceImageRepository();
