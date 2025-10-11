import { useState, useEffect } from 'react';
import { Tag, MapPin, Image, TrendingUp } from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';

interface Stats {
  totalCategories: number;
  totalPlaces: number;
  totalImages: number;
  recentPlaces: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCategories: 0,
    totalPlaces: 0,
    totalImages: 0,
    recentPlaces: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    const [categoriesRes, placesRes, imagesRes, recentRes] = await Promise.all([
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('places').select('id', { count: 'exact', head: true }),
      supabase.from('place_images').select('id', { count: 'exact', head: true }),
      supabase
        .from('places')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    setStats({
      totalCategories: categoriesRes.count || 0,
      totalPlaces: placesRes.count || 0,
      totalImages: imagesRes.count || 0,
      recentPlaces: recentRes.count || 0,
    });

    setLoading(false);
  };

  const statCards = [
    {
      name: 'Total Categories',
      value: stats.totalCategories,
      icon: Tag,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Places',
      value: stats.totalPlaces,
      icon: MapPin,
      color: 'bg-green-500',
    },
    {
      name: 'Total Images',
      value: stats.totalImages,
      icon: Image,
      color: 'bg-orange-500',
    },
    {
      name: 'New This Week',
      value: stats.recentPlaces,
      icon: TrendingUp,
      color: 'bg-pink-500',
    },
  ];

  return (
    <Layout currentPage="dashboard">
      <div className="px-4 sm:px-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.name}
                    className="bg-white overflow-hidden shadow rounded-lg"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {stat.name}
                            </dt>
                            <dd className="text-3xl font-semibold text-gray-900">
                              {stat.value}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <a
                  href="#categories"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <Tag className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Categories</p>
                    <p className="text-sm text-gray-500">Add or edit categories</p>
                  </div>
                </a>
                <a
                  href="#places"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                >
                  <MapPin className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Places</p>
                    <p className="text-sm text-gray-500">Add or edit places</p>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
