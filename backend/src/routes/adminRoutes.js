import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import PlaceController from '../controllers/PlaceController.js';
import { authenticate } from '../middleware/auth.js';

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

router.post('/categories', CategoryController.create);
router.put('/categories/:id', CategoryController.update);
router.delete('/categories/:id', CategoryController.delete);

router.post('/places', PlaceController.create);
router.put('/places/:id', PlaceController.update);
router.delete('/places/:id', PlaceController.delete);

export default router;
