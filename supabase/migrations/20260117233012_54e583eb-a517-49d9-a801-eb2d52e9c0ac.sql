-- Fix 1: Add explicit policy denying anonymous access to profiles table
-- This ensures that only authenticated users can access profile data
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix 2: Secure venue-images storage bucket with ownership-based policies
-- Drop existing insecure policies
DROP POLICY IF EXISTS "Venue owners can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Venue owners can update their images" ON storage.objects;
DROP POLICY IF EXISTS "Venue owners can delete their images" ON storage.objects;

-- Create secure policies with ownership checks based on folder structure
CREATE POLICY "Users can upload their own venue images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'venue-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own venue images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'venue-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own venue images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'venue-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);