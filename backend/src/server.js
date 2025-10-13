import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import categoryRoutes from './routes/categoryRoutes.js';
import placeRoutes from './routes/placeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Kojast API',
    version: '1.0.0',
    endpoints: {
      categories: '/categories',
      places: '/places',
      admin: '/admin'
    }
  });
});

app.use('/categories', categoryRoutes);
app.use('/places', placeRoutes);
app.use('/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
