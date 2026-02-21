import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useWaitlist = (venueId?: string, date?: string, time?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["waitlist", venueId, date, time, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_waitlist")
        .select("*")
        .eq("venue_id", venueId!)
        .eq("booking_date", date!)
        .eq("booking_time", time!)
        .eq("user_id", user!.id)
        .eq("status", "waiting")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!venueId && !!date && !!time && !!user,
  });
};

export const useMyWaitlistEntries = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-waitlist", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_waitlist")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "waiting")
        .order("booking_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useJoinWaitlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { venueId: string; date: string; time: string; durationHours?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("booking_waitlist")
        .insert({
          user_id: user.id,
          venue_id: params.venueId,
          booking_date: params.date,
          booking_time: params.time,
          duration_hours: params.durationHours || 1,
          expires_at: new Date(new Date(params.date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      queryClient.invalidateQueries({ queryKey: ["my-waitlist"] });
    },
  });
};

export const useLeaveWaitlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (waitlistId: string) => {
      const { error } = await supabase
        .from("booking_waitlist")
        .delete()
        .eq("id", waitlistId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      queryClient.invalidateQueries({ queryKey: ["my-waitlist"] });
    },
  });
};
