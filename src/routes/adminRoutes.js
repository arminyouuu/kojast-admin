const express = require('express');
const categoryService = require('../services/categoryService');
const placeService = require('../services/placeService');

const router = express.Router();

router.post('/categories', async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      status,
      message: error.message || 'Failed to create category'
    });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      status,
      message: error.message || 'Failed to update category'
    });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      status,
      message: error.message || 'Failed to delete category'
    });
  }
});

router.post('/places', async (req, res) => {
  try {
    const place = await placeService.createPlace(req.body);
    res.status(201).json(place);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      status,
      message: error.message || 'Failed to create place'
    });
  }
});

router.put('/places/:id', async (req, res) => {
  try {
    const place = await placeService.updatePlace(req.params.id, req.body);
    res.json(place);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      status,
      message: error.message || 'Failed to update place'
    });
  }
});

router.delete('/places/:id', async (req, res) => {
  try {
    await placeService.deletePlace(req.params.id);
    res.status(204).send();
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      status,
      message: error.message || 'Failed to delete place'
    });
  }
});

module.exports = router;
