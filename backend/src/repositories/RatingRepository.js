import pool from '../database/connection.js';

class RatingRepository {
  async createRating(placeId, userId, rating, comment = null) {
    const sql = `
      INSERT INTO ratings (place_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        comment = VALUES(comment),
        updated_at = CURRENT_TIMESTAMP
    `;
    const [result] = await pool.execute(sql, [placeId, userId, rating, comment]);
    return result.insertId;
  }

  async getRatingByUserAndPlace(userId, placeId) {
    const sql = `
      SELECT * FROM ratings
      WHERE user_id = ? AND place_id = ?
    `;
    const [rows] = await pool.execute(sql, [userId, placeId]);
    return rows[0] || null;
  }

  async getRatingsByPlace(placeId, limit = 50, offset = 0) {
    const sql = `
      SELECT * FROM ratings
      WHERE place_id = ?
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
    const [rows] = await pool.execute(sql, [placeId]);
    return rows;
  }

  async getRatingsByUser(userId, limit = 50, offset = 0) {
    const sql = `
      SELECT r.*, p.name as place_name, p.address
      FROM ratings r
      JOIN places p ON r.place_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
    const [rows] = await pool.execute(sql, [userId]);
    return rows;
  }

  async deleteRating(userId, placeId) {
    const sql = `DELETE FROM ratings WHERE user_id = ? AND place_id = ?`;
    const [result] = await pool.execute(sql, [userId, placeId]);
    return result.affectedRows > 0;
  }

  async getPlaceRatingStats(placeId) {
    const sql = `
      SELECT
        AVG(rating) as average_rating,
        COUNT(*) as rating_count,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM ratings
      WHERE place_id = ?
    `;
    const [rows] = await pool.execute(sql, [placeId]);
    return rows[0];
  }
}

export default new RatingRepository();
