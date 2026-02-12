-- Add payment_intent_id column to bookings table for refund processing
ALTER TABLE public.bookings 
ADD COLUMN payment_intent_id text;