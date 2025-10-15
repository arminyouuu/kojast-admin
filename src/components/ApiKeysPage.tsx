import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { ApiKey } from '../types';
import { Key, Plus, Trash2, Copy, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import ToastContainer, { type ToastMessage } from './ToastContainer';
 
export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState({ read: true, write: false });
  const [isCreating, setIsCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; keyId: string | null; keyName: string }>({
    isOpen: false,
    keyId: null,
    keyName: '',
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const loadApiKeys = async () => {
    try {
      setIsLoading(true);
      const data = await api.apiKeys.getAll();
      setApiKeys(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for the API key');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      const newKey = await api.apiKeys.create(newKeyName, newKeyPermissions);
      setApiKeys([newKey, ...apiKeys]);
      setNewlyCreatedKey(newKey.key);
      setNewKeyName('');
      setNewKeyPermissions({ read: true, write: false });
      setShowCreateModal(false);
      addToast('کلید API با موفقیت ایجاد شد', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
      addToast('ایجاد کلید API ناموفق بود', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!deleteConfirm.keyId) return;

    try {
      await api.apiKeys.delete(deleteConfirm.keyId);
      setApiKeys(apiKeys.filter(key => key.id !== deleteConfirm.keyId));
      setError('');
      addToast('کلید API با موفقیت حذف شد', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
      addToast('حذف کلید API ناموفق بود', 'error');
    } finally {
      setDeleteConfirm({ isOpen: false, keyId: null, keyName: '' });
    }
  };

  const openDeleteConfirm = (key: ApiKey) => {
    setDeleteConfirm({
      isOpen: true,
      keyId: key.id,
      keyName: key.name,
    });
  };

  const handleToggleActive = async (key: ApiKey) => {
    try {
      const updated = await api.apiKeys.update(key.id, { is_active: !key.is_active });
      setApiKeys(apiKeys.map(k => k.id === key.id ? updated : k));
      setError('');
      addToast(`کلید API با موفقیت ${updated.is_active ? 'فعال' : 'غیرفعال'} شد`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update API key');
      addToast('به‌روزرسانی کلید API ناموفق بود', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100"></div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="font-['Vazirmatn']">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="حذف کلید API"
        message={`آیا مطمئن هستید که می‌خواهید "${deleteConfirm.keyName}" را حذف کنید؟ این عملیات قابل بازگشت نیست و هر برنامه‌ای که از این کلید استفاده می‌کند دیگر دسترسی نخواهد داشت.`}
        confirmText="حذف"
        cancelText="لغو"
        onConfirm={handleDeleteKey}
        onCancel={() => setDeleteConfirm({ isOpen: false, keyId: null, keyName: '' })}
        variant="danger"
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 bg-slate-900 dark:bg-slate-700 rounded-xl">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">کلیدهای API</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">مدیریت کلیدهای API برای دسترسی برنامه‌های خارجی</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 space-x-reverse bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>ایجاد کلید جدید</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2 space-x-reverse">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {newlyCreatedKey && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mt-6 mb-6">
          <div className="flex items-start space-x-3 space-x-reverse">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900 mb-2">کلید API با موفقیت ایجاد شد</h3>
              <div className="flex items-center space-x-2 space-x-reverse bg-white rounded-lg p-3 border border-emerald-200">
                <code className="flex-1 text-sm font-mono text-slate-900 break-all" dir="ltr">{newlyCreatedKey}</code>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className="flex-shrink-0 p-2 hover:bg-emerald-100 rounded transition-colors"
                  title="کپی در کلیپ‌بورد"
                >
                  {copiedKey === newlyCreatedKey ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 animate-in zoom-in duration-200" />
                  ) : (
                    <Copy className="w-4 h-4 text-emerald-600 transition-transform hover:scale-110" />
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              className="text-emerald-600 hover:text-emerald-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {apiKeys.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          <Key className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">هنوز کلید API ندارید</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">اولین کلید API خود را برای شروع استفاده از API ایجاد کنید</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            ایجاد کلید API
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">نام</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">کلید API</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">دسترسی‌ها</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">وضعیت</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">آخرین استفاده</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">تاریخ ایجاد</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Key className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span className="font-medium text-slate-900 dark:text-slate-100">{key.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <code className="text-sm text-slate-600 dark:text-slate-400 font-mono" dir="ltr">{maskApiKey(key.key)}</code>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                          title="کپی در کلیپ‌بورد"
                        >
                          {copiedKey === key.key ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 animate-in zoom-in duration-200" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform hover:scale-110" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        {key.permissions.read && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                            خواندن
                          </span>
                        )}
                        {key.permissions.write && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                            نوشتن
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(key)}
                        className="flex items-center space-x-1 space-x-reverse"
                      >
                        {key.is_active ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-emerald-600 font-medium">فعال</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-600 font-medium">غیرفعال</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString('fa-IR') : 'استفاده نشده'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(key.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start space-x-2 space-x-reverse">
                        <button
                          onClick={() => openDeleteConfirm(key)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف کلید API"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 mt-6 mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2 space-x-reverse text-lg">
          <AlertCircle className="w-5 h-5" />
          <span>راهنمای استفاده از API</span>
        </h3>
        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-4">
          <p className="font-medium">از کلیدهای API خود برای احراز هویت درخواست‌های Kojast API استفاده کنید. تمام درخواست‌ها نیاز به هدر <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded" dir="ltr">X-API-Key</code> دارند.</p>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">عملیات خواندن (نیاز به دسترسی خواندن)</h4>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 font-mono text-xs overflow-x-auto border border-slate-200 dark:border-slate-700 mb-2">
                <div className="text-emerald-600 font-semibold mb-1">GET /api/places</div>
                <div className="text-slate-500 dark:text-slate-400">Headers:</div>
                <div className="text-slate-700 dark:text-slate-300 ml-2">X-API-Key: your_api_key_here</div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 font-mono text-xs overflow-x-auto border border-slate-200 dark:border-slate-700 mb-2">
                <div className="text-emerald-600 font-semibold mb-1">GET /api/places/:id</div>
                <div className="text-slate-500 dark:text-slate-400">Headers:</div>
                <div className="text-slate-700 dark:text-slate-300 ml-2">X-API-Key: your_api_key_here</div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 font-mono text-xs overflow-x-auto border border-slate-200 dark:border-slate-700">
                <div className="text-emerald-600 font-semibold mb-1">GET /api/categories</div>
                <div className="text-slate-500 dark:text-slate-400">Headers:</div>
                <div className="text-slate-700 dark:text-slate-300 ml-2">X-API-Key: your_api_key_here</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">عملیات نوشتن (نیاز به دسترسی نوشتن)</h4>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 font-mono text-xs overflow-x-auto border border-slate-200 dark:border-slate-700 mb-2">
                <div className="text-orange-600 font-semibold mb-1">POST /api/places</div>
                <div className="text-slate-500 dark:text-slate-400">Headers:</div>
                <div className="text-slate-700 dark:text-slate-300 ml-2 mb-1">X-API-Key: your_api_key_here</div>
                <div className="text-slate-700 dark:text-slate-300 ml-2">Content-Type: application/json</div>
                <div className="text-slate-500 dark:text-slate-400 mt-2">Body:</div>
                <div className="text-slate-600 dark:text-slate-400 ml-2">{'{'}</div>
                <div className="text-slate-600 dark:text-slate-400 ml-4">"name": "New Place",</div>
                <div className="text-slate-600 dark:text-slate-400 ml-4">"description": "Description",</div>
                <div className="text-slate-600 dark:text-slate-400 ml-4">"category_id": "uuid",</div>
                <div className="text-slate-600 dark:text-slate-400 ml-4">"latitude": 40.7128,</div>
                <div className="text-slate-600 dark:text-slate-400 ml-4">"longitude": -74.0060</div>
                <div className="text-slate-600 dark:text-slate-400 ml-2">{'}'}</div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 font-mono text-xs overflow-x-auto border border-slate-200 dark:border-slate-700 mb-2">
                <div className="text-amber-600 font-semibold mb-1">PUT /api/places/:id</div>
                <div className="text-slate-500 dark:text-slate-400">Headers:</div>
                <div className="text-slate-700 dark:text-slate-300 ml-2 mb-1">X-API-Key: your_api_key_here</div>
                <div className="text-slate-700 dark:text-slate-300 ml-2">Content-Type: application/json</div>
                <div className="text-slate-500 dark:text-slate-400 mt-2">Body:</div>
                <div className="text-slate-600 dark:text-slate-400 ml-2">{'{'}</div>
                <div className="text-slate-600 dark:text-slate-400 ml-4">"name": "Updated Name",</div>
                <div className="text-slate-600 dark:text-slate-400 ml-4">"description": "Updated description"</div>
                <div className="text-slate-600 dark:text-slate-400 ml-2">{'}'}</div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 font-mono text-xs overflow-x-auto border border-slate-200 dark:border-slate-700">
                <div className="text-red-600 font-semibold mb-1">DELETE /api/places/:id</div>
                <div className="text-slate-500 dark:text-slate-400">Headers:</div>
                <div className="text-slate-700 dark:text-slate-300 ml-2">X-API-Key: your_api_key_here</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">مثال با JavaScript fetch()</h4>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 font-mono text-xs overflow-x-auto border border-slate-200 dark:border-slate-700">
                <div className="text-slate-700 dark:text-slate-300">
                  <div className="text-slate-900 dark:text-slate-100">const</div> response = <div className="inline text-slate-900 dark:text-slate-100">await</div> fetch('https://kojast.com/api/places', {'{'}</div>
                <div className="text-slate-700 dark:text-slate-300 ml-2">method: <span className="text-emerald-600">'GET'</span>,</div>
                <div className="text-slate-700 dark:text-slate-300 ml-2">headers: {'{'}</div>
                <div className="text-slate-700 dark:text-slate-300 ml-4"><span className="text-emerald-600">'X-API-Key'</span>: <span className="text-emerald-600">'your_api_key_here'</span></div>
                <div className="text-slate-700 dark:text-slate-300 ml-2">{'}'}</div>
                <div className="text-slate-700 dark:text-slate-300">{'}'});</div>
                <div className="text-slate-700 dark:text-slate-300 mt-1"><div className="inline text-slate-900 dark:text-slate-100">const</div> data = <div className="inline text-slate-900 dark:text-slate-100">await</div> response.json();</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">کدهای پاسخ</h4>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <ul className="space-y-1 text-xs">
                  <li><code className="text-emerald-600 font-semibold" dir="ltr">200 OK</code> - درخواست موفق</li>
                  <li><code className="text-orange-600 font-semibold" dir="ltr">201 Created</code> - منبع با موفقیت ایجاد شد</li>
                  <li><code className="text-red-600 font-semibold" dir="ltr">401 Unauthorized</code> - کلید API نامعتبر یا موجود نیست</li>
                  <li><code className="text-red-600 font-semibold" dir="ltr">403 Forbidden</code> - دسترسی کافی نیست</li>
                  <li><code className="text-red-600 font-semibold" dir="ltr">404 Not Found</code> - منبع یافت نشد</li>
                  <li><code className="text-red-600 font-semibold" dir="ltr">500 Server Error</code> - خطای داخلی سرور</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border border-slate-300 dark:border-slate-700">
            <p className="font-semibold mb-2 text-slate-900 dark:text-slate-100">بهترین شیوه‌های امنیتی:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
              <li>هرگز کلیدهای API خود را به صورت عمومی به اشتراک نگذارید یا آن‌ها را در کنترل نسخه ذخیره نکنید</li>
              <li>از متغیرهای محیطی (env) برای ذخیره کلیدهای API در برنامه‌های خود استفاده کنید</li>
              <li>کلیدهای جداگانه برای محیط‌های مختلف (توسعه، آزمایشی، تولید) ایجاد کنید</li>
              <li>فقط حداقل دسترسی‌های مورد نیاز را اعطا کنید (خواندن در مقابل نوشتن)</li>
              <li>کلیدهای API را به طور منظم تغییر دهید و بلافاصله کلیدهای به خطر افتاده را غیرفعال کنید</li>
              <li>استفاده از کلید API را از طریق ستون "آخرین استفاده" رصد کنید</li>
            </ul>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">ایجاد کلید API جدید</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  نام کلید
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="مثلاً اپلیکیشن موبایل، توسعه"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  دسترسی‌ها
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={newKeyPermissions.read}
                      onChange={(e) => setNewKeyPermissions({ ...newKeyPermissions, read: e.target.checked })}
                      className="w-4 h-4 text-slate-900 rounded"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">دسترسی خواندن (مشاهده مکان‌ها و دسته‌بندی‌ها)</span>
                  </label>
                  <label className="flex items-center space-x-3 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={newKeyPermissions.write}
                      onChange={(e) => setNewKeyPermissions({ ...newKeyPermissions, write: e.target.checked })}
                      className="w-4 h-4 text-slate-900 rounded"
                    />
                    <span className="text-sm text-slate-700">دسترسی نوشتن (ایجاد، به‌روزرسانی و حذف)</span>
                  </label>
                </div>
              </div>


            </div>

            <div className="flex space-x-3 space-x-reverse mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewKeyName('');
                  setNewKeyPermissions({ read: true, write: false });
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                لغو
              </button>
              <button
                onClick={handleCreateKey}
                disabled={isCreating || !newKeyName.trim()}
                className="flex-1 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'در حال ایجاد...' : 'ایجاد کلید'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
