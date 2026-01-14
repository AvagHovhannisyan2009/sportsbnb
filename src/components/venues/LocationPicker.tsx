import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Search, Check, Loader2, X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationPickerProps {
  address: string;
  city: string;
  onAddressChange: (address: string) => void;
  onCityChange: (city: string) => void;
  onLocationConfirm: (lat: number, lng: number, confirmed: boolean) => void;
  latitude?: number | null;
  longitude?: number | null;
  locationConfirmed?: boolean;
  validationErrors?: { address?: string; city?: string; location?: string };
}

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

interface MapCenterUpdaterProps {
  center: [number, number];
}

const MapCenterUpdater: React.FC<MapCenterUpdaterProps> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  address,
  city,
  onAddressChange,
  onCityChange,
  onLocationConfirm,
  latitude,
  longitude,
  locationConfirmed = false,
  validationErrors = {},
}) => {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]); // Default: NYC
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(locationConfirmed);

  // Update internal state when props change
  useEffect(() => {
    if (latitude && longitude) {
      setSelectedPosition([latitude, longitude]);
      setMapCenter([latitude, longitude]);
    }
    setIsConfirmed(locationConfirmed);
  }, [latitude, longitude, locationConfirmed]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    setIsConfirmed(false);
    onLocationConfirm(lat, lng, false);
  }, [onLocationConfirm]);

  const searchAddress = async () => {
    const fullAddress = `${address}, ${city}`.trim();
    if (!fullAddress || fullAddress === ",") {
      setSearchError("Please enter an address and city first");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`,
        {
          headers: {
            "User-Agent": "SportsBnB Venue Listing",
          },
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setSelectedPosition([newLat, newLng]);
        setMapCenter([newLat, newLng]);
        setIsConfirmed(false);
        onLocationConfirm(newLat, newLng, false);
      } else {
        setSearchError("Address not found. Try clicking on the map to select the exact location.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setSearchError("Failed to search address. Please try clicking on the map directly.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedPosition) {
      setIsConfirmed(true);
      onLocationConfirm(selectedPosition[0], selectedPosition[1], true);
    }
  };

  const handleClearLocation = () => {
    setSelectedPosition(null);
    setIsConfirmed(false);
    onLocationConfirm(0, 0, false);
  };

  return (
    <Card className={validationErrors.location ? "border-destructive" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location & Address *
        </CardTitle>
        <CardDescription>
          Enter your address and confirm the exact location on the map
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Inputs */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., New York"
              value={city}
              onChange={(e) => {
                onCityChange(e.target.value);
                setIsConfirmed(false);
              }}
              maxLength={100}
              className={validationErrors.city ? "border-destructive" : ""}
            />
            {validationErrors.city && (
              <p className="text-sm text-destructive">{validationErrors.city}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              placeholder="Full street address"
              value={address}
              onChange={(e) => {
                onAddressChange(e.target.value);
                setIsConfirmed(false);
              }}
              maxLength={200}
              className={validationErrors.address ? "border-destructive" : ""}
            />
            {validationErrors.address && (
              <p className="text-sm text-destructive">{validationErrors.address}</p>
            )}
          </div>
        </div>

        {/* Search Button */}
        <Button
          type="button"
          variant="outline"
          onClick={searchAddress}
          disabled={isSearching || (!address.trim() && !city.trim())}
          className="w-full"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Find on Map
        </Button>

        {searchError && (
          <Alert variant="destructive">
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}

        {/* Map */}
        <div className="relative rounded-lg overflow-hidden border border-border">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "300px", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={handleMapClick} />
            <MapCenterUpdater center={mapCenter} />
            {selectedPosition && <Marker position={selectedPosition} />}
          </MapContainer>
          <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground">
            Click on map to select exact location
          </div>
        </div>

        {/* Selected Location Info */}
        {selectedPosition && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  Selected: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearLocation}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!isConfirmed ? (
              <Button
                type="button"
                onClick={handleConfirmLocation}
                className="w-full"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm This Location
              </Button>
            ) : (
              <Alert className="bg-primary/10 border-primary">
                <Check className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                  Location confirmed! You can continue with the form.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {validationErrors.location && (
          <p className="text-sm text-destructive">{validationErrors.location}</p>
        )}
      </CardContent>
    </Card>
  );
};
