export interface Category {
  id: number;
  name: string;
}

export interface Place {
  id: number;
  name: string;
  description: string;
  address: string;
  category_id: number;
  categoryId?: number;
  category_name?: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
  category?: Category;
}

export interface PlaceImage {
  id: number;
  placeId: number;
  imageUrl: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
  credentials?: string;
}

export interface DashboardStats {
  totalCategories: number;
  totalPlaces: number;
  recentPlaces: Place[];
  totalApiKeys?: number;
  totalActivityLogs?: number;
  recentActivity?: ActivityLog[];
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  user_id: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  permissions: {
    read: boolean;
    write: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  api_key_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SystemSetting {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}
