import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import type { Place, Category } from '../types';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import 'react-multi-date-picker/styles/colors/teal.css';

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
  const [expirationDate, setExpirationDate] = useState<DateObject | null>(null);
  const [images, setImages] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (place) {
      setName(place.name);
      setDescription(place.description);
      setAddress(place.address);
      setCategoryId(place.category_id || place.categoryId || '');
      setLatitude(place.latitude?.toString() || '');
      setLongitude(place.longitude?.toString() || '');

      const dateStr = place.expiration_date || place.expirationDate || '';
      if (dateStr) {
        const date = new Date(dateStr);
        setExpirationDate(new DateObject(date).convert(persian, persian_fa));
      } else {
        setExpirationDate(null);
      }

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setError('');

      const fileArray = Array.from(files);
      const result = await api.places.uploadImages(fileArray);

      const nonEmptyImages = images.filter(img => img.trim() !== '');
      setImages([...nonEmptyImages, ...result.urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'بارگذاری تصویر با خطا مواجه شد');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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

      let gregorianDateStr = null;
      if (expirationDate) {
        const gregorianDate = expirationDate.toDate();
        gregorianDateStr = gregorianDate.toISOString().split('T')[0];
      }

      const placeData = {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        categoryId: Number(categoryId),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        expirationDate: gregorianDateStr,
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
            <label className="block text-sm font-medium text-slate-700 mb-2">
              تاریخ انقضا
            </label>
            <DatePicker
              value={expirationDate}
              onChange={(date) => {
                setExpirationDate(date as DateObject);
              }}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              calendarPosition="bottom-right"
              className="teal"
              inputClass="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              containerStyle={{ width: '100%' }}
              placeholder="انتخاب تاریخ"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">
                تصاویر
              </label>
              <div className="flex space-x-reverse space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center space-x-reverse space-x-1 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'در حال بارگذاری...' : 'بارگذاری تصویر'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="flex items-center space-x-reverse space-x-1 text-sm text-slate-600 hover:text-slate-900"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن لینک</span>
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="space-y-2">
              {images.map((image, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex space-x-reverse space-x-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                      placeholder="https://example.com/image.jpg یا از بارگذاری تصویر استفاده کنید"
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
                  {image && (
                    <img
                      src={image}
                      alt={`پیش‌نمایش ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
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
