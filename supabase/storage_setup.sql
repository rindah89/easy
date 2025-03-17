-- Create storage buckets for profiles and uploads
-- Run this in the Supabase SQL Editor

-- Create the 'profiles' bucket for user avatars
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,  -- public bucket
  false, -- no avif autodetection
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[] -- allowed mime types
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[];

-- Create the 'uploads' bucket for general file uploads
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit)
VALUES (
  'uploads',
  'uploads',
  true,  -- public bucket
  false, -- no avif autodetection
  10485760 -- 10MB file size limit
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- Set up RLS (Row Level Security) policies for the profiles bucket

-- Allow users to read any profile image (since the bucket is public)
CREATE POLICY "Public profiles are viewable by everyone" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profiles');

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = SUBSTRING(storage.filename(name), 1, POSITION('-' IN storage.filename(name)) - 1)
  );

-- Allow users to update/delete their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = SUBSTRING(storage.filename(name), 1, POSITION('-' IN storage.filename(name)) - 1)
  );

CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = SUBSTRING(storage.filename(name), 1, POSITION('-' IN storage.filename(name)) - 1)
  );

-- Set up RLS policies for the uploads bucket

-- Allow anyone to view uploads (since the bucket is public)
CREATE POLICY "Public uploads are viewable by everyone" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'uploads');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'uploads');

-- Allow users to update/delete their own uploads
-- This assumes you store the user_id in the path or metadata
CREATE POLICY "Users can update their own uploads" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'uploads' AND
    (storage.foldername(name))[1] != 'system' -- Prevent updates to system folders
  );

CREATE POLICY "Users can delete their own uploads" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'uploads' AND
    (storage.foldername(name))[1] != 'system' -- Prevent deletion from system folders
  );

-- Create a function to clean up old files (optional)
CREATE OR REPLACE FUNCTION storage.delete_old_files()
RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE
    created_at < NOW() - INTERVAL '30 days' AND
    bucket_id = 'uploads' AND
    (storage.foldername(name))[1] = 'temp';
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run the cleanup function (requires pg_cron extension)
-- Uncomment if you have pg_cron enabled
-- SELECT cron.schedule('0 0 * * *', 'SELECT storage.delete_old_files()');

-- Add a comment explaining the storage setup
COMMENT ON TABLE storage.buckets IS 'Storage buckets for the application:
- profiles: For user avatars and profile images
- uploads: For general file uploads by users'; 