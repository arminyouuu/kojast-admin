import { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FolderTree, MapPin, Key, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Layout({ children, currentPath, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'داشبورد', icon: LayoutDashboard },
    { path: '/categories', label: 'دسته‌بندی‌ها', icon: FolderTree },
    { path: '/places', label: 'مکان‌ها', icon: MapPin },
    { path: '/api-keys', label: 'کلیدهای API', icon: Key },
  ];

  const handleNavigate = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-screen">
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 flex-shrink-0">
            <h1 className="text-xl font-bold text-slate-900">پنل مدیریت کجاست</h1>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center space-x-2 space-x-reverse min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.username}</p>
                  <p className="text-xs text-slate-500">مدیر</p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 space-x-reverse px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 lg:mr-64">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-4"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
