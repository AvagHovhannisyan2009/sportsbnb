-- Create storage bucket for venue images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('venue-images', 'venue-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload venue images
CREATE POLICY "Venue owners can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'venue-images');

-- Allow anyone to view venue images (public bucket)
CREATE POLICY "Anyone can view venue images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'venue-images');

-- Allow owners to update their venue images
CREATE POLICY "Venue owners can update their images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'venue-images');

-- Allow owners to delete their venue images
CREATE POLICY "Venue owners can delete their images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'venue-images');