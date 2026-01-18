import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VenuePolicy {
  id: string;
  venue_id: string;
  cancellation_policy: string;
  cancellation_hours: number;
  refund_type: string;
  min_duration_hours: number;
  max_duration_hours: number;
  time_slot_increment: number;
  booking_window_days: number;
  buffer_minutes: number;
  grace_period_minutes: number;
  venue_rules: string | null;
  checkin_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export const useVenuePolicy = (venueId: string | undefined) => {
  return useQuery({
    queryKey: ["venue-policy", venueId],
    queryFn: async () => {
      if (!venueId) return null;

      const { data, error } = await supabase
        .from("venue_policies")
        .select("*")
        .eq("venue_id", venueId)
        .maybeSingle();

      if (error) throw error;
      return data as VenuePolicy | null;
    },
    enabled: !!venueId,
  });
};

export const useSaveVenuePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      venueId,
      policy,
    }: {
      venueId: string;
      policy: Partial<VenuePolicy>;
    }) => {
      // Check if policy exists
      const { data: existing } = await supabase
        .from("venue_policies")
        .select("id")
        .eq("venue_id", venueId)
        .maybeSingle();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from("venue_policies")
          .update(policy)
          .eq("venue_id", venueId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from("venue_policies")
          .insert({ venue_id: venueId, ...policy })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["venue-policy", variables.venueId] });
    },
  });
};
