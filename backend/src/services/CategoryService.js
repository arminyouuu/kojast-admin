import CategoryRepository from '../repositories/CategoryRepository.js';

class CategoryService {
  async getAllCategories() {
    return await CategoryRepository.findAll();
  }
 
  async getCategoryById(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw { status: 404, message: 'Category not found' };
    }
    return category;
  }

  async createCategory(name) {
    if (!name || name.trim().length === 0) {
      throw { status: 400, message: 'Category name is required' };
    }
    return await CategoryRepository.create(name.trim());
  }

  async updateCategory(id, data) {
    const updateData = {};

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw { status: 400, message: 'Category name is required' };
      }
      updateData.name = data.name.trim();
    }

    if (data.is_enabled !== undefined) {
      updateData.is_enabled = data.is_enabled;
    }

    const exists = await CategoryRepository.exists(id);
    if (!exists) {
      throw { status: 404, message: 'Category not found' };
    }

    return await CategoryRepository.update(id, updateData);
  }

  async deleteCategory(id) {
    const exists = await CategoryRepository.exists(id);
    if (!exists) {
      throw { status: 404, message: 'Category not found' };
    }

    return await CategoryRepository.delete(id);
  }

  async bulkDeleteCategories(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw { status: 400, message: 'Invalid or empty ids array' };
    }

    return await CategoryRepository.bulkDelete(ids);
  }
}

export default new CategoryService();
