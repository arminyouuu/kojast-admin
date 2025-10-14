import { useState, useEffect } from 'react';
import { Settings, Save, Moon, Sun } from 'lucide-react';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'telegram'>('general');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await api.settings.getAll();
      const botToken = settings.find((s: any) => s.setting_key === 'telegram_bot_token');
      const chatId = settings.find((s: any) => s.setting_key === 'telegram_chat_id');

      if (botToken) setTelegramBotToken(botToken.setting_value || '');
      if (chatId) setTelegramChatId(chatId.setting_value || '');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      await api.settings.set('telegram_bot_token', telegramBotToken);
      await api.settings.set('telegram_chat_id', telegramChatId);

      setMessage({ type: 'success', text: 'تنظیمات با موفقیت ذخیره شد' });
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در ذخیره تنظیمات' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Settings className="w-8 h-8 text-slate-900 dark:text-slate-100" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">تنظیمات</h2>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex space-x-reverse space-x-1 px-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'general'
                  ? 'text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              عمومی
            </button>
            <button
              onClick={() => setActiveTab('telegram')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'telegram'
                  ? 'text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              تلگرام
            </button>
          </div>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              }`}
            >
              {message.text}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  ظاهر برنامه
                </label>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {theme === 'light' ? (
                      <Sun className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-blue-400" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {theme === 'light' ? 'حالت روشن' : 'حالت تاریک'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        تغییر پوسته رنگی برنامه
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:ring-offset-2 bg-slate-900 dark:bg-slate-600"
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        theme === 'dark' ? '-translate-x-7' : '-translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telegram' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  توکن ربات تلگرام
                </label>
                <input
                  type="text"
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  dir="ltr"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  توکن ربات خود را از BotFather در تلگرام دریافت کنید
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  شناسه چت تلگرام
                </label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  placeholder="123456789"
                  dir="ltr"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  شناسه چت یا کانالی که اعلان‌ها باید به آن ارسال شود
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 space-x-reverse px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
