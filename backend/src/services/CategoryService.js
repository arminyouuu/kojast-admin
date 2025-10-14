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

  async updateCategory(id, name) {
    if (!name || name.trim().length === 0) {
      throw { status: 400, message: 'Category name is required' };
    }

    const exists = await CategoryRepository.exists(id);
    if (!exists) {
      throw { status: 404, message: 'Category not found' };
    }

    return await CategoryRepository.update(id, name.trim());
  }

  async deleteCategory(id) {
    const exists = await CategoryRepository.exists(id);
    if (!exists) {
      throw { status: 404, message: 'Category not found' };
    }

    return await CategoryRepository.delete(id);
  }
}

export default new CategoryService();
