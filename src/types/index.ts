export interface Category {
  id: number;
  name: string;
}

export interface Place {
  id: number;
  name: string;
  description: string;
  address: string;
  categoryId: number;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  images?: PlaceImage[];
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
