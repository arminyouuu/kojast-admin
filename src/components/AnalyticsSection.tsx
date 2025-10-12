import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Users, MapPin, FolderTree, Key, Activity } from 'lucide-react';

interface AnalyticsData {
  totalPlaces: number;
  totalCategories: number;
  totalApiKeys: number;
  totalActivityToday: number;
  placesThisWeek: number;
  placesThisMonth: number;
  activeApiKeys: number;
  categoriesWithPlaces: number;
}

export default function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        { count: totalPlaces },
        { count: totalCategories },
        { count: totalApiKeys },
        { count: totalActivityToday },
        { count: placesThisWeek },
        { count: placesThisMonth },
        { count: activeApiKeys },
        { data: categoriesData }
      ] = await Promise.all([
        supabase.from('places').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('api_keys').select('*', { count: 'exact', head: true }),
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay),
        supabase.from('places').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek),
        supabase.from('places').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
        supabase.from('api_keys').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('categories').select('id, name').then(async (result) => {
          if (result.error || !result.data) return { data: [] };
          const categoriesWithPlaces = await Promise.all(
            result.data.map(async (cat) => {
              const { count } = await supabase
                .from('places')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', cat.id);
              return count && count > 0 ? 1 : 0;
            })
          );
          return { data: categoriesWithPlaces };
        })
      ]);

      const categoriesWithPlacesCount = categoriesData?.reduce((sum, val) => sum + val, 0) || 0;

      setAnalytics({
        totalPlaces: totalPlaces || 0,
        totalCategories: totalCategories || 0,
        totalApiKeys: totalApiKeys || 0,
        totalActivityToday: totalActivityToday || 0,
        placesThisWeek: placesThisWeek || 0,
        placesThisMonth: placesThisMonth || 0,
        activeApiKeys: activeApiKeys || 0,
        categoriesWithPlaces: categoriesWithPlacesCount
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
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

  if (!analytics) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl">
        <p className="text-slate-600">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="w-6 h-6 text-slate-900" />
        <h3 className="text-xl font-bold text-slate-900">Analytics Overview</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Places</p>
              <p className="text-4xl font-bold">{analytics.totalPlaces}</p>
              <p className="text-blue-100 text-xs mt-2">
                +{analytics.placesThisMonth} this month
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <MapPin className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Categories</p>
              <p className="text-4xl font-bold">{analytics.totalCategories}</p>
              <p className="text-emerald-100 text-xs mt-2">
                {analytics.categoriesWithPlaces} with places
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <FolderTree className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-amber-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">API Keys</p>
              <p className="text-4xl font-bold">{analytics.totalApiKeys}</p>
              <p className="text-amber-100 text-xs mt-2">
                {analytics.activeApiKeys} active
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <Key className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-medium mb-1">Activity Today</p>
              <p className="text-4xl font-bold">{analytics.totalActivityToday}</p>
              <p className="text-slate-300 text-xs mt-2">
                Actions logged
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <Activity className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-violet-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-sm font-medium mb-1">This Week</p>
              <p className="text-4xl font-bold">{analytics.placesThisWeek}</p>
              <p className="text-violet-100 text-xs mt-2">
                New places added
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-600 to-rose-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium mb-1">Avg. per Category</p>
              <p className="text-4xl font-bold">
                {analytics.totalCategories > 0
                  ? (analytics.totalPlaces / analytics.totalCategories).toFixed(1)
                  : '0'}
              </p>
              <p className="text-rose-100 text-xs mt-2">
                Places per category
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Growth Metrics</h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Weekly Growth</span>
                <span className="text-sm font-semibold text-slate-900">
                  {analytics.placesThisWeek} places
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (analytics.placesThisWeek / Math.max(analytics.totalPlaces, 1)) * 100)}%`
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Monthly Growth</span>
                <span className="text-sm font-semibold text-slate-900">
                  {analytics.placesThisMonth} places
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (analytics.placesThisMonth / Math.max(analytics.totalPlaces, 1)) * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h4 className="font-semibold text-slate-900 mb-4">System Health</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600">API Keys Active</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                {analytics.activeApiKeys}/{analytics.totalApiKeys}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600">Categories Utilized</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {analytics.categoriesWithPlaces}/{analytics.totalCategories}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600">Daily Activity</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full">
                {analytics.totalActivityToday} actions
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
