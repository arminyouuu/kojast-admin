import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { DashboardStats } from '../types';
import { FolderTree, MapPin, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await api.dashboard.getStats();
      setStats(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-medium mb-1">Total Categories</p>
              <p className="text-4xl font-bold">{stats?.totalCategories || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <FolderTree className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Total Places</p>
              <p className="text-4xl font-bold">{stats?.totalPlaces || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <MapPin className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Recent Places</h3>
        </div>

        {stats?.recentPlaces && stats.recentPlaces.length > 0 ? (
          <div className="space-y-3">
            {stats.recentPlaces.map((place) => (
              <div
                key={place.id}
                className="flex items-start justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{place.name}</h4>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-1">{place.description}</p>
                  <p className="text-xs text-slate-500 mt-1">{place.address}</p>
                </div>
                <div className="ml-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-700">
                    {place.category?.name || 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p>No places yet. Start by creating some!</p>
          </div>
        )}
      </div>
    </div>
  );
}
