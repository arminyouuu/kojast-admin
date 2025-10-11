import CategoryService from '../services/CategoryService.js';

class CategoryController {
  async getAll(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { name } = req.body;
      const category = await CategoryService.createCategory(name);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { name } = req.body;
      const category = await CategoryService.updateCategory(req.params.id, name);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await CategoryService.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
