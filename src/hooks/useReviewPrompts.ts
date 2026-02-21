import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const usePendingReviewPrompts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["review-prompts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_prompts")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "pending")
        .lte("prompt_after", new Date().toISOString())
        .order("prompt_after", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useDismissReviewPrompt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promptId: string) => {
      const { error } = await supabase
        .from("review_prompts")
        .update({ status: "dismissed" })
        .eq("id", promptId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-prompts"] });
    },
  });
};

export const useCompleteReviewPrompt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promptId: string) => {
      const { error } = await supabase
        .from("review_prompts")
        .update({ status: "completed" })
        .eq("id", promptId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-prompts"] });
    },
  });
};

export const useCreateReviewPrompt = () => {
  return useMutation({
    mutationFn: async (params: { userId: string; bookingId: string; venueId: string }) => {
      const promptAfter = new Date();
      promptAfter.setHours(promptAfter.getHours() + 24);

      const { error } = await supabase.from("review_prompts").insert({
        user_id: params.userId,
        booking_id: params.bookingId,
        venue_id: params.venueId,
        prompt_after: promptAfter.toISOString(),
      });
      if (error && !error.message.includes("duplicate")) throw error;
    },
  });
};
