import SessionRepository from '../repositories/SessionRepository.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    const session = await SessionRepository.findByToken(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    if (!session.is_active) {
      return res.status(403).json({
        success: false,
        message: 'اکانت غیرفعال است'
      });
    }

    req.user = {
      id: session.user_id,
      phone_number: session.phone_number,
      email: session.email,
      full_name: session.full_name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const session = await SessionRepository.findByToken(token);

      if (session && session.is_active) {
        req.user = {
          id: session.user_id,
          phone_number: session.phone_number,
          email: session.email,
          full_name: session.full_name
        };
      }
    }

    next();
  } catch (error) {
    next();
  }
};
