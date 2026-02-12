-- Fix booking race condition: Add unique constraint to prevent double-booking
CREATE UNIQUE INDEX unique_venue_datetime_active 
ON bookings (venue_id, booking_date, booking_time) 
WHERE status IN ('confirmed', 'pending');