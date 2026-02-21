import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useGameMatchmaking = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["game-matchmaking", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-game-matchmaking", {
        body: { userId: user!.id },
      });
      if (error) throw error;
      return data?.matches || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};
