import type { Category, Place, PaginatedResponse, DashboardStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAuthHeaders(): HeadersInit {
  const credentials = localStorage.getItem('admin_credentials');
  if (credentials) {
    return {
      'Authorization': `Basic ${credentials}`,
    };
  }
  return {};
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeaders = endpoint.startsWith('/admin') && !endpoint.includes('/login')
    ? getAuthHeaders()
    : {};

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      fetchApi<{ success: boolean; message: string }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
  },

  categories: {
    getAll: () => fetchApi<Category[]>('/categories'),
    getById: (id: string) => fetchApi<Category>(`/categories/${id}`),
    create: (name: string) =>
      fetchApi<Category>('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    update: (id: string, name: string) =>
      fetchApi<Category>(`/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/admin/categories/${id}`, {
        method: 'DELETE',
      }),
  },

  places: {
    getAll: (params?: { categoryId?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.categoryId) query.append('categoryId', params.categoryId.toString());
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      return fetchApi<PaginatedResponse<Place>>(`/places?${query.toString()}`);
    },
    getById: (id: string) => fetchApi<Place>(`/places/${id}`),
    create: (data: Omit<Place, 'id' | 'created_at' | 'updated_at'> & { images: string[] }) =>
      fetchApi<Place>('/admin/places', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Omit<Place, 'id' | 'created_at' | 'updated_at'>> & { images?: string[] }) =>
      fetchApi<Place>(`/admin/places/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/admin/places/${id}`, {
        method: 'DELETE',
      }),
  },

  dashboard: {
    getStats: () => fetchApi<DashboardStats>('/admin/dashboard/stats'),
  },

  apiKeys: {
    getAll: () => fetchApi<import('../types').ApiKey[]>('/admin/api-keys'),
    create: (name: string, permissions: { read: boolean; write: boolean }) =>
      fetchApi<import('../types').ApiKey>('/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name, permissions }),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/admin/api-keys/${id}`, {
        method: 'DELETE',
      }),
    toggle: (id: string, isActive: boolean) =>
      fetchApi<import('../types').ApiKey>(`/admin/api-keys/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),
  },

  activityLogs: {
    getAll: (params?: { page?: number; limit?: number; resourceType?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.resourceType) query.append('resourceType', params.resourceType);
      return fetchApi<{
        data: import('../types').ActivityLog[];
        total: number;
        page: number;
        pages: number;
      }>(`/admin/activity-logs?${query.toString()}`);
    },
    create: (data: {
      action: string;
      resourceType?: string;
      resourceId?: string;
      metadata?: Record<string, unknown>;
    }) =>
      fetchApi<import('../types').ActivityLog>('/admin/activity-logs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  systemSettings: {
    getAll: () => fetchApi<import('../types').SystemSetting[]>('/admin/settings'),
    update: (key: string, value: unknown) =>
      fetchApi<import('../types').SystemSetting>(`/admin/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      }),
    updateBulk: (settings: Record<string, unknown>) =>
      fetchApi<void>('/admin/settings/bulk', {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      }),
  },
};
