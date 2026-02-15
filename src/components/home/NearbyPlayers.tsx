import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Users } from "lucide-react";

const fakePlayers = [
  { name: "Arman K.", sport: "Football", distance: "0.3 km", avatar: null, initials: "AK", level: "Intermediate" },
  { name: "Lusine M.", sport: "Tennis", distance: "0.5 km", avatar: null, initials: "LM", level: "Advanced" },
  { name: "Davit S.", sport: "Basketball", distance: "0.8 km", avatar: null, initials: "DS", level: "Beginner" },
  { name: "Ani G.", sport: "Swimming", distance: "1.2 km", avatar: null, initials: "AG", level: "Intermediate" },
  { name: "Tigran H.", sport: "Football", distance: "1.5 km", avatar: null, initials: "TH", level: "Advanced" },
  { name: "Mariam V.", sport: "Tennis", distance: "2.0 km", avatar: null, initials: "MV", level: "Beginner" },
  { name: "Hayk R.", sport: "Basketball", distance: "2.3 km", avatar: null, initials: "HR", level: "Intermediate" },
];

const NearbyPlayers = () => {
  const [showPlayers, setShowPlayers] = useState(false);

  return (
    <div className="text-center">
      {!showPlayers ? (
        <Button
          size="lg"
          variant="outline"
          className="h-14 px-10 text-base rounded-xl gap-2"
          onClick={() => setShowPlayers(true)}
        >
          <Users className="h-5 w-5" />
          Find people nearby
        </Button>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase">
            {fakePlayers.length} players found near you
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {fakePlayers.map((player) => (
              <div
                key={player.name}
                className="flex items-center gap-4 bg-card border border-border/50 rounded-2xl p-4 hover:shadow-md transition-shadow"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={player.avatar ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {player.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-foreground truncate">{player.name}</p>
                  <p className="text-sm text-muted-foreground">{player.sport} · {player.level}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {player.distance}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPlayers(false)}
            className="text-muted-foreground"
          >
            Hide
          </Button>
        </div>
      )}
    </div>
  );
};

export default NearbyPlayers;
