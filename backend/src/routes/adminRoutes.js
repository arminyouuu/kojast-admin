import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import PlaceController from '../controllers/PlaceController.js';
import ApiKeyController from '../controllers/ApiKeyController.js';
import settingsRoutes from './settingsRoutes.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

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

    res.json({
      totalPlaces: placesCount.count,
      totalCategories: categoriesCount.count,
      recentPlaces: recentPlaces.map(place => ({
        id: place.id,
        name: place.name,
        description: place.description,
        address: place.address,
        category_id: place.category_id,
        latitude: place.latitude,
        longitude: place.longitude,
        created_at: place.created_at,
        updated_at: place.updated_at,
        category: place.category_name ? { id: place.category_id, name: place.category_name } : null
      }))
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const users = await query(
      `SELECT id, phone_number, email, full_name, created_at, last_login, is_active
       FROM users
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]  // Properly ordered and typed parameters
    );

    const [countResult] = await query('SELECT COUNT(*) as total FROM users');

    res.json({
      success: true,
      data: users,
      meta: {
        total: countResult.total,
        page,
        pages: Math.ceil(countResult.total / limit),
        limit
      }
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

router.use('/settings', settingsRoutes);

export default router;
