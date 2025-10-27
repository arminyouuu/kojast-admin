import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Pencil, Trash2, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import Toast from './Toast';
import ConfirmModal from './ConfirmModal';

interface Banner {
  id: number;
  title: string | null;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    link_url: '',
    display_order: 0,
    is_active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<Banner[]>('/banner');
      setBanners(data);
    } catch (error) {
      setToast({ message: 'خطا در بارگذاری بنرها', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setToast({ message: 'فقط فایل‌های تصویری مجاز هستند', type: 'error' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setToast({ message: 'حجم فایل نباید بیشتر از 10 مگابایت باشد', type: 'error' });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !editingBanner) {
      setToast({ message: 'لطفاً یک تصویر انتخاب کنید', type: 'error' });
      return;
    }

    try {
      setIsUploading(true);
      const formDataToSend = new FormData();

      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }
      formDataToSend.append('title', formData.title);
      formDataToSend.append('link_url', formData.link_url);
      formDataToSend.append('display_order', formData.display_order.toString());
      formDataToSend.append('is_active', formData.is_active.toString());

      const credentials = localStorage.getItem('admin_credentials');
      const headers: HeadersInit = {};
      if (credentials) {
        headers['Authorization'] = `Basic ${credentials}`;
      }

      const url = editingBanner
        ? `${API_BASE_URL}/banners/${editingBanner.id}`
        : `${API_BASE_URL}/banners`;

      const response = await fetch(url, {
        method: editingBanner ? 'PUT' : 'POST',
        headers,
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'عملیات ناموفق بود' }));
        throw new Error(error.message);
      }

      setToast({
        message: editingBanner ? 'بنر با موفقیت ویرایش شد' : 'بنر با موفقیت ایجاد شد',
        type: 'success'
      });

      resetForm();
      loadBanners();
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'خطا در آپلود بنر',
        type: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      link_url: banner.link_url || '',
      display_order: banner.display_order,
      is_active: banner.is_active,
    });
    setPreviewUrl(banner.image_url.startsWith('http') ? banner.image_url : `${API_BASE_URL}${banner.image_url}`);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const credentials = localStorage.getItem('admin_credentials');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (credentials) {
        headers['Authorization'] = `Basic ${credentials}`;
      }

      const response = await fetch(`${API_BASE_URL}/banners/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('حذف بنر ناموفق بود');
      }

      setToast({ message: 'بنر با موفقیت حذف شد', type: 'success' });
      setDeleteConfirm(null);
      loadBanners();
    } catch (error) {
      setToast({ message: 'خطا در حذف بنر', type: 'error' });
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const credentials = localStorage.getItem('admin_credentials');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (credentials) {
        headers['Authorization'] = `Basic ${credentials}`;
      }

      const response = await fetch(`${API_BASE_URL}/banners/${banner.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ is_active: !banner.is_active }),
      });

      if (!response.ok) {
        throw new Error('تغییر وضعیت ناموفق بود');
      }

      setToast({ message: 'وضعیت بنر تغییر کرد', type: 'success' });
      loadBanners();
    } catch (error) {
      setToast({ message: 'خطا در تغییر وضعیت', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', link_url: '', display_order: 0, is_active: true });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingBanner(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">مدیریت بنرها</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            آپلود و مدیریت بنرهای اپلیکیشن
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {editingBanner ? 'ویرایش بنر' : 'افزودن بنر جدید'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              تصویر بنر
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedFile ? selectedFile.name : 'انتخاب تصویر'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {previewUrl && (
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                عنوان (اختیاری)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100"
                placeholder="عنوان بنر"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                لینک (اختیاری)
              </label>
              <input
                type="text"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                ترتیب نمایش
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100"
                min="0"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer mt-7">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  فعال
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'در حال آپلود...' : editingBanner ? 'ویرایش بنر' : 'ایجاد بنر'}
            </button>
            {editingBanner && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                انصراف
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            بنرهای موجود ({banners.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-600 dark:text-slate-400">
            در حال بارگذاری...
          </div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center">
            <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">هیچ بنری موجود نیست</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                >
                  <div className="aspect-video bg-slate-100 dark:bg-slate-900 relative">
                    <img
                      src={banner.image_url.startsWith('http') ? banner.image_url : `${API_BASE_URL}${banner.image_url}`}
                      alt={banner.title || 'بنر'}
                      className="w-full h-full object-cover"
                    />
                    {!banner.is_active && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">غیرفعال</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    {banner.title && (
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {banner.title}
                      </h3>
                    )}

                    {banner.link_url && (
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <LinkIcon className="w-4 h-4" />
                        <span className="truncate">{banner.link_url}</span>
                      </div>
                    )}

                    <div className="text-sm text-slate-500 dark:text-slate-500">
                      ترتیب: {banner.display_order}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => toggleActive(banner)}
                        className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
                        title={banner.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                      >
                        {banner.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(banner)}
                        className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(banner)}
                        className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {deleteConfirm && (
        <ConfirmModal
          isOpen={true}
          title="حذف بنر"
          message={`آیا از حذف این بنر اطمینان دارید؟`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
