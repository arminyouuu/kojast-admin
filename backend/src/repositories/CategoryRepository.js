import { query } from '../database/connection.js';

class CategoryRepository {
  async findAll() {
    return await query('SELECT * FROM categories ORDER BY name');
  }

  async findById(id) {
    const results = await query('SELECT * FROM categories WHERE id = ?', [id]);
    return results[0] || null;
  }
 
  async create(name) {
    const result = await query('INSERT INTO categories (name) VALUES (?)', [name]);
    return { id: result.insertId, name };
  }

  async update(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }

    if (data.is_enabled !== undefined) {
      fields.push('is_enabled = ?');
      values.push(data.is_enabled);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    await query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);
    return await this.findById(id);
  }

  async delete(id) {
    await query('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  }

  async exists(id) {
    const results = await query('SELECT id FROM categories WHERE id = ?', [id]);
    return results.length > 0;
  }

  async bulkDelete(ids) {
    if (!ids || ids.length === 0) return true;
    const placeholders = ids.map(() => '?').join(',');
    await query(`DELETE FROM categories WHERE id IN (${placeholders})`, ids);
    return true;
  }
}

export default new CategoryRepository();
