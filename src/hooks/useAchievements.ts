import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useAchievements = () => {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("requirement_value", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useUserAchievements = (userId?: string) => {
  return useQuery({
    queryKey: ["user-achievements", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("*, achievements(*)")
        .eq("user_id", userId!);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, xp, level, city")
        .gt("xp", 0)
        .order("xp", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
};

export const useCheckAndAwardAchievements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) return [];

      // Get player stats
      const { data: stats } = await supabase.rpc("get_player_stats", { p_user_id: user.id });
      if (!stats) return [];

      const parsedStats = typeof stats === "string" ? JSON.parse(stats) : stats;

      // Get all achievements
      const { data: achievements } = await supabase.from("achievements").select("*");
      if (!achievements) return [];

      // Get already earned
      const { data: earned } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);
      const earnedIds = new Set(earned?.map((e) => e.achievement_id) || []);

      const statMap: Record<string, number> = {
        bookings_made: parsedStats.total_bookings || 0,
        games_played: parsedStats.games_played || 0,
        games_hosted: parsedStats.games_hosted || 0,
        reviews_written: 0, // Will be fetched separately if needed
        referrals_made: 0,
      };

      // Check reviews count
      const { count: reviewCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      statMap.reviews_written = reviewCount || 0;

      // Check referrals
      const { count: refCount } = await supabase
        .from("referral_credits")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user.id);
      statMap.referrals_made = refCount || 0;

      const newlyEarned: any[] = [];

      for (const achievement of achievements) {
        if (earnedIds.has(achievement.id)) continue;
        const currentValue = statMap[achievement.requirement_type] || 0;
        if (currentValue >= achievement.requirement_value) {
          const { error } = await supabase.from("user_achievements").insert({
            user_id: user.id,
            achievement_id: achievement.id,
          });
          if (!error) {
            newlyEarned.push(achievement);
            // Add XP
            await supabase
              .from("profiles")
              .update({
                xp: (parsedStats.xp || 0) + achievement.xp_reward,
                level: Math.floor(((parsedStats.xp || 0) + achievement.xp_reward) / 100) + 1,
              })
              .eq("user_id", user.id);
          }
        }
      }

      return newlyEarned;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
};
