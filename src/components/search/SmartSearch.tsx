import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X, Search, Building, Gamepad2, Tag, Sparkles } from "lucide-react";
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
  size?: "default" | "lg";
  autoFocus?: boolean;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({
  placeholder = "Search venues, games, or locations...",
  className,
  onLocationSelect,
  size = "default",
  autoFocus = false,
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

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
    setIsFocused(false);

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
        inputRef.current?.blur();
        break;
    }
  };

  const getIcon = (type: SearchSuggestion["type"]) => {
    const iconClass = "h-4 w-4 shrink-0";
    switch (type) {
      case "venue":
        return <Building className={cn(iconClass, "text-primary")} />;
      case "game":
        return <Gamepad2 className={cn(iconClass, "text-green-500")} />;
      case "sport":
        return <Tag className={cn(iconClass, "text-orange-500")} />;
      case "location":
        return <MapPin className={cn(iconClass, "text-muted-foreground")} />;
    }
  };

  const getTypeLabel = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "venue": return "Venues";
      case "game": return "Games";
      case "sport": return "Sports";
      case "location": return "Locations";
    }
  };

  // Group suggestions by type
  const groupedSuggestions = suggestions.reduce((acc, s) => {
    if (!acc[s.type]) acc[s.type] = [];
    acc[s.type].push(s);
    return acc;
  }, {} as Record<string, SearchSuggestion[]>);

  const handleClear = () => {
    setInputValue("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const inputHeight = size === "lg" ? "h-14 md:h-14" : "h-11 md:h-12";
  const iconSize = size === "lg" ? "h-5 w-5" : "h-4 w-4 md:h-5 md:w-5";

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Search Input Container */}
      <div 
        className={cn(
          "relative group transition-all duration-200",
          isFocused && "scale-[1.01]"
        )}
      >
        {/* Glow effect on focus */}
        <div 
          className={cn(
            "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 blur transition-opacity duration-300",
            isFocused && "opacity-100"
          )} 
        />
        
        {/* Input wrapper */}
        <div className={cn(
          "relative flex items-center gap-2 bg-card border border-border rounded-xl overflow-hidden transition-all duration-200",
          isFocused ? "border-primary/50 shadow-lg" : "hover:border-muted-foreground/30",
          inputHeight
        )}>
          {/* Search icon */}
          <div className="pl-3 md:pl-4 flex items-center">
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
            autoFocus={autoFocus}
            className={cn(
              "flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none",
              size === "lg" ? "text-base" : "text-sm md:text-base",
              "min-w-0"
            )}
          />
          
          {/* Clear button */}
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="pr-3 md:pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className={iconSize} />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className={cn(
          "absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
        )}>
          <div className="max-h-[60vh] md:max-h-80 overflow-auto">
            {Object.entries(groupedSuggestions).map(([type, items]) => (
              <div key={type}>
                {/* Group header */}
                <div className="px-3 py-2 flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b border-border/50">
                  {getIcon(type as SearchSuggestion["type"])}
                  <span className="uppercase tracking-wider">{getTypeLabel(type as SearchSuggestion["type"])}</span>
                </div>
                
                {/* Items */}
                <ul className="py-1">
                  {items.map((suggestion) => {
                    const globalIndex = suggestions.indexOf(suggestion);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <li
                        key={suggestion.id}
                        className={cn(
                          "px-3 py-2.5 md:py-3 cursor-pointer flex items-center gap-3 transition-all duration-150",
                          isSelected
                            ? "bg-primary/10 border-l-2 border-l-primary"
                            : "hover:bg-muted/50 border-l-2 border-l-transparent"
                        )}
                        onClick={() => handleSelect(suggestion)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className={cn(
                          "h-9 w-9 md:h-10 md:w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                          isSelected ? "bg-primary/20" : "bg-muted/50"
                        )}>
                          {getIcon(suggestion.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm md:text-base text-foreground truncate">
                            {suggestion.title}
                          </div>
                          {suggestion.subtitle && (
                            <div className="text-xs md:text-sm text-muted-foreground truncate">
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
          
          {/* Footer hint */}
          <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-muted/20 flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↑↓</kbd>
              navigate
            </span>
            <span className="hidden md:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↵</kbd>
              select
            </span>
            <span className="md:hidden flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Tap to select
            </span>
          </div>
        </div>
      )}

      {/* Empty state when focused but no results */}
      {isOpen && inputValue.length >= 2 && suggestions.length === 0 && !isLoading && (
        <div className={cn(
          "absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden p-6 text-center",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}>
          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No results found for "{inputValue}"</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;