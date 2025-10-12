import { query } from '../database/connection.js';

class PlaceRepository {
  async findAll(filters = {}, pagination = {}) {
    const { categoryId } = filters;
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    let sql = `
      SELECT p.*, c.name as category_name
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];

    if (categoryId) {
      sql += ' WHERE p.category_id = ?';
      params.push(parseInt(categoryId));
    }

    sql += ` ORDER BY p.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;

    const places = await query(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM places';
    const countParams = [];
    if (categoryId) {
      countSql += ' WHERE category_id = ?';
      countParams.push(parseInt(categoryId));
    }

    const countResult = await query(countSql, countParams);
    return { places, total: countResult[0].total };
  }

  async findById(id) {
    const results = await query(
      `SELECT p.*, c.name as category_name
       FROM places p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    return results[0] || null;
  }

  async create(placeData) {
    const { name, description, address, categoryId, latitude, longitude } = placeData;
    const result = await query(
      `INSERT INTO places (name, description, address, category_id, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, address, categoryId, latitude, longitude]
    );
    return result.insertId;
  }

  async update(id, placeData) {
    const { name, description, address, categoryId, latitude, longitude } = placeData;
    await query(
      `UPDATE places
       SET name = ?, description = ?, address = ?, category_id = ?, latitude = ?, longitude = ?
       WHERE id = ?`,
      [name, description, address, categoryId, latitude, longitude, id]
    );
    return await this.findById(id);
  }

  async delete(id) {
    await query('DELETE FROM places WHERE id = ?', [id]);
    return true;
  }

  async exists(id) {
    const results = await query('SELECT id FROM places WHERE id = ?', [id]);
    return results.length > 0;
  }
}

export default new PlaceRepository();
