import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X, Search, Navigation } from "lucide-react";
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
  size?: "default" | "lg";
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
  size = "default",
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PhotonPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
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
        setIsFocused(false);
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
    setIsFocused(false);
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
        inputRef.current?.blur();
        break;
    }
  };

  const inputHeight = size === "lg" ? "h-12" : "h-10 md:h-11";
  const iconSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input container */}
      <div className="relative group">
        {/* Glow effect */}
        <div 
          className={cn(
            "absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/15 to-primary/15 opacity-0 blur transition-opacity duration-200",
            isFocused && !error && "opacity-100"
          )} 
        />
        
        <div className={cn(
          "relative flex items-center bg-card border rounded-lg overflow-hidden transition-all duration-200",
          error ? "border-destructive" : isFocused ? "border-primary/50" : "border-input hover:border-muted-foreground/30",
          inputHeight
        )}>
          {/* Search icon */}
          <div className="pl-3 flex items-center">
            {isLoading ? (
              <Loader2 className={cn(iconSize, "animate-spin text-primary")} />
            ) : (
              <Search className={cn(iconSize, "text-muted-foreground transition-colors", isFocused && "text-primary")} />
            )}
          </div>
          
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              if (suggestions.length > 0) setIsOpen(true);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex-1 px-2 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-sm",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          
          {/* Clear button */}
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className={iconSize} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className={cn(
          "absolute z-50 w-full mt-1.5 bg-popover border border-border rounded-lg shadow-xl overflow-hidden",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
        )}>
          <ul className="max-h-60 overflow-auto py-1">
            {suggestions.map((place, index) => (
              <li
                key={`${place.latitude}-${place.longitude}-${index}`}
                className={cn(
                  "px-3 py-2.5 cursor-pointer flex items-center gap-3 transition-all duration-150",
                  index === selectedIndex
                    ? "bg-primary/10 border-l-2 border-l-primary"
                    : "hover:bg-muted/50 border-l-2 border-l-transparent"
                )}
                onClick={() => handleSelect(place)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  index === selectedIndex ? "bg-primary/20" : "bg-muted/50"
                )}>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{place.name}</div>
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
          <div className="px-3 py-1.5 text-xs text-muted-foreground border-t border-border bg-muted/20 flex items-center gap-1">
            <Navigation className="h-3 w-3" />
            Powered by OpenStreetMap
          </div>
        </div>
      )}

      {/* Empty state */}
      {isOpen && inputValue.length >= 3 && suggestions.length === 0 && !isLoading && (
        <div className={cn(
          "absolute z-50 w-full mt-1.5 bg-popover border border-border rounded-lg shadow-xl overflow-hidden p-4 text-center",
          "animate-in fade-in-0 zoom-in-95 duration-150"
        )}>
          <MapPin className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
          <p className="text-sm text-muted-foreground">No locations found</p>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;