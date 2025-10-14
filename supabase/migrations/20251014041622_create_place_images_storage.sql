/*
  # Create Storage Bucket for Place Images

  1. Storage Setup
    - Create a public bucket called `place-images` for storing uploaded images
    - Set up public access policies for reading images
    - Restrict uploads to authenticated users only

  2. Security
    - Public read access to all images in the bucket
    - Authenticated users can upload images
    - Authenticated users can delete images

  3. Storage Policies
    - Anyone can view/download images (public bucket)
    - Only authenticated users can upload
    - Only authenticated users can delete

  4. Important Notes
    - Images will be publicly accessible via URLs
    - Bucket has size limits as per Supabase plan
    - Files should be organized by place ID for easier management
*/

-- Create storage bucket for place images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'place-images',
  'place-images',
  true,
  10485760, -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Enable public access for viewing images
CREATE POLICY "Public can view place images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'place-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload place images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'place-images');

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update place images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'place-images')
  WITH CHECK (bucket_id = 'place-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete place images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'place-images');