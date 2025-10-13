import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Place, Category } from '../types';
import { Plus, Edit2, Trash2, MapPin, ChevronLeft, ChevronRight, Image } from 'lucide-react';
import PlaceModal from './PlaceModal';
import ConfirmModal from './ConfirmModal';
import ToastContainer, { type ToastMessage } from './ToastContainer';

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; placeId: number | null; placeName: string }>({
    show: false,
    placeId: null,
    placeName: ''
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadPlaces();
  }, [filterCategoryId, currentPage]);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const loadCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadPlaces = async () => {
    try {
      setIsLoading(true);
      const response = await api.places.getAll({
        categoryId: filterCategoryId,
        page: currentPage,
        limit: 10,
      });
      setPlaces(response.data);
      setTotalPages(response.pages);
      setTotal(response.total);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load places');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (place: Place) => {
    setDeleteConfirm({
      show: true,
      placeId: place.id,
      placeName: place.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.placeId) return;

    try {
      await api.places.delete(deleteConfirm.placeId);
      await loadPlaces();
      setDeleteConfirm({ show: false, placeId: null, placeName: '' });
      addToast('Place deleted successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete place');
      setDeleteConfirm({ show: false, placeId: null, placeName: '' });
      addToast('Failed to delete place', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, placeId: null, placeName: '' });
  };

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlace(null);
  };

  const handleSaveSuccess = () => {
    loadPlaces();
    handleCloseModal();
    addToast(editingPlace ? 'Place updated successfully' : 'Place created successfully', 'success');
  };

  const getCategoryName = (place: Place) => {
    if (place.category_name) {
      return place.category_name;
    }
    const categoryId = place.category_id || place.categoryId;
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  if (isLoading && places.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">مکان‌ها</h2>
          <p className="text-slate-600 text-sm mt-1">مجموع: {total} مکان</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filterCategoryId || ''}
            onChange={(e) => {
              setFilterCategoryId(e.target.value ? Number(e.target.value) : undefined);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
          >
            <option value="">همه دسته‌بندی‌ها</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-reverse space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن مکان</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  مکان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  دسته‌بندی
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  آدرس
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  تصاویر
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {places.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500">هنوز هیچ مکانی وجود ندارد. اولین مورد را ایجاد کنید!</p>
                  </td>
                </tr>
              ) : (
                places.map((place) => (
                  <tr key={place.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{place.name}</div>
                        <div className="text-sm text-slate-500 line-clamp-1">{place.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                        {getCategoryName(place)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                      {place.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-500 flex-row-reverse">
                        <Image className="w-4 h-4 ml-1" />
                        {place.images?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm">
                      <button
                        onClick={() => handleEdit(place)}
                        className="text-slate-600 hover:text-slate-900 ml-4"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(place)}
                        className="text-red-600 hover:text-red-800"
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

        {totalPages > 1 && (
          <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
            <div className="text-sm text-slate-600">
              صفحه {currentPage} از {totalPages}
            </div>
            <div className="flex space-x-reverse space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <PlaceModal
          place={editingPlace}
          categories={categories}
          onClose={handleCloseModal}
          onSuccess={handleSaveSuccess}
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="حذف مکان"
        message={`آیا مطمئن هستید که می‌خواهید "${deleteConfirm.placeName}" را حذف کنید؟ این عملیات قابل بازگشت نیست.`}
        confirmText="حذف"
        cancelText="لغو"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </div>
  );
}
