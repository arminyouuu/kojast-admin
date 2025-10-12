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
  recentPlaces: number;
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
