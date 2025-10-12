import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FolderTree, MapPin, Key } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: 'dashboard' | 'categories' | 'places' | 'api-keys';
  onNavigate: (page: 'dashboard' | 'categories' | 'places' | 'api-keys') => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'categories' as const, label: 'Categories', icon: FolderTree },
    { id: 'places' as const, label: 'Places', icon: MapPin },
    { id: 'api-keys' as const, label: 'API Keys', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-slate-900">Kojast Admin</h1>
              <div className="hidden md:flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        currentPage === item.id
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, <span className="font-semibold">{user?.username}</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
