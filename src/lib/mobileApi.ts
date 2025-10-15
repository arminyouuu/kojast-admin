import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface MobileAuthResponse {
  user: User | null;
  session: any;
  error: string | null;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  place_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
  place?: {
    id: string;
    name: string;
    description: string;
    address: string;
    category_id: string | null;
    latitude: number | null;
    longitude: number | null;
    images: Array<{ id: string; image_url: string; display_order: number }>;
    category?: { id: string; name: string };
  };
}

export const mobileApi = {
  auth: {
    signUp: async (email: string, password: string): Promise<MobileAuthResponse> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      return {
        user: data.user,
        session: data.session,
        error: error?.message || null,
      };
    },

    signIn: async (email: string, password: string): Promise<MobileAuthResponse> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        user: data.user,
        session: data.session,
        error: error?.message || null,
      };
    },

    signOut: async (): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    },

    getCurrentUser: async (): Promise<User | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },

    resetPassword: async (email: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error?.message || null };
    },

    updatePassword: async (newPassword: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error: error?.message || null };
    },
  },

  places: {
    getAll: async (params?: { categoryId?: string; page?: number; limit?: number }) => {
      let query = supabase
        .from('places')
        .select(`
          *,
          category:categories(id, name),
          images:place_images(id, image_url, display_order)
        `)
        .order('created_at', { ascending: false });

      if (params?.categoryId) {
        query = query.eq('category_id', params.categoryId);
      }

      const limit = params?.limit || 10;
      const page = params?.page || 1;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          category:categories(id, name),
          images:place_images(id, image_url, display_order)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    search: async (searchTerm: string) => {
      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          category:categories(id, name),
          images:place_images(id, image_url, display_order)
        `)
        .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  },

  categories: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  },

  favorites: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          *,
          place:places(
            *,
            category:categories(id, name),
            images:place_images(id, image_url, display_order)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as UserFavorite[];
    },

    add: async (placeId: string, notes?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          place_id: placeId,
          notes: notes || '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    remove: async (placeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', placeId);

      if (error) throw error;
    },

    updateNotes: async (placeId: string, notes: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_favorites')
        .update({ notes })
        .eq('user_id', user.id)
        .eq('place_id', placeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    isFavorite: async (placeId: string): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('place_id', placeId)
        .maybeSingle();

      if (error) return false;
      return !!data;
    },
  },
};
