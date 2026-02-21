import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVenueImages = (venueId?: string) => {
  return useQuery({
    queryKey: ["venue-images", venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venue_images")
        .select("*")
        .eq("venue_id", venueId!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!venueId,
  });
};

export const useAddVenueImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { venueId: string; imageUrl: string; caption?: string; displayOrder?: number }) => {
      const { data, error } = await supabase
        .from("venue_images")
        .insert({
          venue_id: params.venueId,
          image_url: params.imageUrl,
          caption: params.caption,
          display_order: params.displayOrder || 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["venue-images", vars.venueId] });
    },
  });
};

export const useDeleteVenueImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { imageId: string; venueId: string }) => {
      const { error } = await supabase
        .from("venue_images")
        .delete()
        .eq("id", params.imageId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["venue-images", vars.venueId] });
    },
  });
};
