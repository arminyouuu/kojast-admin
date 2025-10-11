const categoryRepository = require('../repositories/categoryRepository');

class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw { status: 404, message: 'Category not found' };
    }
    return category;
  }

  async createCategory(categoryData) {
    if (!categoryData.name || categoryData.name.trim() === '') {
      throw { status: 400, message: 'Category name is required' };
    }

    return await categoryRepository.create({
      name: categoryData.name.trim()
    });
  }

  async updateCategory(id, categoryData) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Category not found' };
    }

    if (!categoryData.name || categoryData.name.trim() === '') {
      throw { status: 400, message: 'Category name is required' };
    }

    return await categoryRepository.update(id, {
      name: categoryData.name.trim()
    });
  }

  async deleteCategory(id) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Category not found' };
    }

    return await categoryRepository.delete(id);
  }
}

module.exports = new CategoryService();
