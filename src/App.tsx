import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Router } from './components/Router';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import DashboardPage from './components/DashboardPage';
import CategoriesPage from './components/CategoriesPage';
import PlacesPage from './components/PlacesPage';
import BannersPage from './components/BannersPage';
import RatingsModerationPage from './components/RatingsModerationPage';
import UsersPage from './components/UsersPage';
import ApiKeysPage from './components/ApiKeysPage';
import SettingsPage from './components/SettingsPage';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100"></div>
      </div>
    );
  }

  if (!user?.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Router>
      {(currentPath, navigate) => (
        <Layout currentPath={currentPath} onNavigate={navigate}>
          {currentPath === '/' && <DashboardPage />}
          {currentPath === '/categories' && <CategoriesPage />}
          {currentPath === '/places' && <PlacesPage />}
          {currentPath === '/banners' && <BannersPage />}
          {currentPath === '/ratings' && <RatingsModerationPage />}
          {currentPath === '/users' && <UsersPage />}
          {currentPath === '/api-keys' && <ApiKeysPage />}
          {currentPath === '/settings' && <SettingsPage />}
        </Layout>
      )}
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
