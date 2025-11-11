export interface Category {
  id: number;
  name: string;
  is_enabled?: boolean;
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
  expiration_date: string | null;
  expirationDate?: string | null;
  website?: string | null;
  instagram?: string | null;
  phone_number?: string | null;
  phoneNumber?: string | null;
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
  total?: number;
  page?: number;
  pages?: number;
  limit?: number;
  meta?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
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
  placesExpiringSoon: Place[];
  categoriesWithPlaceCounts: Array<{
    id: number;
    name: string;
    count: number;
  }>;
  placesCreatedThisMonth: number;
  pendingRatingsCount: number;
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

export interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: number;
  title: string | null;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
