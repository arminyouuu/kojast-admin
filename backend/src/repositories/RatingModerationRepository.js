import { query } from '../database/connection.js';

class RatingModerationRepository {
  async getPendingRatings(limit = 50, offset = 0) {
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const sql = `
      SELECT
        r.*,
        p.name as place_name,
        p.address as place_address,
        u.full_name as user_name,
        COALESCE(u.phone_number, u.email) as user_contact
      FROM ratings r
      LEFT JOIN places p ON r.place_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at ASC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;
    return await query(sql);
  }

  async getAllRatings(filters = {}, limit = 50, offset = 0) {
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    let sql = `
      SELECT
        r.*,
        p.name as place_name,
        p.address as place_address,
        u.full_name as user_name,
        COALESCE(u.phone_number, u.email) as user_contact
      FROM ratings r
      LEFT JOIN places p ON r.place_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      sql += ' AND r.status = ?';
      params.push(filters.status);
    }

    if (filters.placeId) {
      sql += ' AND r.place_id = ?';
      params.push(filters.placeId);
    }

    if (filters.userId) {
      sql += ' AND r.user_id = ?';
      params.push(filters.userId);
    }

    sql += ` ORDER BY r.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;

    return await query(sql, params);
  }

  async getRatingById(ratingId) {
    const sql = `
      SELECT
        r.*,
        p.name as place_name,
        p.address as place_address,
        u.full_name as user_name,
        COALESCE(u.phone_number, u.email) as user_contact
      FROM ratings r
      LEFT JOIN places p ON r.place_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `;
    const results = await query(sql, [ratingId]);
    return results[0] || null;
  }

  async updateRatingStatus(ratingId, status, reviewedBy, rejectionReason = null) {
    const sql = `
      UPDATE ratings
      SET
        status = ?,
        reviewed_by = ?,
        reviewed_at = NOW(),
        rejection_reason = ?
      WHERE id = ?
    `;
    await query(sql, [status, reviewedBy, rejectionReason, ratingId]);
    return await this.getRatingById(ratingId);
  }

  async bulkUpdateRatingStatus(ratingIds, status, reviewedBy, rejectionReason = null) {
    if (!ratingIds || ratingIds.length === 0) {
      return 0;
    }

    const placeholders = ratingIds.map(() => '?').join(',');
    const sql = `
      UPDATE ratings
      SET
        status = ?,
        reviewed_by = ?,
        reviewed_at = NOW(),
        rejection_reason = ?
      WHERE id IN (${placeholders})
    `;
    const params = [status, reviewedBy, rejectionReason, ...ratingIds];
    const result = await query(sql, params);
    return result.affectedRows || 0;
  }

  async getAffectedPlaceIds(ratingIds) {
    if (!ratingIds || ratingIds.length === 0) {
      return [];
    }

    const placeholders = ratingIds.map(() => '?').join(',');
    const sql = `SELECT DISTINCT place_id FROM ratings WHERE id IN (${placeholders})`;
    const results = await query(sql, ratingIds);
    return results.map(r => r.place_id);
  }

  async recalculatePlaceRatings(placeId) {
    const sql = `
      UPDATE places
      SET
        rating_count = (SELECT COUNT(*) FROM ratings WHERE place_id = ? AND status = 'approved'),
        average_rating = COALESCE((SELECT AVG(rating) FROM ratings WHERE place_id = ? AND status = 'approved'), 0)
      WHERE id = ?
    `;
    await query(sql, [placeId, placeId, placeId]);
  }

  async countRatingsByStatus() {
    const sql = `
      SELECT
        status,
        COUNT(*) as count
      FROM ratings
      GROUP BY status
    `;
    const results = await query(sql);
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    results.forEach(row => {
      stats[row.status] = row.count;
    });

    return stats;
  }

  async countPendingRatings() {
    const sql = 'SELECT COUNT(*) as count FROM ratings WHERE status = ?';
    const results = await query(sql, ['pending']);
    return results[0]?.count || 0;
  }
}

export default new RatingModerationRepository();
