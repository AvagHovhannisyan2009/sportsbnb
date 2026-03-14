import React, { useState, useEffect, useCallback, useRef } from "react";
import { Map, Placemark } from "@pbe/react-yandex-maps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Search, Check, Loader2, X } from "lucide-react";

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
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    latitude && longitude ? [latitude, longitude] : [40.1872, 44.5152]
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(locationConfirmed);
  const mapRef = useRef<any>(null);
  const ymapsRef = useRef<any>(null);

  useEffect(() => {
    if (latitude && longitude) {
      const pos: [number, number] = [latitude, longitude];
      setSelectedPosition(pos);
      setMapCenter(pos);
    }
    setIsConfirmed(locationConfirmed);
  }, [latitude, longitude, locationConfirmed]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter(mapCenter, mapRef.current.getZoom(), { duration: 300 });
    }
  }, [mapCenter]);

  const handleMapClick = useCallback((e: any) => {
    const coords = e.get("coords") as [number, number];
    setSelectedPosition(coords);
    setIsConfirmed(false);
    onLocationConfirm(coords[0], coords[1], false);
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
      if (ymapsRef.current) {
        const result = await ymapsRef.current.geocode(fullAddress);
        const firstGeoObject = result.geoObjects.get(0);
        if (firstGeoObject) {
          const coords = firstGeoObject.geometry.getCoordinates() as [number, number];
          setSelectedPosition(coords);
          setMapCenter(coords);
          setIsConfirmed(false);
          onLocationConfirm(coords[0], coords[1], false);
        } else {
          setSearchError("Address not found. Try clicking on the map.");
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setSearchError("Failed to search address. Try clicking on the map.");
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
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., Yerevan"
              value={city}
              onChange={(e) => { onCityChange(e.target.value); setIsConfirmed(false); }}
              maxLength={100}
              className={validationErrors.city ? "border-destructive" : ""}
            />
            {validationErrors.city && <p className="text-sm text-destructive">{validationErrors.city}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              placeholder="Full street address"
              value={address}
              onChange={(e) => { onAddressChange(e.target.value); setIsConfirmed(false); }}
              maxLength={200}
              className={validationErrors.address ? "border-destructive" : ""}
            />
            {validationErrors.address && <p className="text-sm text-destructive">{validationErrors.address}</p>}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={searchAddress}
          disabled={isSearching || (!address.trim() && !city.trim())}
          className="w-full"
        >
          {isSearching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
          Find on Map
        </Button>

        {searchError && (
          <Alert variant="destructive">
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}

        <div className="relative rounded-lg overflow-hidden border border-border">
          <Map
            defaultState={{ center: mapCenter, zoom: 13 }}
            width="100%"
            height="300px"
            instanceRef={(ref) => { mapRef.current = ref; }}
            onLoad={(ymaps) => { ymapsRef.current = ymaps; }}
            onClick={handleMapClick}
            modules={["geocode"]}
          >
            {selectedPosition && <Placemark geometry={selectedPosition} />}
          </Map>
          <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground">
            Click on map to select exact location
          </div>
        </div>

        {selectedPosition && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  Selected: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
                </span>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={handleClearLocation}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {!isConfirmed ? (
              <Button type="button" onClick={handleConfirmLocation} className="w-full">
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

        {validationErrors.location && <p className="text-sm text-destructive">{validationErrors.location}</p>}
      </CardContent>
    </Card>
  );
};
