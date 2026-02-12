import { Link } from "react-router-dom";
import { Users, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Team } from "@/hooks/useTeams";

interface TeamCardProps {
  team: Team;
  showRole?: string;
}

const TeamCard = ({ team, showRole }: TeamCardProps) => {
  return (
    <Link to={`/team/${team.id}`}>
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src={team.logo_url || undefined} className="object-cover" />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-lg">
                {team.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{team.name}</h3>
                {team.visibility === "private" && (
                  <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{team.sport}</Badge>
                {showRole && (
                  <Badge variant="outline" className="text-xs capitalize">{showRole}</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{team.member_count ?? "—"}/{team.team_size} players</span>
              </div>
            </div>
          </div>
          {team.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{team.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default TeamCard;
