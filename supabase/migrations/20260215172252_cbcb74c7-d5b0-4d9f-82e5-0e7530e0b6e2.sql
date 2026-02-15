
-- Fix profiles RLS: admin and deny-anon SELECT policies should be PERMISSIVE, not RESTRICTIVE
-- Currently all SELECT policies are RESTRICTIVE (AND logic), which means non-admin users
-- fail the admin check. We need permissive (OR logic) for SELECT policies.

-- Drop the problematic restrictive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate as PERMISSIVE (default) so they use OR logic
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
