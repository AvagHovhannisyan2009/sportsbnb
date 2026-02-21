import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RecurringBooking {
  id: string;
  user_id: string;
  venue_id: string;
  venue_name: string;
  day_of_week: number;
  booking_time: string;
  duration_hours: number;
  total_price: number;
  recurrence_type: "weekly" | "biweekly" | "monthly";
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  team_id: string | null;
  notes: string | null;
  created_at: string;
}

export const useRecurringBookings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["recurring-bookings", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("recurring_bookings" as any)
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as RecurringBooking[];
    },
    enabled: !!userId,
  });
};

export const useCreateRecurringBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (booking: Omit<RecurringBooking, "id" | "created_at" | "is_active">) => {
      const { data, error } = await supabase
        .from("recurring_bookings" as any)
        .insert(booking as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring-bookings"] });
      toast.success("Recurring booking created!");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });
};

export const useCancelRecurringBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("recurring_bookings" as any)
        .update({ is_active: false } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring-bookings"] });
      toast.success("Recurring booking cancelled");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });
};

export const DAYS_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
