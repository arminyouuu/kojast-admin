import pool from '../database/connection.js';

class BannerRepository {
  async getAll(activeOnly = false) {
    try {
      let query = 'SELECT * FROM app_banners';
      if (activeOnly) {
        query += ' WHERE is_active = TRUE';
      }
      query += ' ORDER BY display_order ASC, created_at DESC';

      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM app_banners WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error fetching banner:', error);
      throw error;
    }
  }

  async create(bannerData) {
    try {
      const { title, image_url, link_url, display_order, is_active } = bannerData;
      const [result] = await pool.execute(
        'INSERT INTO app_banners (title, image_url, link_url, display_order, is_active) VALUES (?, ?, ?, ?, ?)',
        [title || null, image_url, link_url || null, display_order || 0, is_active !== undefined ? is_active : true]
      );

      return this.getById(result.insertId);
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  }

  async update(id, bannerData) {
    try {
      const { title, image_url, link_url, display_order, is_active } = bannerData;

      const updates = [];
      const values = [];

      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }
      if (image_url !== undefined) {
        updates.push('image_url = ?');
        values.push(image_url);
      }
      if (link_url !== undefined) {
        updates.push('link_url = ?');
        values.push(link_url);
      }
      if (display_order !== undefined) {
        updates.push('display_order = ?');
        values.push(display_order);
      }
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(is_active);
      }

      if (updates.length === 0) {
        return this.getById(id);
      }

      values.push(id);

      await pool.execute(
        `UPDATE app_banners SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return this.getById(id);
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const banner = await this.getById(id);

      await pool.execute('DELETE FROM app_banners WHERE id = ?', [id]);

      return banner;
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  }
}

export default new BannerRepository();
