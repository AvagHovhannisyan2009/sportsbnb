import React, { useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Map, Placemark } from "@pbe/react-yandex-maps";
import { format } from "date-fns";
import type { Game } from "@/hooks/useGames";

interface GamesMapViewProps {
  games: Game[];
}

const GamesMapView: React.FC<GamesMapViewProps> = ({ games }) => {
  const gamesWithCoords = games.filter(g => g.latitude && g.longitude);
  const mapRef = useRef<any>(null);
  const defaultCenter: [number, number] = [40.0691, 45.0382];

  const handleMapLoad = useCallback(() => {
    if (gamesWithCoords.length > 0 && mapRef.current) {
      const bounds = gamesWithCoords.reduce(
        (acc, g) => [
          [Math.min(acc[0][0], g.latitude!), Math.min(acc[0][1], g.longitude!)],
          [Math.max(acc[1][0], g.latitude!), Math.max(acc[1][1], g.longitude!)],
        ],
        [[90, 180], [-90, -180]] as [[number, number], [number, number]]
      );
      mapRef.current.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 });
    }
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
      <Map
        defaultState={{ center: defaultCenter, zoom: 7 }}
        width="100%"
        height="600px"
        instanceRef={(ref) => { mapRef.current = ref; }}
        onLoad={handleMapLoad}
      >
        {gamesWithCoords.map((game) => {
          const spotsLeft = game.max_players - (game.participant_count || 0);
          const isFull = spotsLeft <= 0;

          return (
            <Placemark
              key={game.id}
              geometry={[game.latitude!, game.longitude!]}
              options={{
                preset: "islands#sportCircleIcon",
                iconColor: isFull ? "#9ca3af" : "#3b82f6",
              }}
              properties={{
                balloonContentHeader: game.title,
                balloonContentBody: `
                  <div style="min-width:250px">
                    <div style="margin-bottom:8px">
                      <span style="background:#e5e7eb;padding:2px 8px;border-radius:12px;font-size:12px;margin-right:4px">${game.sport}</span>
                      <span style="background:#dbeafe;padding:2px 8px;border-radius:12px;font-size:12px">${game.skill_level === "all" ? "All levels" : game.skill_level}</span>
                    </div>
                    <p style="font-size:13px;color:#6b7280;margin:4px 0">📅 ${format(new Date(game.game_date), "MMM d, yyyy")} · 🕐 ${game.game_time}</p>
                    <p style="font-size:13px;color:${isFull ? '#6b7280' : '#3b82f6'};font-weight:${isFull ? 'normal' : '600'};margin:4px 0">
                      👥 ${isFull ? "Full" : `${spotsLeft} spots left`}
                    </p>
                  </div>
                `,
                balloonContentFooter: `<a href="/game/${game.id}" style="display:block;text-align:center;padding:8px;background:${isFull ? '#9ca3af' : '#3b82f6'};color:white;border-radius:6px;text-decoration:none;margin-top:8px;font-size:14px">${isFull ? "View Details" : "Join Game"}</a>`,
              }}
              modules={["geoObject.addon.balloon"]}
            />
          );
        })}
      </Map>
    </div>
  );
};

export default GamesMapView;
