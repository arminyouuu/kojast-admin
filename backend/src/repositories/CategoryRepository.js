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

  async update(id, name) {
    await query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
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
}

export default new CategoryRepository();
