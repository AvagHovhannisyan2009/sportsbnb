import { Trophy, Target, Calendar, Dumbbell, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { format } from "date-fns";

const PlayerStatsCard = () => {
  const { stats, isLoading } = usePlayerStats();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const statItems = [
    { icon: Trophy, label: "Games Played", value: stats.games_played, color: "text-amber-500" },
    { icon: Target, label: "Games Hosted", value: stats.games_hosted, color: "text-primary" },
    { icon: Calendar, label: "Total Bookings", value: stats.total_bookings, color: "text-emerald-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          Player Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {statItems.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center">
              <Icon className={`h-6 w-6 mx-auto mb-1 ${color}`} />
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {stats.sports_played && stats.sports_played.length > 0 && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Sports Played</div>
            <div className="flex flex-wrap gap-1.5">
              {stats.sports_played.map((sport) => (
                <Badge key={sport} variant="secondary" className="text-xs">
                  {sport}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {stats.member_since && (
          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            Member since {format(new Date(stats.member_since), "MMMM yyyy")}
          </div>
        )}

        {stats.referral_credits > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Referral Credits</span>
            <Badge variant="default">֏{stats.referral_credits.toLocaleString()}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerStatsCard;
