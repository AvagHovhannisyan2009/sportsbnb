import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PhotonPlace {
  name: string;
  city?: string;
  country?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  type?: string;
}

interface PhotonResult {
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
    osm_key?: string;
    osm_value?: string;
    type?: string;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

interface LocationAutocompleteProps {
  value: string;
  onSelect: (place: PhotonPlace) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  defaultLatitude?: number;
  defaultLongitude?: number;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onSelect,
  onClear,
  placeholder = "Search for a location...",
  className,
  disabled = false,
  error,
  defaultLatitude,
  defaultLongitude,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PhotonPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatAddress = (result: PhotonResult): string => {
    const props = result.properties;
    const parts: string[] = [];

    if (props.name) parts.push(props.name);
    if (props.street) {
      const streetPart = props.housenumber 
        ? `${props.street} ${props.housenumber}` 
        : props.street;
      if (!parts.includes(streetPart)) parts.push(streetPart);
    }
    if (props.city && !parts.includes(props.city)) parts.push(props.city);
    if (props.country && !parts.includes(props.country)) parts.push(props.country);

    return parts.join(", ") || "Unknown location";
  };

  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Build Photon API URL with optional location bias
      let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
      
      // Add location bias if we have coordinates
      if (defaultLatitude && defaultLongitude) {
        url += `&lat=${defaultLatitude}&lon=${defaultLongitude}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      const places: PhotonPlace[] = (data.features || []).map((feature: PhotonResult) => ({
        name: feature.properties.name || feature.properties.street || "Location",
        city: feature.properties.city,
        country: feature.properties.country,
        formattedAddress: formatAddress(feature),
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        type: feature.properties.osm_value || feature.properties.type,
      }));

      setSuggestions(places);
      setIsOpen(places.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Photon search error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [defaultLatitude, defaultLongitude]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  const handleSelect = (place: PhotonPlace) => {
    setInputValue(place.formattedAddress);
    setSuggestions([]);
    setIsOpen(false);
    onSelect(place);
  };

  const handleClear = () => {
    setInputValue("");
    setSuggestions([]);
    setIsOpen(false);
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const getTypeIcon = (type?: string) => {
    // Could be extended with different icons for different place types
    return <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />;
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pl-10 pr-10",
            error && "border-destructive",
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {!isLoading && inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <ul className="max-h-60 overflow-auto py-1">
            {suggestions.map((place, index) => (
              <li
                key={`${place.latitude}-${place.longitude}-${index}`}
                className={cn(
                  "px-3 py-2 cursor-pointer flex items-start gap-3 transition-colors",
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => handleSelect(place)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {getTypeIcon(place.type)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{place.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {place.city && place.country
                      ? `${place.city}, ${place.country}`
                      : place.formattedAddress
                    }
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-3 py-1.5 text-xs text-muted-foreground border-t border-border bg-muted/30">
            Powered by OpenStreetMap
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
