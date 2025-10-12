import type { Category, Place, PaginatedResponse, DashboardStats } from '../types';

const API_BASE_URL = 'http://localhost:3000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message || 'Request failed');
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
    getById: (id: number) => fetchApi<Category>(`/categories/${id}`),
    create: (name: string) =>
      fetchApi<Category>('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    update: (id: number, name: string) =>
      fetchApi<Category>(`/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      }),
    delete: (id: number) =>
      fetchApi<void>(`/admin/categories/${id}`, {
        method: 'DELETE',
      }),
  },

  places: {
    getAll: (params?: { categoryId?: number; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.categoryId) query.append('categoryId', params.categoryId.toString());
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      return fetchApi<PaginatedResponse<Place>>(`/places?${query.toString()}`);
    },
    getById: (id: number) => fetchApi<Place>(`/places/${id}`),
    create: (data: Omit<Place, 'id' | 'createdAt' | 'updatedAt'> & { images: string[] }) =>
      fetchApi<Place>('/admin/places', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Omit<Place, 'id' | 'createdAt' | 'updatedAt'>> & { images?: string[] }) =>
      fetchApi<Place>(`/admin/places/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchApi<void>(`/admin/places/${id}`, {
        method: 'DELETE',
      }),
  },

  dashboard: {
    getStats: () => fetchApi<DashboardStats>('/admin/dashboard/stats'),
  },
};
