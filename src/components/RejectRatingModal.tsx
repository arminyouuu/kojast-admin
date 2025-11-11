import { useState } from 'react';
import { X } from 'lucide-react';

interface RejectRatingModalProps {
  isOpen: boolean;
  onReject: (reason: string) => void;
  onCancel: () => void;
}

export default function RejectRatingModal({ isOpen, onReject, onCancel }: RejectRatingModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleReject = () => {
    onReject(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6" dir="rtl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">رد کردن امتیاز</h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            دلیل رد (اختیاری)
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            placeholder="دلیل رد کردن این امتیاز را بنویسید..."
          />
        </div>

        <div className="flex justify-end space-x-reverse space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            لغو
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors"
          >
            رد کردن
          </button>
        </div>
      </div>
    </div>
  );
}
