import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X, Search, Building, Gamepad2, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PhotonResult {
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    country?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface SearchSuggestion {
  id: string;
  type: "location" | "venue" | "game" | "sport";
  title: string;
  subtitle?: string;
  data?: any;
}

interface SmartSearchProps {
  placeholder?: string;
  className?: string;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({
  placeholder = "Search venues, games, or locations...",
  className,
  onLocationSelect,
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

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

  const searchAll = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const allSuggestions: SearchSuggestion[] = [];

    try {
      // Search sports (local matching)
      const sportTypes = ["Football", "Basketball", "Tennis", "Swimming", "Volleyball", "Badminton", "Rugby", "Gym", "Cricket", "Golf", "Running", "Cycling"];
      const matchingSports = sportTypes.filter(sport => 
        sport.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 2);
      
      matchingSports.forEach(sport => {
        allSuggestions.push({
          id: `sport-${sport}`,
          type: "sport",
          title: sport,
          subtitle: "Sport category",
          data: { sport },
        });
      });

      // Search venues in database
      const { data: venues } = await supabase
        .from("venues")
        .select("id, name, city, address")
        .eq("is_active", true)
        .or(`name.ilike.%${query}%,city.ilike.%${query}%,address.ilike.%${query}%`)
        .limit(3);

      if (venues) {
        venues.forEach(venue => {
          allSuggestions.push({
            id: `venue-${venue.id}`,
            type: "venue",
            title: venue.name,
            subtitle: venue.address || venue.city,
            data: venue,
          });
        });
      }

      // Search games in database
      const { data: games } = await supabase
        .from("games")
        .select("id, title, sport, location")
        .eq("status", "open")
        .gte("game_date", new Date().toISOString().split("T")[0])
        .or(`title.ilike.%${query}%,sport.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(3);

      if (games) {
        games.forEach(game => {
          allSuggestions.push({
            id: `game-${game.id}`,
            type: "game",
            title: game.title,
            subtitle: `${game.sport} • ${game.location}`,
            data: game,
          });
        });
      }

      // Search locations via Photon API
      const photonResponse = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=3`
      );
      const photonData = await photonResponse.json();

      (photonData.features || []).forEach((feature: PhotonResult, index: number) => {
        const props = feature.properties;
        const name = props.name || props.street || "Location";
        const subtitle = [props.city, props.country].filter(Boolean).join(", ");
        
        allSuggestions.push({
          id: `location-${index}`,
          type: "location",
          title: name,
          subtitle,
          data: {
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
            address: [name, props.city, props.country].filter(Boolean).join(", "),
          },
        });
      });

      setSuggestions(allSuggestions);
      setIsOpen(allSuggestions.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAll(newValue);
    }, 300);
  };

  const handleSelect = (suggestion: SearchSuggestion) => {
    setInputValue("");
    setSuggestions([]);
    setIsOpen(false);

    switch (suggestion.type) {
      case "venue":
        navigate(`/venue/${suggestion.data.id}`);
        break;
      case "game":
        navigate(`/game/${suggestion.data.id}`);
        break;
      case "sport":
        navigate(`/venues?sport=${encodeURIComponent(suggestion.data.sport)}`);
        break;
      case "location":
        if (onLocationSelect) {
          onLocationSelect(
            suggestion.data.latitude,
            suggestion.data.longitude,
            suggestion.data.address
          );
        } else {
          navigate(`/venues?lat=${suggestion.data.latitude}&lng=${suggestion.data.longitude}`);
        }
        break;
    }
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

  const getIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "venue":
        return <Building className="h-4 w-4 text-primary" />;
      case "game":
        return <Gamepad2 className="h-4 w-4 text-green-500" />;
      case "sport":
        return <Tag className="h-4 w-4 text-orange-500" />;
      case "location":
        return <MapPin className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "venue": return "Venue";
      case "game": return "Game";
      case "sport": return "Sport";
      case "location": return "Location";
    }
  };

  // Group suggestions by type
  const groupedSuggestions = suggestions.reduce((acc, s) => {
    if (!acc[s.type]) acc[s.type] = [];
    acc[s.type].push(s);
    return acc;
  }, {} as Record<string, SearchSuggestion[]>);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
        )}
        {!isLoading && inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-80 overflow-auto">
            {Object.entries(groupedSuggestions).map(([type, items]) => (
              <div key={type}>
                <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 uppercase tracking-wider">
                  {getTypeLabel(type as SearchSuggestion["type"])}s
                </div>
                <ul>
                  {items.map((suggestion, idx) => {
                    const globalIndex = suggestions.indexOf(suggestion);
                    return (
                      <li
                        key={suggestion.id}
                        className={cn(
                          "px-3 py-2.5 cursor-pointer flex items-center gap-3 transition-colors",
                          globalIndex === selectedIndex
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                        )}
                        onClick={() => handleSelect(suggestion)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        {getIcon(suggestion.type)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{suggestion.title}</div>
                          {suggestion.subtitle && (
                            <div className="text-xs text-muted-foreground truncate">
                              {suggestion.subtitle}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="px-3 py-1.5 text-xs text-muted-foreground border-t border-border bg-muted/30">
            Press ↵ to select • Esc to close
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
