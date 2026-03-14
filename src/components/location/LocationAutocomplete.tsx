import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const YANDEX_GEOCODER_API_KEY = "0182c04c-963d-409f-a83d-26b2fb34547e";

export interface LocationPlace {
  name: string;
  city?: string;
  country?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  type?: string;
}

interface GeosuggestResult {
  title: { text: string };
  subtitle?: { text: string };
  tags?: string[];
  uri?: string;
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
  const [suggestions, setSuggestions] = useState<GeosuggestResult[]>([]);
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
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const centerLng = defaultLongitude ?? 44.5152;
      const centerLat = defaultLatitude ?? 40.1872;

      const { data: fnData, error: fnError } = await supabase.functions.invoke("geosuggest", {
        body: {
          text: query,
          lang: "en",
          results: 7,
          ll: `${centerLng},${centerLat}`,
          spn: "2,2",
          ull: `${centerLng},${centerLat}`,
        },
      });

      let items: GeosuggestResult[] = fnError ? [] : (fnData?.results || []);

      // Fallback to Geocoder when Geosuggest returns no results
      if (items.length === 0) {
        const geocodeUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&geocode=${encodeURIComponent(query)}&format=json&results=7&lang=en_US&ll=${centerLng},${centerLat}&spn=2,2&rspn=1`;
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();
        const geoObjects = geocodeData?.response?.GeoObjectCollection?.featureMember || [];

        items = geoObjects.map((member: any) => {
          const geoObject = member.GeoObject;
          const titleText = geoObject.name || geoObject.metaDataProperty?.GeocoderMetaData?.text || "Location";
          const subtitleText = geoObject.metaDataProperty?.GeocoderMetaData?.text || "";
          return {
            title: { text: titleText },
            subtitle: subtitleText ? { text: subtitleText } : undefined,
          } as GeosuggestResult;
        });
      }

      setSuggestions(items);
      setIsOpen(items.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      console.error("Geosuggest error:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [defaultLatitude, defaultLongitude]);

  const resolveCoordinates = async (item: GeosuggestResult): Promise<LocationPlace | null> => {
    try {
      // Use the full text as geocode query for best results
      const fullQuery = item.subtitle?.text
        ? `${item.title.text}, ${item.subtitle.text}`
        : item.title.text;

      // If URI is available, use it for precise geocoding
      const geocodeParam = item.uri
        ? `uri=${encodeURIComponent(item.uri)}`
        : `geocode=${encodeURIComponent(fullQuery)}`;

      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&${geocodeParam}&format=json&results=1&lang=en_US`;
      const response = await fetch(url);
      const data = await response.json();

      const geoObject = data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
      if (!geoObject?.Point?.pos) return null;

      const [lng, lat] = geoObject.Point.pos.split(" ").map(Number);
      const components = geoObject.metaDataProperty?.GeocoderMetaData?.Address?.Components || [];
      const city = components.find((c: any) => c.kind === "locality")?.name;
      const country = components.find((c: any) => c.kind === "country")?.name;

      return {
        name: item.title.text,
        city,
        country,
        formattedAddress: geoObject.metaDataProperty?.GeocoderMetaData?.text || fullQuery,
        latitude: lat,
        longitude: lng,
        type: geoObject.metaDataProperty?.GeocoderMetaData?.kind,
      };
    } catch (err) {
      console.error("Geocoder resolve error:", err);
      return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocations(newValue), 250);
  };

  const handleSelect = async (item: GeosuggestResult) => {
    const displayText = item.subtitle?.text
      ? `${item.title.text}, ${item.subtitle.text}`
      : item.title.text;
    setInputValue(displayText);
    setSuggestions([]);
    setIsOpen(false);
    setIsLoading(true);

    const place = await resolveCoordinates(item);
    setIsLoading(false);

    if (place) {
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
          className={cn("pl-10 pr-10", error && "border-destructive")}
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

      {error && <p className="text-sm text-destructive mt-1">{error}</p>}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <ul className="max-h-60 overflow-auto py-1">
            {suggestions.map((item, index) => (
              <li
                key={`${item.title.text}-${index}`}
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
                  <div className="font-medium text-sm truncate">{item.title.text}</div>
                  {item.subtitle?.text && (
                    <div className="text-xs text-muted-foreground truncate">
                      {item.subtitle.text}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
