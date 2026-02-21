import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PlayerStats {
  games_played: number;
  games_hosted: number;
  total_bookings: number;
  sports_played: string[];
  member_since: string | null;
  referral_credits: number;
}

export const usePlayerStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase.rpc("get_player_stats", {
          p_user_id: user.id,
        });

        if (error) throw error;
        setStats(data as unknown as PlayerStats);
      } catch (error) {
        console.error("Error fetching player stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, isLoading };
};
