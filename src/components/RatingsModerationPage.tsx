import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Star, Check, X as XIcon, AlertCircle } from 'lucide-react';
import StarRating from './StarRating';
import RejectRatingModal from './RejectRatingModal';
import ToastContainer, { type ToastMessage } from './ToastContainer';
import { format } from 'date-fns-jalali';

interface Rating {
  id: number;
  place_id: number;
  place_name: string;
  place_address: string;
  user_id: string;
  user_name: string;
  user_contact: string;
  rating: number;
  comment: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

type TabType = 'pending' | 'all' | 'approved' | 'rejected';

export default function RatingsModerationPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRatings, setSelectedRatings] = useState<Set<number>>(new Set());
  const [rejectModal, setRejectModal] = useState<{ show: boolean; ratingId: number | null }>({
    show: false,
    ratingId: null,
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    loadRatings();
    loadStats();
  }, [activeTab]);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const loadStats = async () => {
    try {
      const data = await api.ratings.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadRatings = async () => {
    try {
      setIsLoading(true);
      let data;
      if (activeTab === 'pending') {
        const response = await api.ratings.getPending();
        data = response.data;
      } else if (activeTab === 'all') {
        const response = await api.ratings.getAll({});
        data = response.data;
      } else {
        const response = await api.ratings.getAll({ status: activeTab });
        data = response.data;
      }
      setRatings(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ratings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (ratingId: number) => {
    try {
      await api.ratings.approve(ratingId);
      await loadRatings();
      await loadStats();
      addToast('امتیاز با موفقیت تایید شد', 'success');
    } catch (err) {
      addToast('خطا در تایید امتیاز', 'error');
    }
  };

  const handleRejectClick = (ratingId: number) => {
    setRejectModal({ show: true, ratingId });
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectModal.ratingId) return;

    try {
      await api.ratings.reject(rejectModal.ratingId, reason);
      setRejectModal({ show: false, ratingId: null });
      await loadRatings();
      await loadStats();
      addToast('امتیاز رد شد', 'success');
    } catch (err) {
      addToast('خطا در رد امتیاز', 'error');
      setRejectModal({ show: false, ratingId: null });
    }
  };

  const handleDelete = async (rating: Rating) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این نظر را حذف کنید؟')) return;
    try {
      await api.ratings.delete(rating.id);
      await loadRatings();
      await loadStats();
      addToast('نظر با موفقیت حذف شد', 'success');
    } catch (err) {
      addToast('خطا در حذف نظر', 'error');
    }
  };

  const toggleRatingSelection = (ratingId: number) => {
    setSelectedRatings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ratingId)) {
        newSet.delete(ratingId);
      } else {
        newSet.add(ratingId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRatings.size === ratings.length) {
      setSelectedRatings(new Set());
    } else {
      setSelectedRatings(new Set(ratings.map((r) => r.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRatings.size === 0) return;

    try {
      await api.ratings.bulkApprove(Array.from(selectedRatings));
      setSelectedRatings(new Set());
      await loadRatings();
      await loadStats();
      addToast(`${selectedRatings.size} امتیاز تایید شد`, 'success');
    } catch (err) {
      addToast('خطا در تایید امتیازها', 'error');
    }
  };

  const handleBulkReject = async () => {
    if (selectedRatings.size === 0) return;

    try {
      await api.ratings.bulkReject(Array.from(selectedRatings));
      setSelectedRatings(new Set());
      await loadRatings();
      await loadStats();
      addToast(`${selectedRatings.size} امتیاز رد شد`, 'success');
    } catch (err) {
      addToast('خطا در رد امتیازها', 'error');
    }
  };

  const formatJalaliDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy/MM/dd HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading && ratings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100"></div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 bg-slate-900 dark:bg-slate-700 rounded-xl">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">بررسی امتیازات</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              در انتظار: {stats.pending} | تایید شده: {stats.approved} | رد شده: {stats.rejected}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex space-x-reverse space-x-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          همه
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'pending'
              ? 'text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          در انتظار ({stats.pending})
        </button>
        
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'approved'
              ? 'text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          تایید شده ({stats.approved})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'rejected'
              ? 'text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          رد شده ({stats.rejected})
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {selectedRatings.size > 0 && activeTab === 'pending' && (
        <div className="mb-4 bg-slate-900 dark:bg-slate-700 text-white px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-3">
            <span className="font-medium">{selectedRatings.size} مورد انتخاب شده</span>
            <button
              onClick={() => setSelectedRatings(new Set())}
              className="text-slate-300 dark:text-slate-400 hover:text-white"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex space-x-reverse space-x-2">
            <button
              onClick={handleBulkApprove}
              className="flex items-center space-x-reverse space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>تایید همه</span>
            </button>
            <button
              onClick={handleBulkReject}
              className="flex items-center space-x-reverse space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              <XIcon className="w-4 h-4" />
              <span>رد همه</span>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {ratings.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
            <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              {activeTab === 'pending' ? 'هیچ امتیازی در انتظار بررسی نیست' : 'هیچ امتیازی یافت نشد'}
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'pending' && (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-lg">
                <label className="flex items-center space-x-reverse space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ratings.length > 0 && selectedRatings.size === ratings.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-slate-900 dark:focus:ring-slate-100"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">انتخاب همه</span>
                </label>
              </div>
            )}

            {ratings.map((rating) => (
              <div
                key={rating.id}
                className={`bg-white dark:bg-slate-800 rounded-lg shadow p-6 ${
                  rating.status === 'rejected' ? 'border-r-4 border-red-500' : ''
                } ${rating.status === 'approved' ? 'border-r-4 border-green-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-reverse space-x-4 flex-1">
                    {activeTab === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selectedRatings.has(rating.id)}
                        onChange={() => toggleRatingSelection(rating.id)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-slate-900 dark:focus:ring-slate-100"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-reverse space-x-3 mb-2">
                        <StarRating rating={rating.rating} size="md" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {rating.rating} ستاره
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-medium">کاربر:</span> {rating.user_name || 'ناشناس'}{' '}
                          {rating.user_contact && `(${rating.user_contact})`}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-medium">مکان:</span> {rating.place_name}
                        </p>
                        {rating.comment && (
                          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <p className="text-sm text-slate-700 dark:text-slate-300">{rating.comment}</p>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          تاریخ ثبت: {formatJalaliDate(rating.created_at)}
                        </p>
                        {rating.reviewed_by && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            بررسی شده توسط: {rating.reviewed_by} در {formatJalaliDate(rating.reviewed_at || '')}
                          </p>
                        )}
                        {rating.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                            <p className="text-xs text-red-700 dark:text-red-300">
                              <span className="font-medium">دلیل رد:</span> {rating.rejection_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {rating.status === 'pending' && (
                    <div className="flex space-x-reverse space-x-2">
                      <button
                        onClick={() => handleApprove(rating.id)}
                        className="flex items-center space-x-reverse space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                        title="تایید"
                      >
                        <Check className="w-4 h-4" />
                        <span>تایید</span>
                      </button>
                      <button
                        onClick={() => handleRejectClick(rating.id)}
                        className="flex items-center space-x-reverse space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                        title="رد"
                      >
                        <XIcon className="w-4 h-4" />
                        <span>رد</span>
                      </button>
                    </div>
                  )}

                  {rating.status === 'approved' && (
                    <div className="flex items-center space-x-reverse space-x-2">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        تایید شده
                      </span>
                      <button
                        onClick={() => handleDelete(rating)}
                        className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="حذف نظر"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {rating.status === 'rejected' && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                      رد شده
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <RejectRatingModal
        isOpen={rejectModal.show}
        onReject={handleRejectConfirm}
        onCancel={() => setRejectModal({ show: false, ratingId: null })}
      />
    </div>
  );
}
