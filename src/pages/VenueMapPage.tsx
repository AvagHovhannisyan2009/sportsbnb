import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, DollarSign, Loader2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import { useVenues, getVenueImage } from "@/hooks/useVenues";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { sportTypes } from "@/data/constants";
import { formatPrice, getCustomerPrice } from "@/lib/pricing";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

const VenueMapPage = () => {
  const navigate = useNavigate();
  const { data: venues = [], isLoading } = useVenues();
  const [selectedSport, setSelectedSport] = useState<string>("");

  const filteredVenues = venues.filter((v) => {
    if (!v.latitude || !v.longitude) return false;
    if (selectedSport && !v.sports.includes(selectedSport)) return false;
    return true;
  });

  const center: [number, number] = filteredVenues.length > 0
    ? [filteredVenues[0].latitude!, filteredVenues[0].longitude!]
    : [40.1872, 44.5152]; // Default: Yerevan

  return (
    <Layout>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Filter bar */}
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

        {/* Map */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <MapContainer center={center} zoom={12} className="h-full w-full z-0">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredVenues.map((venue) => (
                <Marker key={venue.id} position={[venue.latitude!, venue.longitude!]}>
                  <Popup>
                    <div className="min-w-[200px]">
                      <img
                        src={getVenueImage(venue)}
                        alt={venue.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <h3 className="font-semibold text-sm">{venue.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {venue.address || venue.city}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold">{formatPrice(getCustomerPrice(venue.price_per_hour))}/hr</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="text-xs">{venue.rating}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => navigate(`/venue/${venue.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VenueMapPage;
