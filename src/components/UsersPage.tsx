import { useState, useEffect } from 'react';
import { Users, Search, UserCheck, UserX, Phone, Mail, Calendar, Clock } from 'lucide-react';
import { api } from '../lib/api';
import Toast from './Toast';
import ConfirmModal from './ConfirmModal';

interface User {
  id: number;
  phone_number: string | null;
  email: string | null;
  full_name: string | null;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

interface Meta {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pages: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ userId: number; isActive: boolean } | null>(null);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users?page=${page}&limit=${meta.limit}`);
      setUsers(response.data);
      setMeta(response.meta);
    } catch (error) {
      setToast({ message: 'خطا در بارگذاری کاربران', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      setToast({ message: 'وضعیت کاربر با موفقیت تغییر کرد', type: 'success' });
      fetchUsers(meta.page);
      setConfirmModal(null);
    } catch (error) {
      setToast({ message: 'خطا در تغییر وضعیت کاربر', type: 'error' });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.phone_number?.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 bg-slate-900 dark:bg-slate-700 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">مدیریت کاربران</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">مشاهده و مدیریت کاربران اپلیکیشن</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام، ایمیل یا شماره تلفن..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            {searchTerm ? 'کاربری یافت نشد' : 'هنوز کاربری ثبت‌نام نکرده است'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      کاربر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      اطلاعات تماس
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      تاریخ عضویت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      آخرین ورود
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      وضعیت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {user.full_name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="mr-3">
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {user.full_name || 'بدون نام'}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {user.phone_number && (
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                              <Phone className="w-4 h-4 ml-1" />
                              {user.phone_number}
                            </div>
                          )}
                          {user.email && (
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                              <Mail className="w-4 h-4 ml-1" />
                              {user.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                          <Calendar className="w-4 h-4 ml-1" />
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                          <Clock className="w-4 h-4 ml-1" />
                          {formatDate(user.last_login)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {user.is_active ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setConfirmModal({ userId: user.id, isActive: user.is_active })}
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            user.is_active
                              ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <UserX className="w-4 h-4 ml-1" />
                              غیرفعال کردن
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 ml-1" />
                              فعال کردن
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta.pages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  نمایش {((meta.page - 1) * meta.limit) + 1} تا {Math.min(meta.page * meta.limit, meta.total)} از {meta.total} کاربر
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => fetchUsers(meta.page - 1)}
                    disabled={meta.page === 1}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    قبلی
                  </button>
                  <span className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400">
                    صفحه {meta.page} از {meta.pages}
                  </span>
                  <button
                    onClick={() => fetchUsers(meta.page + 1)}
                    disabled={meta.page === meta.pages}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.isActive ? 'غیرفعال کردن کاربر' : 'فعال کردن کاربر'}
          message={confirmModal.isActive
            ? 'آیا مطمئن هستید که می‌خواهید این کاربر را غیرفعال کنید؟ کاربر نمی‌تواند وارد حساب کاربری خود شود.'
            : 'آیا مطمئن هستید که می‌خواهید این کاربر را فعال کنید؟'
          }
          confirmText={confirmModal.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
          confirmButtonClass={confirmModal.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          onConfirm={() => handleToggleStatus(confirmModal.userId)}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
