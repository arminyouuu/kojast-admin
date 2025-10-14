import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import type { Place, Category } from '../types';
import { X, Trash2, Upload, ImagePlus } from 'lucide-react';
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
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
      setImages(imageUrls);
    }
  }, [place]);

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setError('');

      const fileArray = Array.from(files);
      const result = await api.places.uploadImages(fileArray);

      setImages([...images, ...result.urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'بارگذاری تصویر با خطا مواجه شد');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) return;

    try {
      setIsUploading(true);
      setError('');

      const result = await api.places.uploadImages(files);
      setImages([...images, ...result.urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'بارگذاری تصویر با خطا مواجه شد');
    } finally {
      setIsUploading(false);
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
        images: images,
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
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full my-8" dir="rtl">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {place ? 'ویرایش مکان' : 'افزودن مکان جدید'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              نام <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              placeholder="مثال: کافه مرکزی"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              دسته‌بندی <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              توضیحات <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent outline-none resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              placeholder="این مکان را توضیح دهید..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              آدرس <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              placeholder="مثال: خیابان آزادی، پلاک ۱۲۳"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                عرض جغرافیایی
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                placeholder="مثال: 35.6892"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                طول جغرافیایی
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                placeholder="مثال: 51.3890"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
              inputClass="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              containerStyle={{ width: '100%' }}
              placeholder="انتخاب تاریخ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              تصاویر
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-200
                ${isDragging
                  ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-700'
                  : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                }
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />

              <div className="flex flex-col items-center space-y-3">
                {isUploading ? (
                  <>
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">در حال بارگذاری...</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      {isDragging ? (
                        <ImagePlus className="w-7 h-7 text-slate-900 dark:text-slate-100" />
                      ) : (
                        <Upload className="w-7 h-7 text-slate-600 dark:text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-base font-medium text-slate-900 dark:text-slate-100 mb-1">
                        {isDragging ? 'فایل‌ها را اینجا رها کنید' : 'تصاویر را بکشید و اینجا رها کنید'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        یا کلیک کنید تا فایل انتخاب کنید
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      PNG, JPG, GIF حداکثر 10MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  تصاویر بارگذاری شده ({images.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    >
                      <img
                        src={image}
                        alt={`تصویر ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f1f5f9" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="Arial" font-size="12"%3Eخطا%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg transform hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-reverse space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            لغو
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره مکان'}
          </button>
        </div>
      </div>
    </div>
  );
}
