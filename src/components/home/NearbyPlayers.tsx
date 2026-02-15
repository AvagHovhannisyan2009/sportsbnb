import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Users, Loader2 } from "lucide-react";

const fakePlayers = [
  { name: "Arman K.", sport: "Football", distance: "0.2 km", avatar: null, initials: "AK", level: "Intermediate" },
  { name: "Lusine M.", sport: "Tennis", distance: "0.4 km", avatar: null, initials: "LM", level: "Advanced" },
  { name: "Davit S.", sport: "Basketball", distance: "0.5 km", avatar: null, initials: "DS", level: "Beginner" },
  { name: "Ani G.", sport: "Swimming", distance: "0.6 km", avatar: null, initials: "AG", level: "Intermediate" },
  { name: "Tigran H.", sport: "Football", distance: "0.7 km", avatar: null, initials: "TH", level: "Advanced" },
  { name: "Mariam V.", sport: "Tennis", distance: "0.8 km", avatar: null, initials: "MV", level: "Beginner" },
  { name: "Hayk R.", sport: "Basketball", distance: "0.9 km", avatar: null, initials: "HR", level: "Intermediate" },
];

const NearbyPlayers = () => {
  const [state, setState] = useState<"idle" | "loading" | "loaded">("idle");

  const handleFind = () => {
    setState("loading");
    const delay = 1000 + Math.random() * 1000; // 1-2 seconds
    setTimeout(() => setState("loaded"), delay);
  };

  return (
    <div className="text-center">
      {state === "idle" && (
        <Button
          size="lg"
          variant="outline"
          className="h-14 px-10 text-base rounded-xl gap-2"
          onClick={handleFind}
        >
          <Users className="h-5 w-5" />
          Find people nearby
        </Button>
      )}

      {state === "loading" && (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Searching for players within 1 km...</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 bg-card border border-border/50 rounded-2xl p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {state === "loaded" && (
        <div className="space-y-6 animate-fade-in">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase">
            {fakePlayers.length} players found within 1 km
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
            onClick={() => setState("idle")}
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
