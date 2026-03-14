import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import type { Game } from "@/hooks/useGames";

const mapContainerStyle = { height: "600px", width: "100%" };

interface GamesMapViewProps {
  games: Game[];
}

const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  all: "bg-primary/10 text-primary",
};

const GamesMapView: React.FC<GamesMapViewProps> = ({ games }) => {
  const gamesWithCoords = games.filter(g => g.latitude && g.longitude);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const defaultCenter = { lat: 40.0691, lng: 45.0382 };

  const selectedGame = gamesWithCoords.find(g => g.id === selectedGameId);

  const onLoad = useCallback((map: google.maps.Map) => {
    if (gamesWithCoords.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    gamesWithCoords.forEach(g => bounds.extend({ lat: g.latitude!, lng: g.longitude! }));
    map.fitBounds(bounds, 50);
  }, [gamesWithCoords]);

  if (gamesWithCoords.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-muted-foreground">No games with location data available</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={7}
        onLoad={onLoad}
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        {gamesWithCoords.map((game) => (
          <Marker
            key={game.id}
            position={{ lat: game.latitude!, lng: game.longitude! }}
            onClick={() => setSelectedGameId(game.id)}
          />
        ))}
        {selectedGame && (
          <InfoWindow
            position={{ lat: selectedGame.latitude!, lng: selectedGame.longitude! }}
            onCloseClick={() => setSelectedGameId(null)}
          >
            <div className="p-1 max-w-[300px]">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">{selectedGame.sport}</Badge>
                <Badge className={`text-xs ${levelColors[selectedGame.skill_level] || levelColors.all}`}>
                  {selectedGame.skill_level === "all" ? "All levels" : selectedGame.skill_level}
                </Badge>
              </div>
              <h3 className="font-semibold text-base mb-2">{selectedGame.title}</h3>
              <div className="space-y-1 mb-3 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(new Date(selectedGame.game_date), "MMM d, yyyy")}</span>
                  <Clock className="h-3.5 w-3.5 ml-2" />
                  <span>{selectedGame.game_time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Users className="h-3.5 w-3.5" />
                  {(() => {
                    const spotsLeft = selectedGame.max_players - (selectedGame.participant_count || 0);
                    const isFull = spotsLeft <= 0;
                    return <span className={isFull ? "" : "text-blue-600 font-medium"}>{isFull ? "Full" : `${spotsLeft} spots left`}</span>;
                  })()}
                </div>
              </div>
              <Link to={`/game/${selectedGame.id}`}>
                <Button size="sm" className="w-full">
                  {selectedGame.max_players - (selectedGame.participant_count || 0) <= 0 ? "View Details" : "Join Game"}
                </Button>
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default GamesMapView;
