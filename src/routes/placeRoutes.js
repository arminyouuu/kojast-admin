const express = require('express');
const placeService = require('../services/placeService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filters = {
      categoryId: req.query.categoryId,
      page: req.query.page,
      limit: req.query.limit
    };
    const result = await placeService.getAllPlaces(filters);
    res.json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      status,
      message: error.message || 'Failed to fetch places'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const place = await placeService.getPlaceById(req.params.id);
    res.json(place);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      status,
      message: error.message || 'Failed to fetch place'
    });
  }
});

module.exports = router;
