import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmText = 'تایید',
  cancelText = 'لغو',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in duration-200">
        <div className="flex items-start space-x-4 space-x-reverse">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 space-x-reverse mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
