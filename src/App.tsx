import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import DashboardPage from './components/DashboardPage';
import CategoriesPage from './components/CategoriesPage';
import PlacesPage from './components/PlacesPage';
import ApiKeysPage from './components/ApiKeysPage';

type Page = 'dashboard' | 'categories' | 'places' | 'api-keys';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

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
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'categories' && <CategoriesPage />}
      {currentPage === 'places' && <PlacesPage />}
      {currentPage === 'api-keys' && <ApiKeysPage />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
