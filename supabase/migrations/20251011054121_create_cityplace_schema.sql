/*
  # CityPlace Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `places`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `address` (text, not null)
      - `category_id` (uuid, foreign key)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `place_images`
      - `id` (uuid, primary key)
      - `place_id` (uuid, foreign key)
      - `image_url` (text, not null)
      - `display_order` (integer, for ordering images in gallery)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for categories, places, and place_images
    - Admin-only write access (to be configured separately)

  3. Indexes
    - Index on places.category_id for filtering
    - Index on place_images.place_id for efficient joins
    - Index on places.created_at for pagination

  4. Important Notes
    - All IDs use UUID for better scalability
    - Timestamps track creation and modification times
    - Coordinates stored as numeric for precision
    - Images have display_order for gallery presentation
    - Cascading deletes ensure referential integrity
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create places table
CREATE TABLE IF NOT EXISTS places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  address text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create place_images table
CREATE TABLE IF NOT EXISTS place_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_places_category_id ON places(category_id);
CREATE INDEX IF NOT EXISTS idx_places_created_at ON places(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_place_images_place_id ON place_images(place_id);
CREATE INDEX IF NOT EXISTS idx_place_images_order ON place_images(place_id, display_order);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_images ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view places"
  ON places FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view place images"
  ON place_images FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write policies (authenticated users can perform admin operations)
-- In production, you would add more specific role checks
CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert places"
  ON places FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update places"
  ON places FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete places"
  ON places FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert place images"
  ON place_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update place images"
  ON place_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete place images"
  ON place_images FOR DELETE
  TO authenticated
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();