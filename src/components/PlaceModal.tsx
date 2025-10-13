import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Place, Category } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface PlaceModalProps {
  place: Place | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function PlaceModal({ place, categories, onClose, onSuccess }: PlaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [images, setImages] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (place) {
      setName(place.name);
      setDescription(place.description);
      setAddress(place.address);
      setCategoryId(place.category_id || place.categoryId || '');
      setLatitude(place.latitude?.toString() || '');
      setLongitude(place.longitude?.toString() || '');
      const imageUrls = Array.isArray(place.images)
        ? place.images.filter(img => typeof img === 'string' && img.trim() !== '')
        : [];
      setImages(imageUrls.length > 0 ? imageUrls : ['']);
    }
  }, [place]);

  const handleAddImage = () => {
    setImages([...images, '']);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !address.trim() || !categoryId) {
      setError('لطفاً تمام فیلدهای الزامی را پر کنید');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const filteredImages = images.filter(img => img.trim() !== '');

      const placeData = {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        categoryId: Number(categoryId),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        images: filteredImages,
      };

      if (place) {
        await api.places.update(place.id, placeData);
      } else {
        await api.places.create(placeData);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره مکان با خطا مواجه شد');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8" dir="rtl">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">
            {place ? 'ویرایش مکان' : 'افزودن مکان جدید'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              نام <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              placeholder="مثال: کافه مرکزی"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              دسته‌بندی <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
            >
              <option value="">یک دسته‌بندی انتخاب کنید</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              توضیحات <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none resize-none"
              placeholder="این مکان را توضیح دهید..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              آدرس <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              placeholder="مثال: خیابان آزادی، پلاک ۱۲۳"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                عرض جغرافیایی
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="مثال: 35.6892"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                طول جغرافیایی
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="مثال: 51.3890"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">
                لینک تصاویر
              </label>
              <button
                type="button"
                onClick={handleAddImage}
                className="flex items-center space-x-reverse space-x-1 text-sm text-slate-600 hover:text-slate-900"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن تصویر</span>
              </button>
            </div>
            <div className="space-y-2">
              {images.map((image, index) => (
                <div key={index} className="flex space-x-reverse space-x-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-reverse space-x-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            لغو
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره مکان'}
          </button>
        </div>
      </div>
    </div>
  );
}
