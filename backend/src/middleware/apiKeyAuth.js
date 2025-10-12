import { query } from '../database/connection.js';

export const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      status: 401,
      message: 'API key required'
    });
  }

  try {
    const keys = await query(
      'SELECT id, permissions, is_active FROM api_keys WHERE api_key = ?',
      [apiKey]
    );

    if (keys.length === 0) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid API key'
      });
    }

    const keyData = keys[0];

    if (!keyData.is_active) {
      return res.status(403).json({
        status: 403,
        message: 'API key is inactive'
      });
    }

    await query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE id = ?',
      [keyData.id]
    );

    const permissions = typeof keyData.permissions === 'string'
      ? JSON.parse(keyData.permissions)
      : keyData.permissions;

    req.apiKeyPermissions = permissions;

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      status: 500,
      message: 'Internal server error'
    });
  }
};

export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.apiKeyPermissions || !req.apiKeyPermissions[requiredPermission]) {
      return res.status(403).json({
        status: 403,
        message: `Permission '${requiredPermission}' required`
      });
    }
    next();
  };
};
