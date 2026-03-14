import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Loader2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import { useVenues, getVenueImage } from "@/hooks/useVenues";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { sportTypes } from "@/data/constants";
import { formatPrice, getCustomerPrice } from "@/lib/pricing";

const mapContainerStyle = { width: "100%", height: "100%" };

const VenueMapPage = () => {
  const navigate = useNavigate();
  const { data: venues = [], isLoading } = useVenues();
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  const filteredVenues = venues.filter((v) => {
    if (!v.latitude || !v.longitude) return false;
    if (selectedSport && selectedSport !== "all" && !v.sports.includes(selectedSport)) return false;
    return true;
  });

  const center = filteredVenues.length > 0
    ? { lat: filteredVenues[0].latitude!, lng: filteredVenues[0].longitude! }
    : { lat: 40.1872, lng: 44.5152 };

  const selectedVenue = filteredVenues.find(v => v.id === selectedVenueId);

  const onLoad = useCallback((map: google.maps.Map) => {
    if (filteredVenues.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      filteredVenues.forEach(v => bounds.extend({ lat: v.latitude!, lng: v.longitude! }));
      map.fitBounds(bounds, 50);
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
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={12}
              onLoad={onLoad}
              options={{ streetViewControl: false, mapTypeControl: false }}
            >
              {filteredVenues.map((venue) => (
                <Marker
                  key={venue.id}
                  position={{ lat: venue.latitude!, lng: venue.longitude! }}
                  onClick={() => setSelectedVenueId(venue.id)}
                />
              ))}
              {selectedVenue && (
                <InfoWindow
                  position={{ lat: selectedVenue.latitude!, lng: selectedVenue.longitude! }}
                  onCloseClick={() => setSelectedVenueId(null)}
                >
                  <div className="min-w-[200px] max-w-[280px]">
                    <img
                      src={getVenueImage(selectedVenue)}
                      alt={selectedVenue.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <h3 className="font-semibold text-sm">{selectedVenue.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {selectedVenue.address || selectedVenue.city}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold">
                        {formatPrice(getCustomerPrice(selectedVenue.price_per_hour))}/hr
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{selectedVenue.rating}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => navigate(`/venue/${selectedVenue.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VenueMapPage;
