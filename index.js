const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const categoryRoutes = require('./src/routes/categoryRoutes');
const placeRoutes = require('./src/routes/placeRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({
    message: 'CityPlace API',
    version: '1.0.0',
    endpoints: {
      public: {
        categories: 'GET /categories',
        places: 'GET /places',
        place: 'GET /places/:id'
      },
      admin: {
        createCategory: 'POST /admin/categories',
        updateCategory: 'PUT /admin/categories/:id',
        deleteCategory: 'DELETE /admin/categories/:id',
        createPlace: 'POST /admin/places',
        updatePlace: 'PUT /admin/places/:id',
        deletePlace: 'DELETE /admin/places/:id'
      }
    }
  });
});

app.use('/categories', categoryRoutes);
app.use('/places', placeRoutes);
app.use('/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`CityPlace API server running on port ${PORT}`);
});
