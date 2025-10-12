import crypto from 'crypto';
import { query } from '../database/connection.js';

class ApiKeyController {
  async getAll(req, res, next) {
    try {
      const apiKeys = await query(
        'SELECT id, name, api_key, permissions, is_active, created_at, last_used_at FROM api_keys ORDER BY created_at DESC'
      );
      res.json(apiKeys);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { name, permissions } = req.body;

      if (!name || !permissions) {
        return res.status(400).json({ message: 'Name and permissions are required' });
      }

      const apiKey = 'ck_' + crypto.randomBytes(32).toString('hex');

      const result = await query(
        'INSERT INTO api_keys (name, api_key, permissions, is_active) VALUES (?, ?, ?, ?)',
        [name, apiKey, JSON.stringify(permissions), true]
      );

      const newKey = await query(
        'SELECT id, name, api_key, permissions, is_active, created_at, last_used_at FROM api_keys WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(newKey[0]);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, is_active, permissions } = req.body;

      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }

      if (is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(is_active);
      }

      if (permissions !== undefined) {
        updates.push('permissions = ?');
        values.push(JSON.stringify(permissions));
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }

      values.push(id);

      await query(
        `UPDATE api_keys SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const updatedKey = await query(
        'SELECT id, name, api_key, permissions, is_active, created_at, last_used_at FROM api_keys WHERE id = ?',
        [id]
      );

      if (updatedKey.length === 0) {
        return res.status(404).json({ message: 'API key not found' });
      }

      res.json(updatedKey[0]);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await query('DELETE FROM api_keys WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'API key not found' });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ApiKeyController();
