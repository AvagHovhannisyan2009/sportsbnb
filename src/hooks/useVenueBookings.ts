import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VenueBooking {
  id: string;
  venue_id: string;
  venue_name: string;
  user_id: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  total_price: number;
  status: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  notes?: string;
  source: string;
  created_at: string;
}

export const useVenueBookings = (venueId: string | undefined) => {
  return useQuery({
    queryKey: ["venue-bookings", venueId],
    queryFn: async () => {
      if (!venueId) return [];

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("venue_id", venueId)
        .in("status", ["confirmed", "pending"])
        .order("booking_date", { ascending: true });

      if (error) throw error;
      return data as VenueBooking[];
    },
    enabled: !!venueId,
  });
};
