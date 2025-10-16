import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Place, Category } from '../types';
import { Plus, Edit2, Trash2, MapPin, ChevronLeft, ChevronRight, Image, X, Calendar } from 'lucide-react';
import PlaceModal from './PlaceModal';
import ConfirmModal from './ConfirmModal';
import ToastContainer, { type ToastMessage } from './ToastContainer';
import { format } from 'date-fns-jalali';
 
export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>();
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; placeId: number | null; placeName: string }>({
    show: false,
    placeId: null,
    placeName: ''
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Set<number>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadPlaces();
  }, [filterCategoryId, showExpiredOnly, currentPage]);

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
        categoryId: filterCategoryId?.toString(),
        page: currentPage,
        limit: 10,
        expired: showExpiredOnly,
      });
      setPlaces(response.data);
      setTotalPages(response.meta?.pages || response.pages || 1);
      setTotal(response.meta?.total || response.total || 0);
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
      await api.places.delete(deleteConfirm.placeId.toString());
      await loadPlaces();
      setDeleteConfirm({ show: false, placeId: null, placeName: '' });
      addToast('مکان با موفقیت حذف شد', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete place');
      setDeleteConfirm({ show: false, placeId: null, placeName: '' });
      addToast('خطا در حذف مکان', 'error');
    }
  };

  const togglePlaceSelection = (placeId: number) => {
    setSelectedPlaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(placeId)) {
        newSet.delete(placeId);
      } else {
        newSet.add(placeId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPlaces.size === places.length) {
      setSelectedPlaces(new Set());
    } else {
      setSelectedPlaces(new Set(places.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPlaces.size === 0) return;

    try {
      await api.places.bulkDelete(Array.from(selectedPlaces));
      await loadPlaces();
      setSelectedPlaces(new Set());
      setBulkDeleteConfirm(false);
      addToast(`${selectedPlaces.size} مکان با موفقیت حذف شد`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete places');
      addToast('خطا در حذف مکان‌ها', 'error');
      setBulkDeleteConfirm(false);
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
    addToast(editingPlace ? 'مکان با موفقیت بروزرسانی شد' : 'مکان جدید با موفقیت اضافه شد', 'success');
  };

  const getCategoryName = (place: Place) => {
    if (place.category_name) {
      return place.category_name;
    }
    const categoryId = place.category_id || place.categoryId;
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const formatJalaliDate = (dateString: string | null) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy/MM/dd');
    } catch (error) {
      return '—';
    }
  };

  const isExpired = (dateString: string | null) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date < today;
    } catch (error) {
      return false;
    }
  };

  if (isLoading && places.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100"></div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {selectedPlaces.size > 0 && (
        <div className="mb-4 bg-slate-900 dark:bg-slate-700 text-white px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-3">
            <span className="font-medium">{selectedPlaces.size} مورد انتخاب شده</span>
            <button
              onClick={() => setSelectedPlaces(new Set())}
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 bg-slate-900 dark:bg-slate-700 rounded-xl">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">مکان‌ها</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">مجموع: {total} مکان</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filterCategoryId || ''}
            onChange={(e) => {
              setFilterCategoryId(e.target.value ? Number(e.target.value) : undefined);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="">همه دسته‌بندی‌ها</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setShowExpiredOnly(!showExpiredOnly);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showExpiredOnly
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {showExpiredOnly ? 'نمایش همه' : 'فقط منقضی شده‌ها'}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-reverse space-x-2 bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن مکان</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-center w-12">
                  <input
                    type="checkbox"
                    checked={places.length > 0 && selectedPlaces.size === places.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-slate-900 dark:focus:ring-slate-100"
                  />
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  مکان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  دسته‌بندی
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  آدرس
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  تصاویر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  تاریخ انقضا
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {places.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <MapPin className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">هنوز هیچ مکانی وجود ندارد. اولین مورد را ایجاد کنید!</p>
                  </td>
                </tr>
              ) : (
                places.map((place) => {
                  const expired = isExpired(place.expiration_date || place.expirationDate || null);
                  return (
                    <tr
                      key={place.id}
                      className={`transition-colors ${
                        expired
                          ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedPlaces.has(place.id)}
                          onChange={() => togglePlaceSelection(place.id)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-slate-900 dark:focus:ring-slate-100"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center">
                            {place.name}
                            {expired && (
                              <span className="mr-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-600 text-white">
                                منقضی شده
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{place.description}</div>
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {getCategoryName(place)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {place.address && place.address.length > 20
                        ? `${place.address.substring(0, 20)}...`
                        : place.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 flex-row-reverse">
                        <Image className="w-4 h-4 ml-1" />
                        {place.images?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4 ml-1 text-slate-400 dark:text-slate-500" />
                        {formatJalaliDate(place.expiration_date || place.expirationDate || null)}
                      </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm">
                        <button
                          onClick={() => handleEdit(place)}
                          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 ml-4"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(place)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              صفحه {currentPage} از {totalPages}
            </div>
            <div className="flex space-x-reverse space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
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

      <ConfirmModal
        isOpen={bulkDeleteConfirm}
        title="حذف گروهی"
        message={`آیا مطمئن هستید که می‌خواهید ${selectedPlaces.size} مکان انتخاب شده را حذف کنید؟ این عملیات قابل بازگشت نیست.`}
        confirmText="حذف همه"
        cancelText="لغو"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        variant="danger"
      />
    </div>
  );
}
