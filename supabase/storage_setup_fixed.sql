-- Run this in the Supabase SQL Editor as an administrator
-- This script creates the necessary storage buckets and sets up proper RLS policies

-- First, enable the storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- Create the 'profiles' bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,  -- public bucket
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[] -- allowed mime types
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[];

-- Create the 'uploads' bucket for general file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'uploads',
  'uploads',
  true,  -- public bucket
  10485760 -- 10MB file size limit
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public uploads are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

-- Set up RLS (Row Level Security) policies for the profiles bucket

-- Allow anyone to view profiles bucket objects (since the bucket is public)
CREATE POLICY "Public profiles are viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profiles');

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own profile images" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = SUBSTRING(storage.filename(name), 1, POSITION('-' IN storage.filename(name)) - 1)
);

-- Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = SUBSTRING(storage.filename(name), 1, POSITION('-' IN storage.filename(name)) - 1)
);

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images" 
ON storage.objects FOR DELETE 
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = SUBSTRING(storage.filename(name), 1, POSITION('-' IN storage.filename(name)) - 1)
);

-- Set up RLS policies for the uploads bucket

-- Allow anyone to view uploads bucket objects (since the bucket is public)
CREATE POLICY "Public uploads are viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'uploads');

-- Allow authenticated users to upload files to the uploads bucket
CREATE POLICY "Authenticated users can upload files" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own uploads" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] != 'system' -- Prevent updates to system folders
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own uploads" 
ON storage.objects FOR DELETE 
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] != 'system' -- Prevent deletion from system folders
);

-- Create a special policy to allow service role to manage all objects
-- This is useful for server-side operations
CREATE POLICY "Service role can manage all objects"
ON storage.objects
TO service_role
USING (true)
WITH CHECK (true);

-- Add a comment explaining the storage setup
COMMENT ON TABLE storage.buckets IS 'Storage buckets for the application:
- profiles: For user avatars and profile images
- uploads: For general file uploads by users';

-- Create necessary folders
-- Note: This is done by inserting empty objects with directory content type
INSERT INTO storage.objects (bucket_id, name, owner, created_at, updated_at, metadata, content_type)
VALUES 
  ('profiles', 'avatars/.folder', auth.uid(), now(), now(), '{}', 'application/x-directory'),
  ('uploads', 'temp/.folder', auth.uid(), now(), now(), '{}', 'application/x-directory')
ON CONFLICT (bucket_id, name) DO NOTHING; 