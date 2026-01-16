import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import type { Game } from "@/hooks/useGames";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface GamesMapViewProps {
  games: Game[];
}

// Component to fit map bounds to all markers
const FitBounds: React.FC<{ games: Game[] }> = ({ games }) => {
  const map = useMap();
  
  useEffect(() => {
    const gamesWithCoords = games.filter(g => g.latitude && g.longitude);
    if (gamesWithCoords.length === 0) return;
    
    const bounds = L.latLngBounds(
      gamesWithCoords.map(g => [g.latitude!, g.longitude!] as [number, number])
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [games, map]);
  
  return null;
};

const GamesMapView: React.FC<GamesMapViewProps> = ({ games }) => {
  const gamesWithCoords = games.filter(g => g.latitude && g.longitude);
  
  // Default center on Armenia
  const defaultCenter: [number, number] = [40.0691, 45.0382];
  
  const levelColors: Record<string, string> = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    all: "bg-primary/10 text-primary",
  };

  if (gamesWithCoords.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-muted-foreground">No games with location data available</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={7}
        style={{ height: "600px", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds games={gamesWithCoords} />
        {gamesWithCoords.map((game) => {
          const spotsLeft = game.max_players - (game.participant_count || 0);
          const isFull = spotsLeft <= 0;
          
          return (
            <Marker 
              key={game.id} 
              position={[game.latitude!, game.longitude!]}
            >
              <Popup minWidth={280} maxWidth={320}>
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{game.sport}</Badge>
                    <Badge className={`text-xs ${levelColors[game.skill_level] || levelColors.all}`}>
                      {game.skill_level === "all" ? "All levels" : game.skill_level}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-foreground text-base mb-2">{game.title}</h3>
                  
                  <div className="space-y-1 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{format(new Date(game.game_date), "MMM d, yyyy")}</span>
                      <Clock className="h-3.5 w-3.5 ml-2" />
                      <span>{game.game_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span className={isFull ? "text-muted-foreground" : "text-primary font-medium"}>
                        {isFull ? "Full" : `${spotsLeft} spots left`}
                      </span>
                    </div>
                  </div>
                  
                  <Link to={`/game/${game.id}`}>
                    <Button size="sm" className="w-full" variant={isFull ? "secondary" : "default"}>
                      {isFull ? "View Details" : "Join Game"}
                    </Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default GamesMapView;
