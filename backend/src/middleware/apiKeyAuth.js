import { query } from '../database/connection.js';

export const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      status: 401,
      message: 'API key required. Include X-API-Key header.'
    });
  }

  try {
    const results = await query(
      'SELECT id, name, api_key, permissions, is_active FROM api_keys WHERE api_key = ?',
      [apiKey]
    );

    if (results.length === 0) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid API key'
      });
    }

    const key = results[0];

    if (!key.is_active) {
      return res.status(403).json({
        status: 403,
        message: 'API key is inactive'
      });
    }

    const permissions = typeof key.permissions === 'string'
      ? JSON.parse(key.permissions)
      : key.permissions;

    req.apiKey = {
      id: key.id,
      name: key.name,
      permissions
    };

    await query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE id = ?',
      [key.id]
    );

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Authentication failed'
    });
  }
};

export const requireRead = (req, res, next) => {
  if (!req.apiKey || !req.apiKey.permissions.read) {
    return res.status(403).json({
      status: 403,
      message: 'Read permission required'
    });
  }
  next();
};

export const requireWrite = (req, res, next) => {
  if (!req.apiKey || !req.apiKey.permissions.write) {
    return res.status(403).json({
      status: 403,
      message: 'Write permission required'
    });
  }
  next();
};
