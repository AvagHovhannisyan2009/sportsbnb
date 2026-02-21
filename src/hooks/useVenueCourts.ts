import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVenueCourts = (venueId?: string) => {
  return useQuery({
    queryKey: ["venue-courts", venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venue_courts")
        .select("*")
        .eq("venue_id", venueId!)
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!venueId,
  });
};

export const useAddCourt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { venueId: string; name: string; sport?: string; pricePerHour?: number }) => {
      const { data, error } = await supabase
        .from("venue_courts")
        .insert({
          venue_id: params.venueId,
          name: params.name,
          sport: params.sport,
          price_per_hour: params.pricePerHour,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["venue-courts", vars.venueId] });
    },
  });
};

export const useDeleteCourt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { courtId: string; venueId: string }) => {
      const { error } = await supabase
        .from("venue_courts")
        .update({ is_active: false })
        .eq("id", params.courtId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["venue-courts", vars.venueId] });
    },
  });
};
