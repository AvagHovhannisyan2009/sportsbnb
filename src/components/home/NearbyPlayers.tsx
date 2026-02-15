import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Loader2, Filter } from "lucide-react";

const SPORTS = ["All", "Football", "Tennis", "Basketball", "Swimming"] as const;

const allFakePlayers = [
  // Football players (13)
  { name: "Arman K.", sport: "Football", distance: 0.2, initials: "AK", level: "Intermediate" },
  { name: "Tigran H.", sport: "Football", distance: 0.4, initials: "TH", level: "Advanced" },
  { name: "Gagik P.", sport: "Football", distance: 0.6, initials: "GP", level: "Beginner" },
  { name: "Narek B.", sport: "Football", distance: 0.8, initials: "NB", level: "Intermediate" },
  { name: "Suren A.", sport: "Football", distance: 1.0, initials: "SA", level: "Advanced" },
  { name: "Hovhannes L.", sport: "Football", distance: 1.2, initials: "HL", level: "Intermediate" },
  { name: "Vardan D.", sport: "Football", distance: 1.4, initials: "VD", level: "Beginner" },
  // Tennis players
  { name: "Lusine M.", sport: "Tennis", distance: 0.4, initials: "LM", level: "Advanced" },
  { name: "Mariam V.", sport: "Tennis", distance: 0.8, initials: "MV", level: "Beginner" },
  { name: "Nare H.", sport: "Tennis", distance: 0.6, initials: "NH", level: "Intermediate" },
  // Basketball players
  { name: "Davit S.", sport: "Basketball", distance: 0.5, initials: "DS", level: "Beginner" },
  { name: "Hayk R.", sport: "Basketball", distance: 0.9, initials: "HR", level: "Intermediate" },
  { name: "Erik N.", sport: "Basketball", distance: 0.3, initials: "EN", level: "Advanced" },
  // Swimming players
  { name: "Ani G.", sport: "Swimming", distance: 0.6, initials: "AG", level: "Intermediate" },
  { name: "Lilit P.", sport: "Swimming", distance: 0.7, initials: "LP", level: "Advanced" },
];

const NearbyPlayers = () => {
  const [state, setState] = useState<"idle" | "loading" | "loaded">("idle");
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [filteredPlayers, setFilteredPlayers] = useState(allFakePlayers);

  const handleFind = (sport?: string) => {
    const sportToUse = sport ?? selectedSport;
    setState("loading");
    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const players = sportToUse === "All"
        ? allFakePlayers
        : allFakePlayers.filter((p) => p.sport === sportToUse);
      setFilteredPlayers(players);
      setState("loaded");
    }, delay);
  };

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport);
    if (state === "loaded") {
      handleFind(sport);
    }
  };

  const maxDistance = selectedSport === "All" ? 1 : 1.5;

  return (
    <div className="text-center">
      {state === "idle" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SPORTS.map((sport) => (
              <Badge
                key={sport}
                variant={selectedSport === sport ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm rounded-full transition-colors"
                onClick={() => setSelectedSport(sport)}
              >
                {sport}
              </Badge>
            ))}
          </div>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-10 text-base rounded-xl gap-2"
            onClick={() => handleFind()}
          >
            <Users className="h-5 w-5" />
            Find people nearby
          </Button>
        </div>
      )}

      {state === "loading" && (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">
              Searching for {selectedSport === "All" ? "players" : selectedSport + " players"} within {maxDistance} km...
            </span>
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
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            {SPORTS.map((sport) => (
              <Badge
                key={sport}
                variant={selectedSport === sport ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm rounded-full transition-colors"
                onClick={() => handleSportChange(sport)}
              >
                {sport}
              </Badge>
            ))}
          </div>
          <p className="text-sm font-semibold text-primary tracking-wide uppercase">
            {filteredPlayers.length} {selectedSport === "All" ? "players" : selectedSport + " players"} found within {maxDistance} km
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {filteredPlayers.map((player, idx) => (
              <div
                key={player.name + idx}
                className="flex items-center gap-4 bg-card border border-border/50 rounded-2xl p-4 hover:shadow-md transition-shadow"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {player.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-foreground truncate">{player.name}</p>
                  <p className="text-sm text-muted-foreground">{player.sport} · {player.level}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {player.distance} km
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
