import type { Category, Place, PaginatedResponse, DashboardStats, ApiKey, Setting, Banner } from '../types';

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
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  put: <T>(endpoint: string, data?: any) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  auth: {
    login: (username: string, password: string) =>
      fetchApi<{ success: boolean; message: string }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
  },

  categories: {
    getAll: () => fetchApi<Category[]>('/admin/categories'),
    getById: (id: string) => fetchApi<Category>(`/admin/categories/${id}`),
    create: (name: string) =>
      fetchApi<Category>('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    update: (id: string, data: { name?: string; is_enabled?: boolean }) =>
      fetchApi<Category>(`/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/admin/categories/${id}`, {
        method: 'DELETE',
      }),
    bulkDelete: (ids: number[]) =>
      fetchApi<void>('/admin/categories/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
    toggleEnabled: (id: string, isEnabled: boolean) =>
      fetchApi<Category>(`/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_enabled: isEnabled }),
      }),
  },

  places: {
    getAll: (params?: { categoryId?: string; page?: number; limit?: number; expired?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.categoryId) query.append('categoryId', params.categoryId.toString());
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.expired !== undefined) query.append('expired', params.expired.toString());
      return fetchApi<PaginatedResponse<Place>>(`/admin/places?${query.toString()}`);
    },
    getById: (id: string) => fetchApi<Place>(`/admin/places/${id}`),
    uploadImages: async (files: File[]): Promise<{ urls: string[] }> => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const authHeaders = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/places/upload`, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new ApiError(response.status, error.message || 'Upload failed');
      }

      return response.json();
    },
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
    bulkDelete: (ids: number[]) =>
      fetchApi<void>('/admin/places/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
  },

  dashboard: {
    getStats: () => fetchApi<DashboardStats>('/admin/dashboard/stats'),
  },

  apiKeys: {
    getAll: () => fetchApi<ApiKey[]>('/admin/api-keys'),
    create: (name: string, permissions: { read: boolean; write: boolean }) =>
      fetchApi<ApiKey>('/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name, permissions }),
      }),
    update: (id: string, data: { name?: string; is_active?: boolean; permissions?: { read: boolean; write: boolean } }) =>
      fetchApi<ApiKey>(`/admin/api-keys/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/admin/api-keys/${id}`, {
        method: 'DELETE',
      }),
  },

  settings: {
    getAll: () => fetchApi<Setting[]>('/admin/settings'),
    get: (key: string) => fetchApi<Setting>(`/admin/settings/${key}`),
    set: (key: string, value: string) =>
      fetchApi<Setting>('/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ key, value }),
      }),
    delete: (key: string) =>
      fetchApi<void>(`/admin/settings/${key}`, {
        method: 'DELETE',
      }),
  },

  users: {
    create: (data: any) =>
      fetchApi<any>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchApi<any>(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/admin/users/${id}`, {
        method: 'DELETE',
      }),
    resetPassword: (id: string, password: string) =>
      fetchApi<void>(`/admin/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),
  },

  banners: {
    getAll: (activeOnly?: boolean) => {
      const query = activeOnly ? '?active=true' : '';
      return fetchApi<Banner[]>(`/banner${query}`);
    },
    getById: (id: string) => fetchApi<Banner>(`/banner/${id}`),
    create: async (file: File, data: { title?: string; link_url?: string; display_order?: number; is_active?: boolean }) => {
      const formData = new FormData();
      formData.append('image', file);
      if (data.title) formData.append('title', data.title);
      if (data.link_url) formData.append('link_url', data.link_url);
      if (data.display_order !== undefined) formData.append('display_order', data.display_order.toString());
      if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());

      const authHeaders = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/banner`, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Create failed' }));
        throw new ApiError(response.status, error.message || 'Create failed');
      }

      return response.json();
    },
    update: async (id: string, file: File | null, data: { title?: string; link_url?: string; display_order?: number; is_active?: boolean }) => {
      const formData = new FormData();
      if (file) formData.append('image', file);
      if (data.title !== undefined) formData.append('title', data.title);
      if (data.link_url !== undefined) formData.append('link_url', data.link_url);
      if (data.display_order !== undefined) formData.append('display_order', data.display_order.toString());
      if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());

      const authHeaders = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Update failed' }));
        throw new ApiError(response.status, error.message || 'Update failed');
      }

      return response.json();
    },
    delete: (id: string) =>
      fetchApi<void>(`/banners/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }),
  },
};
