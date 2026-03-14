
-- RLS policies for field_submissions (admin management)
CREATE POLICY "Admins can view all field submissions" ON public.field_submissions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update field submissions" ON public.field_submissions
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete field submissions" ON public.field_submissions
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for public_fields
CREATE POLICY "Admins can insert public fields" ON public.public_fields
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update public fields" ON public.public_fields
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
