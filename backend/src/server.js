import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import categoryRoutes from './routes/categoryRoutes.js';
import placeRoutes from './routes/placeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import favoritesRoutes from './routes/favoritesRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import ExpirationCheckerService from './services/ExpirationCheckerService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
  res.json({
    message: 'Kojast API',
    version: '1.0.0',
    endpoints: {
      categories: '/api/categories',
      places: '/api/places',
      admin: '/api/admin',
      auth: '/api/auth',
      favorites: '/api/favorites',
      ratings: '/api/ratings',
      banners: '/api/banner'
    }
  });
});

app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/categories', categoryRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/banner', bannerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  ExpirationCheckerService.start();
});
