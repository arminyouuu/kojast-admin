/*
  # User Favorites Feature

  1. New Tables
    - `user_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, reference to auth.users) - The user who favorited
      - `place_id` (uuid, reference to places) - The place that was favorited
      - `notes` (text) - Optional personal notes about the place
      - `created_at` (timestamptz) - When it was favorited
      - `updated_at` (timestamptz) - Last modification time

  2. Security
    - Enable RLS on user_favorites table
    - Users can only view, create, update, and delete their own favorites
    - Ensures complete privacy of user favorite lists

  3. Indexes
    - Unique constraint on (user_id, place_id) to prevent duplicate favorites
    - Index on user_id for filtering user's favorites
    - Index on place_id for analytics
    - Index on created_at for sorting

  4. Important Notes
    - Users must be authenticated to favorite places
    - Cascading deletes ensure data integrity when users or places are removed
    - Personal notes allow users to remember why they saved a place
    - This supports the mobile app feature for managing favorite places
*/

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, place_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_place_id ON user_favorites(place_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can add their own favorites
CREATE POLICY "Users can create own favorites"
  ON user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own favorites
CREATE POLICY "Users can update own favorites"
  ON user_favorites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_favorites_updated_at'
  ) THEN
    CREATE TRIGGER update_user_favorites_updated_at BEFORE UPDATE ON user_favorites
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
