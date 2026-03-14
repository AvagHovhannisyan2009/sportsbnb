import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Loader2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import { useVenues, getVenueImage } from "@/hooks/useVenues";
import { Map, Placemark } from "@pbe/react-yandex-maps";
import { sportTypes } from "@/data/constants";
import { formatPrice, getCustomerPrice } from "@/lib/pricing";

const VenueMapPage = () => {
  const navigate = useNavigate();
  const { data: venues = [], isLoading } = useVenues();
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  const filteredVenues = venues.filter((v) => {
    if (!v.latitude || !v.longitude) return false;
    if (selectedSport && selectedSport !== "all" && !v.sports.includes(selectedSport)) return false;
    return true;
  });

  const center: [number, number] = filteredVenues.length > 0
    ? [filteredVenues[0].latitude!, filteredVenues[0].longitude!]
    : [40.1872, 44.5152];

  const selectedVenue = filteredVenues.find(v => v.id === selectedVenueId);

  const handleMapLoad = useCallback((ymaps: any) => {
    if (filteredVenues.length > 1 && mapRef.current) {
      const bounds = filteredVenues.reduce(
        (acc, v) => [
          [Math.min(acc[0][0], v.latitude!), Math.min(acc[0][1], v.longitude!)],
          [Math.max(acc[1][0], v.latitude!), Math.max(acc[1][1], v.longitude!)],
        ],
        [[90, 180], [-90, -180]] as [[number, number], [number, number]]
      );
      mapRef.current.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 });
    }
  }, [filteredVenues]);

  return (
    <Layout>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        <div className="bg-card border-b p-3 flex items-center gap-3 z-10">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="All sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sports</SelectItem>
              {sportTypes.map((sport) => (
                <SelectItem key={sport} value={sport}>{sport}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary">{filteredVenues.length} venues</Badge>
        </div>

        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Map
              defaultState={{ center, zoom: 12 }}
              width="100%"
              height="100%"
              instanceRef={(ref) => { mapRef.current = ref; }}
              onLoad={handleMapLoad}
              modules={["templateLayoutFactory", "layout.ImageWithContent"]}
            >
              {filteredVenues.map((venue) => (
                <Placemark
                  key={venue.id}
                  geometry={[venue.latitude!, venue.longitude!]}
                  options={{
                    preset: "islands#sportIcon",
                    iconColor: selectedVenueId === venue.id ? "#ef4444" : "#3b82f6",
                  }}
                  properties={{
                    balloonContentHeader: venue.name,
                    balloonContentBody: `
                      <div style="min-width:200px">
                        <img src="${getVenueImage(venue)}" alt="${venue.name}" style="width:100%;height:96px;object-fit:cover;border-radius:8px;margin-bottom:8px" />
                        <p style="font-size:12px;color:#6b7280;margin:4px 0">📍 ${venue.address || venue.city}</p>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
                          <strong>${formatPrice(getCustomerPrice(venue.price_per_hour))}/hr</strong>
                          <span>⭐ ${venue.rating}</span>
                        </div>
                      </div>
                    `,
                    balloonContentFooter: `<a href="/venue/${venue.id}" style="display:block;text-align:center;padding:8px;background:#3b82f6;color:white;border-radius:6px;text-decoration:none;margin-top:8px;font-size:14px">View Details</a>`,
                  }}
                  modules={["geoObject.addon.balloon"]}
                  onClick={() => setSelectedVenueId(venue.id)}
                />
              ))}
            </Map>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VenueMapPage;
