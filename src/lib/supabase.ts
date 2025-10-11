import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Place = {
  id: string;
  name: string;
  description: string;
  address: string;
  category_id: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
};

export type PlaceImage = {
  id: string;
  place_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
};

export type PlaceWithImages = Place & {
  images: PlaceImage[];
  category?: Category;
};
