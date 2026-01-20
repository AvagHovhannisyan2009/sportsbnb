import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Check, X } from "lucide-react";
import { LocationAutocomplete, PhotonPlace } from "@/components/location/LocationAutocomplete";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface VenueLocationPickerProps {
  address: string;
  city: string;
  zipCode?: string;
  onAddressChange: (address: string) => void;
  onCityChange: (city: string) => void;
  onZipCodeChange?: (zipCode: string) => void;
  onLocationConfirm: (lat: number, lng: number, confirmed: boolean) => void;
  latitude?: number | null;
  longitude?: number | null;
  locationConfirmed?: boolean;
  validationErrors?: { address?: string; city?: string; zipCode?: string; location?: string };
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

export const VenueLocationPicker: React.FC<VenueLocationPickerProps> = ({
  address,
  city,
  zipCode = "",
  onAddressChange,
  onCityChange,
  onZipCodeChange,
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

  const handlePlaceSelect = (place: PhotonPlace) => {
    // Update address and city
    onAddressChange(place.formattedAddress);
    if (place.city) {
      onCityChange(place.city);
    }
    
    // Update map position
    setSelectedPosition([place.latitude, place.longitude]);
    setMapCenter([place.latitude, place.longitude]);
    setIsConfirmed(false);
    onLocationConfirm(place.latitude, place.longitude, false);
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
          Search for your venue address and confirm the exact location on the map
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Autocomplete */}
        <div className="space-y-2">
          <Label>Search Address</Label>
          <LocationAutocomplete
            value={address}
            onSelect={handlePlaceSelect}
            placeholder="Start typing your venue address..."
            className={validationErrors.address ? "border-destructive" : ""}
          />
          {validationErrors.address && (
            <p className="text-sm text-destructive">{validationErrors.address}</p>
          )}
        </div>

        {/* City and Zip Code */}
        <div className="grid grid-cols-2 gap-4">
          {city && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">City:</span>
              <span className="font-medium">{city}</span>
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="zipCode" className="text-sm">Zip Code / Postal Code</Label>
            <Input
              id="zipCode"
              placeholder="e.g., 0010"
              value={zipCode}
              onChange={(e) => onZipCodeChange?.(e.target.value)}
              className={validationErrors.zipCode ? "border-destructive" : ""}
              maxLength={10}
            />
            {validationErrors.zipCode && (
              <p className="text-sm text-destructive">{validationErrors.zipCode}</p>
            )}
          </div>
        </div>

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
            Click on map to adjust location
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
