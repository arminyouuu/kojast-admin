import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import PlaceController from '../controllers/PlaceController.js';
import ApiKeyController from '../controllers/ApiKeyController.js';
import settingsRoutes from './settingsRoutes.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import smsRoutes from './smsRoutes.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === validUsername && password === validPassword) {
    res.json({
      success: true,
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

router.use(authenticate);

router.get('/categories', CategoryController.getAll);
router.get('/categories/:id', CategoryController.getById);
router.post('/categories', CategoryController.create);
router.post('/categories/bulk-delete', CategoryController.bulkDelete);
router.put('/categories/:id', CategoryController.update);
router.delete('/categories/:id', CategoryController.delete);

router.post('/places/upload', upload.array('images', 10), PlaceController.uploadImages);
router.get('/places', PlaceController.getAll);
router.get('/places/:id', PlaceController.getById);
router.post('/places', PlaceController.create);
router.post('/places/bulk-delete', PlaceController.bulkDelete);
router.put('/places/:id', PlaceController.update);
router.delete('/places/:id', PlaceController.delete);

router.get('/dashboard/stats', async (req, res, next) => {
  try {
    const { query } = await import('../database/connection.js');

    const [placesCount] = await query('SELECT COUNT(*) as count FROM places');
    const [categoriesCount] = await query('SELECT COUNT(*) as count FROM categories');

    const recentPlaces = await query(
      `SELECT p.*, c.name as category_name
       FROM places p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC
       LIMIT 5`
    );

    const placesExpiringSoon = await query(
      `SELECT p.*, c.name as category_name
       FROM places p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.expiration_date IS NOT NULL
       AND p.expiration_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       ORDER BY p.expiration_date ASC
       LIMIT 5`
    );

    const categoriesWithPlaceCounts = await query(
      `SELECT c.id, c.name, COUNT(p.id) as count
       FROM categories c
       LEFT JOIN places p ON c.id = p.category_id
       GROUP BY c.id, c.name
       ORDER BY count DESC`
    );

    const [placesThisMonth] = await query(
      `SELECT COUNT(*) as count FROM places
       WHERE MONTH(created_at) = MONTH(CURRENT_DATE())
       AND YEAR(created_at) = YEAR(CURRENT_DATE())`
    );

    const [pendingRatingsCount] = await query(
      `SELECT COUNT(*) as count FROM ratings WHERE status = 'pending'`
    );

    const mapPlace = (place) => ({
      id: place.id,
      name: place.name,
      description: place.description,
      address: place.address,
      category_id: place.category_id,
      latitude: place.latitude,
      longitude: place.longitude,
      expiration_date: place.expiration_date,
      created_at: place.created_at,
      updated_at: place.updated_at,
      category: place.category_name ? { id: place.category_id, name: place.category_name } : null
    });

    res.json({
      totalPlaces: placesCount.count,
      totalCategories: categoriesCount.count,
      recentPlaces: recentPlaces.map(mapPlace),
      placesExpiringSoon: placesExpiringSoon.map(mapPlace),
      categoriesWithPlaceCounts: categoriesWithPlaceCounts,
      placesCreatedThisMonth: placesThisMonth.count,
      pendingRatingsCount: pendingRatingsCount.count
    });
  } catch (error) {
    next(error);
  }
});

router.get('/api-keys', ApiKeyController.getAll);
router.post('/api-keys', ApiKeyController.create);
router.put('/api-keys/:id', ApiKeyController.update);
router.delete('/api-keys/:id', ApiKeyController.delete);

router.get('/users', async (req, res, next) => {
  try {
    const { query } = await import('../database/connection.js');

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const offset = (page - 1) * perPage;

    const users = await query(
      `SELECT id, phone_number, email, full_name, created_at, last_login, is_active
       FROM users
       ORDER BY created_at DESC
       `
    );

    const [countResult] = await query('SELECT COUNT(*) as total FROM users');
    const total = countResult.total;

    res.json({
      success: true,
      data: users,
      meta: {
        total,
        page,
        limit: perPage,
        pages: Math.ceil(total / perPage)
      }
    });
  } catch (error) {
    next(error);
  }
});



router.post('/users', async (req, res, next) => {
  try {
    const { query } = await import('../database/connection.js');
    const { full_name, email, phone_number, password, is_active } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const bcrypt = await import('bcryptjs');
    const password_hash = await bcrypt.default.hash(password, 10);

    const result = await query(
      'INSERT INTO users (full_name, email, phone_number, password_hash, is_active) VALUES (?, ?, ?, ?, ?)',
      [full_name, email || null, phone_number || null, password_hash, is_active ?? true]
    );

    const [user] = await query(
      'SELECT id, phone_number, email, full_name, created_at, last_login, is_active FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id', async (req, res, next) => {
  try {
    const { query } = await import('../database/connection.js');
    const userId = req.params.id;
    const { full_name, email, phone_number, is_active } = req.body;

    await query(
      'UPDATE users SET full_name = ?, email = ?, phone_number = ?, is_active = ? WHERE id = ?',
      [full_name, email || null, phone_number || null, is_active, userId]
    );

    const [user] = await query(
      'SELECT id, phone_number, email, full_name, created_at, last_login, is_active FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id/toggle-status', async (req, res, next) => {
  try {
    const { query } = await import('../database/connection.js');
    const userId = req.params.id;

    await query(
      'UPDATE users SET is_active = NOT is_active WHERE id = ?',
      [userId]
    );

    const [user] = await query(
      'SELECT id, phone_number, email, full_name, created_at, last_login, is_active FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'User status updated',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const { query } = await import('../database/connection.js');
    const userId = req.params.id;

    await query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/users/:id/reset-password', async (req, res, next) => {
  try {
    const { query } = await import('../database/connection.js');
    const userId = req.params.id;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);

    await query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.use('/settings', settingsRoutes);

router.get('/ratings/pending', async (req, res, next) => {
  try {
    const RatingModerationService = (await import('../services/RatingModerationService.js')).default;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const result = await RatingModerationService.getPendingRatings(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/ratings', async (req, res, next) => {
  try {
    const RatingModerationService = (await import('../services/RatingModerationService.js')).default;
    const filters = {
      status: req.query.status,
      placeId: req.query.placeId,
      userId: req.query.userId
    };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const result = await RatingModerationService.getAllRatings(filters, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/ratings/:id/approve', async (req, res, next) => {
  try {
    const RatingModerationService = (await import('../services/RatingModerationService.js')).default;
    const ratingId = req.params.id;
    const adminUsername = req.body.adminUsername || 'admin';
    const result = await RatingModerationService.approveRating(ratingId, adminUsername);
    res.json({
      success: true,
      message: 'Rating approved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.post('/ratings/:id/reject', async (req, res, next) => {
  try {
    const RatingModerationService = (await import('../services/RatingModerationService.js')).default;
    const ratingId = req.params.id;
    const adminUsername = req.body.adminUsername || 'admin';
    const reason = req.body.reason || null;
    const result = await RatingModerationService.rejectRating(ratingId, adminUsername, reason);
    res.json({
      success: true,
      message: 'Rating rejected successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/ratings/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const ratingId = parseInt(id, 10);

    if (isNaN(ratingId) || ratingId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid rating ID' });
    }

    // Use SERVICE only — no direct repo access!
    const RatingModerationService = (await import('../services/RatingModerationService.js')).default;
    const rating = await RatingModerationService.getRatingById(ratingId);

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    // Now delete via RatingService (which handles recalc too)
    const RatingService = (await import('../services/RatingService.js')).default;
    await RatingService.deleteRating(rating.user_id, rating.place_id);

    res.json({ success: true, message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    next(error);
  }
});

router.post('/ratings/bulk-approve', async (req, res, next) => {
  try {
    const RatingModerationService = (await import('../services/RatingModerationService.js')).default;
    const { ratingIds, adminUsername } = req.body;
    const admin = adminUsername || 'admin';
    const result = await RatingModerationService.bulkApprove(ratingIds, admin);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/ratings/bulk-reject', async (req, res, next) => {
  try {
    const RatingModerationService = (await import('../services/RatingModerationService.js')).default;
    const { ratingIds, adminUsername, reason } = req.body;
    const admin = adminUsername || 'admin';
    const result = await RatingModerationService.bulkReject(ratingIds, admin, reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/ratings/stats', async (req, res, next) => {
  try {
    const RatingModerationService = (await import('../services/RatingModerationService.js')).default;
    const stats = await RatingModerationService.getRatingStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.use('/sms', smsRoutes);  // ← Add this line

export default router;
