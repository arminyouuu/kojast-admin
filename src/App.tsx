import { AuthProvider, useAuth } from './context/AuthContext';
import { Router } from './components/Router';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import DashboardPage from './components/DashboardPage';
import CategoriesPage from './components/CategoriesPage';
import PlacesPage from './components/PlacesPage';
import ApiKeysPage from './components/ApiKeysPage';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
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
          {currentPath === '/api-keys' && <ApiKeysPage />}
        </Layout>
      )}
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
