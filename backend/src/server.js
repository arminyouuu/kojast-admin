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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({
    message: 'Kojast API',
    version: '1.0.0',
    endpoints: {
      categories: '/categories',
      places: '/places',
      admin: '/admin',
      auth: '/auth',
      favorites: '/favorites',
      ratings: '/ratings'
    }
  });
});

app.use('/categories', categoryRoutes);
app.use('/places', placeRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/ratings', ratingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  ExpirationCheckerService.start();
});
