-- Drop the existing unique constraint on username
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Create a partial unique index that only applies to non-null, non-empty usernames
CREATE UNIQUE INDEX profiles_username_unique_idx ON public.profiles (username) 
WHERE username IS NOT NULL AND username != '';