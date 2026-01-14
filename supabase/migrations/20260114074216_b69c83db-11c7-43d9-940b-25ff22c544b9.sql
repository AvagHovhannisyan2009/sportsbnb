-- Add RLS policy for owners to view their own venues (including inactive ones)
CREATE POLICY "Owners can view their own venues" 
ON public.venues 
FOR SELECT 
USING (auth.uid() = owner_id);