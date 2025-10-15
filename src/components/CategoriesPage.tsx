import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Category } from '../types';
import { Plus, Edit2, Trash2, FolderTree, X } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import ToastContainer, { type ToastMessage } from './ToastContainer';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; categoryId: number | null; categoryName: string }>({
    show: false,
    categoryId: null,
    categoryName: ''
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await api.categories.getAll();
      setCategories(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await api.categories.update(editingCategory.id, categoryName);
        addToast('دسته‌بندی با موفقیت به‌روزرسانی شد', 'success');
      } else {
        await api.categories.create(categoryName);
        addToast('دسته‌بندی با موفقیت ایجاد شد', 'success');
      }
      await loadCategories();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره دسته‌بندی');
      addToast('خطا در ذخیره دسته‌بندی', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setDeleteConfirm({
      show: true,
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.categoryId) return;

    try {
      await api.categories.delete(deleteConfirm.categoryId);
      await loadCategories();
      setDeleteConfirm({ show: false, categoryId: null, categoryName: '' });
      addToast('دسته‌بندی با موفقیت حذف شد', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف دسته‌بندی');
      setDeleteConfirm({ show: false, categoryId: null, categoryName: '' });
      addToast('خطا در حذف دسته‌بندی', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, categoryId: null, categoryName: '' });
  };

  const toggleCategorySelection = (categoryId: number) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.size === 0) return;

    try {
      await api.categories.bulkDelete(Array.from(selectedCategories));
      await loadCategories();
      setSelectedCategories(new Set());
      setBulkDeleteConfirm(false);
      addToast(`${selectedCategories.size} دسته‌بندی با موفقیت حذف شد`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete categories');
      addToast('خطا در حذف دسته‌بندی‌ها', 'error');
      setBulkDeleteConfirm(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100"></div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {selectedCategories.size > 0 && (
        <div className="mb-4 bg-slate-900 dark:bg-slate-700 text-white px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-3">
            <span className="font-medium">{selectedCategories.size} مورد انتخاب شده</span>
            <button
              onClick={() => setSelectedCategories(new Set())}
              className="text-slate-300 dark:text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setBulkDeleteConfirm(true)}
            className="flex items-center space-x-reverse space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف انتخاب شده‌ها</span>
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 bg-slate-900 dark:bg-slate-700 rounded-xl">
            <FolderTree className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">دسته‌بندی‌ها</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 space-x-reverse bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن دسته‌بندی</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-center w-12">
                <input
                  type="checkbox"
                  checked={categories.length > 0 && selectedCategories.size === categories.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-slate-900 dark:focus:ring-slate-100"
                />
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                شناسه
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                نام
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <FolderTree className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">هیچ دسته‌بندی وجود ندارد. اولین دسته‌بندی را ایجاد کنید!</p>
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category.id)}
                      onChange={() => toggleCategorySelection(category.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-slate-900 dark:focus:ring-slate-100"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                    {category.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 ml-4"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6" dir="rtl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
            </h3>
            <div className="mb-6">
              <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                نام دسته‌بندی
              </label>
              <input
                id="categoryName"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                placeholder="مثال: رستوران‌ها، باشگاه‌ها، کافه‌ها"
              />
            </div>
            <div className="flex justify-end space-x-3 space-x-reverse">
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                لغو
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !categoryName.trim()}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="حذف دسته‌بندی"
        message={`آیا مطمئن هستید که می‌خواهید "${deleteConfirm.categoryName}" را حذف کنید؟ این عملیات قابل بازگشت نیست.`}
        confirmText="حذف"
        cancelText="لغو"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />

      <ConfirmModal
        isOpen={bulkDeleteConfirm}
        title="حذف گروهی"
        message={`آیا مطمئن هستید که می‌خواهید ${selectedCategories.size} دسته‌بندی انتخاب شده را حذف کنید؟ این عملیات قابل بازگشت نیست.`}
        confirmText="حذف همه"
        cancelText="لغو"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        variant="danger"
      />
    </div>
  );
}
