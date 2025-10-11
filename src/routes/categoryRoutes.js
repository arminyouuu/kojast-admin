const express = require('express');
const categoryService = require('../services/categoryService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      status,
      message: error.message || 'Failed to fetch categories'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json(category);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      status,
      message: error.message || 'Failed to fetch category'
    });
  }
});

module.exports = router;
