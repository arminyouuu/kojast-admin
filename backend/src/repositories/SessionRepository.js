import pool from '../database/connection.js';

class SessionRepository {
  async create(userId, token, deviceInfo, expiresAt) {
    const sql = `
      INSERT INTO user_sessions (user_id, token, device_info, expires_at)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [userId, token, deviceInfo, expiresAt]);
    return result.insertId;
  }

  async findByToken(token) {
    const sql = `
      SELECT s.*, u.id as user_id, u.phone_number, u.email, u.full_name, u.is_active
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > NOW()
    `;
    const [rows] = await pool.execute(sql, [token]);
    return rows[0];
  }

  async deleteByToken(token) {
    const sql = 'DELETE FROM user_sessions WHERE token = ?';
    await pool.execute(sql, [token]);
  }

  async deleteExpired() {
    const sql = 'DELETE FROM user_sessions WHERE expires_at < NOW()';
    await pool.execute(sql);
  }

  async deleteUserSessions(userId) {
    const sql = 'DELETE FROM user_sessions WHERE user_id = ?';
    await pool.execute(sql, [userId]);
  }
}

export default new SessionRepository();
