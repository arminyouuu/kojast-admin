import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ActivityLog } from '../types';
import { Activity, Filter, RefreshCw } from 'lucide-react';

export default function ActivityLogsSection() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 20;

  useEffect(() => {
    loadLogs();
  }, [page, filter]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * logsPerPage, page * logsPerPage - 1);

      if (filter !== 'all') {
        query = query.eq('resource_type', filter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setLogs(data || []);
      setTotalPages(Math.ceil((count || 0) / logsPerPage));
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('insert')) return 'bg-green-100 text-green-800';
    if (action.includes('update')) return 'bg-blue-100 text-blue-800';
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-800';
  };

  const getResourceIcon = (resourceType: string | null) => {
    const iconClass = "w-4 h-4";
    switch (resourceType) {
      case 'place': return <span className={iconClass}>📍</span>;
      case 'category': return <span className={iconClass}>📁</span>;
      case 'api_key': return <span className={iconClass}>🔑</span>;
      default: return <span className={iconClass}>📋</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-slate-900" />
          <h3 className="text-xl font-bold text-slate-900">Activity Logs</h3>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="all">All Activities</option>
              <option value="place">Places</option>
              <option value="category">Categories</option>
              <option value="api_key">API Keys</option>
            </select>
          </div>
          <button
            onClick={loadLogs}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <Activity className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600">No activity logs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    {getResourceIcon(log.resource_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      {log.resource_type && (
                        <span className="text-xs text-slate-600">
                          {log.resource_type}
                        </span>
                      )}
                    </div>
                    {log.resource_id && (
                      <p className="text-sm text-slate-600 mb-1">
                        Resource ID: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">{log.resource_id}</code>
                      </p>
                    )}
                    {log.ip_address && (
                      <p className="text-xs text-slate-500">
                        IP: {log.ip_address}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-slate-500">
                    {formatDate(log.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
