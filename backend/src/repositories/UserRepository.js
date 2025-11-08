import pool from '../database/connection.js';

class UserRepository {
  async create(userData) {
    const { phone_number, email, password_hash, full_name } = userData;
    const sql = `
      INSERT INTO users (phone_number, email, password_hash, full_name)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      phone_number || null,
      email || null,
      password_hash,
      full_name || null
    ]);
    return result.insertId;
  }

  async findById(id) {
    const sql = 'SELECT id, phone_number, email, full_name, created_at, last_login, is_active FROM users WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    return rows[0];
  }

  async findByPhoneNumber(phone_number) {
    const sql = 'SELECT * FROM users WHERE phone_number = ?';
    const [rows] = await pool.execute(sql, [phone_number]);
    return rows[0];
  }

  async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.execute(sql, [email]);
    return rows[0];
  }

  async updateLastLogin(id) {
    const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    await pool.execute(sql, [id]);
  }

  async update(id, userData) {
    const { full_name, email, phone_number } = userData;
    const sql = `
      UPDATE users
      SET full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          phone_number = COALESCE(?, phone_number)
      WHERE id = ?
    `;
    await pool.execute(sql, [full_name, email, phone_number, id]);
    return this.findById(id);
  }

  async updatePassword(id, password_hash) {
    const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
    await pool.execute(sql, [password_hash, id]);
  }

  async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    await pool.execute(sql, [id]);
  }

  async getFavorites(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT p.*, c.name as category_name,
             GROUP_CONCAT(pi.image_url) as images,
             uf.created_at as favorited_at
      FROM user_favorites uf
      JOIN places p ON uf.place_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN place_images pi ON p.id = pi.place_id
      WHERE uf.user_id = ?
      GROUP BY p.id
      ORDER BY uf.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.execute(sql, [userId, limit, offset]);

    const countSql = 'SELECT COUNT(*) as total FROM user_favorites WHERE user_id = ?';
    const [countResult] = await pool.execute(countSql, [userId]);

    return {
      data: rows.map(row => ({
        ...row,
        images: row.images ? row.images.split(',') : []
      })),
      total: countResult[0].total,
      page,
      pages: Math.ceil(countResult[0].total / limit)
    };
  }

  async addFavorite(userId, placeId) {
    const sql = 'INSERT INTO user_favorites (user_id, place_id) VALUES (?, ?)';
    await pool.execute(sql, [userId, placeId]);
  }

  async removeFavorite(userId, placeId) {
    const sql = 'DELETE FROM user_favorites WHERE user_id = ? AND place_id = ?';
    const [result] = await pool.execute(sql, [userId, placeId]);
    return result.affectedRows > 0;
  }

  async isFavorite(userId, placeId) {
    const sql = 'SELECT 1 FROM user_favorites WHERE user_id = ? AND place_id = ?';
    const [rows] = await pool.execute(sql, [userId, placeId]);
    return rows.length > 0;
  }
}

export default new UserRepository();
