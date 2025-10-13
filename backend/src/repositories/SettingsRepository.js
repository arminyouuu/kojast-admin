import { query } from '../database/connection.js';

class SettingsRepository {
  async get(key) {
    const results = await query(
      'SELECT * FROM settings WHERE setting_key = ?',
      [key]
    );
    return results[0] || null;
  }

  async set(key, value) {
    const existing = await this.get(key);

    if (existing) {
      await query(
        'UPDATE settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
        [value, key]
      );
    } else {
      await query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)',
        [key, value]
      );
    }

    return await this.get(key);
  }

  async delete(key) {
    await query('DELETE FROM settings WHERE setting_key = ?', [key]);
    return true;
  }

  async getAll() {
    const results = await query('SELECT * FROM settings ORDER BY setting_key ASC');
    return results;
  }
}

export default new SettingsRepository();
