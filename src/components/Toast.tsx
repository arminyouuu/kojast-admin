import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      icon: CheckCircle,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      iconColor: 'text-emerald-600',
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-600',
    },
    info: {
      icon: AlertCircle,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-600',
    },
  };

  const styles = typeStyles[type];
  const Icon = styles.icon;

  return (
    <div
      className={`${styles.bg} ${styles.border} ${styles.text} border px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px] animate-in slide-in-from-top-5 fade-in duration-300`}
    >
      <Icon className={`w-5 h-5 ${styles.iconColor} flex-shrink-0`} />
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className={`${styles.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
