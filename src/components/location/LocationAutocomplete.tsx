import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const YANDEX_MAPS_API_KEY = "0182c04c-963d-409f-a83d-26b2fb34547e";

export interface LocationPlace {
  name: string;
  city?: string;
  country?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  type?: string;
}

interface YandexSuggestItem {
  displayName: string;
  value: string;
}

interface LocationAutocompleteProps {
  value: string;
  onSelect: (place: LocationPlace) => void;
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
  const [suggestions, setSuggestions] = useState<{ displayName: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Use Yandex Geocoder API for suggestions — biased toward Armenia
      const bbox = defaultLatitude && defaultLongitude
        ? `&bbox=${defaultLongitude - 2},${defaultLatitude - 2}~${defaultLongitude + 2},${defaultLatitude + 2}&rspn=1`
        : `&ll=44.5152,40.1872&spn=4,4&rspn=1`;
      
      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_MAPS_API_KEY}&geocode=${encodeURIComponent(query)}&format=json&results=5&lang=en_US${bbox}`;
      
      const response = await fetch(url);
      const data = await response.json();

      const geoObjects = data?.response?.GeoObjectCollection?.featureMember || [];
      
      const items = geoObjects.map((item: any) => {
        const geoObject = item.GeoObject;
        return {
          displayName: geoObject.name || geoObject.metaDataProperty?.GeocoderMetaData?.text || "Location",
          value: geoObject.metaDataProperty?.GeocoderMetaData?.text || geoObject.name || "Location",
          pos: geoObject.Point?.pos,
          kind: geoObject.metaDataProperty?.GeocoderMetaData?.kind,
          addressComponents: geoObject.metaDataProperty?.GeocoderMetaData?.Address?.Components || [],
        };
      });

      setSuggestions(items);
      setIsOpen(items.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Yandex geocode error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [defaultLatitude, defaultLongitude]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  const handleSelect = async (item: any) => {
    setInputValue(item.value);
    setSuggestions([]);
    setIsOpen(false);

    // Parse coordinates from pos (format: "lng lat")
    if (item.pos) {
      const [lng, lat] = item.pos.split(" ").map(Number);
      
      // Extract city and country from address components
      const components = item.addressComponents || [];
      const city = components.find((c: any) => c.kind === "locality")?.name;
      const country = components.find((c: any) => c.kind === "country")?.name;

      const place: LocationPlace = {
        name: item.displayName,
        city,
        country,
        formattedAddress: item.value,
        latitude: lat,
        longitude: lng,
        type: item.kind,
      };

      onSelect(place);
    }
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
            {suggestions.map((item: any, index: number) => (
              <li
                key={`${item.value}-${index}`}
                className={cn(
                  "px-3 py-2 cursor-pointer flex items-start gap-3 transition-colors",
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.displayName}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.value}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-3 py-1.5 text-xs text-muted-foreground border-t border-border bg-muted/30">
            Powered by Yandex Maps
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
