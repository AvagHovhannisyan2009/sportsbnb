DROP TRIGGER IF EXISTS on_profile_insert ON public.profiles;
DROP TRIGGER IF EXISTS on_booking_insert ON public.bookings;
DROP TRIGGER IF EXISTS on_venue_insert ON public.venues;
DROP TRIGGER IF EXISTS on_review_insert ON public.reviews;
DROP FUNCTION IF EXISTS public.notify_make_webhook();