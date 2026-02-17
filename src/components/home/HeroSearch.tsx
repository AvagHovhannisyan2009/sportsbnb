import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Navigation, Star, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { sportTypes } from "@/data/constants";
import { toast } from "sonner";

const fakeVenueResults = [
  { name: "Yerevan Arena Football Center", address: "15 Abovyan St, Yerevan", price: 12000, rating: 4.8, sport: "Football", available: "10:00 – 22:00" },
  { name: "Hrazdan Stadium Mini Pitch", address: "56 Hrazdan Ave, Yerevan", price: 8000, rating: 4.5, sport: "Football", available: "08:00 – 20:00" },
  { name: "Nor Nork Football Field", address: "3 Gai Ave, Yerevan", price: 6000, rating: 4.3, sport: "Football", available: "09:00 – 21:00" },
  { name: "Davtashen Sports Complex", address: "22 Davtashen Blvd, Yerevan", price: 10000, rating: 4.6, sport: "Football", available: "07:00 – 23:00" },
  { name: "Avan Football Academy", address: "8 Avan Main St, Yerevan", price: 7000, rating: 4.2, sport: "Football", available: "10:00 – 20:00" },
  { name: "Erebuni Sports Ground", address: "41 Erebuni Ave, Yerevan", price: 5000, rating: 4.0, sport: "Football", available: "08:00 – 19:00" },
  { name: "Malatia-Sebastia Pitch", address: "12 Raffi St, Yerevan", price: 9000, rating: 4.4, sport: "Football", available: "09:00 – 22:00" },
];

const HeroSearch = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [sport, setSport] = useState("");
  const [when, setWhen] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "results">("idle");
  const [results, setResults] = useState<typeof fakeVenueResults>([]);

  const shouldShowFakeResults = () => {
    const loc = location.trim().toLowerCase();
    const isYerevan = loc.includes("yerevan") || loc.includes("երևան");
    const isFootball = sport === "football";
    const isToday = when === "today";
    return isYerevan && isFootball && isToday;
  };

  const handleSearch = () => {
    if (shouldShowFakeResults()) {
      setSearchState("loading");
      const delay = 1000 + Math.random() * 1000;
      setTimeout(() => {
        setResults(fakeVenueResults);
        setSearchState("results");
      }, delay);
      return;
    }

    setSearchState("idle");
    setResults([]);
    const params = new URLSearchParams();
    if (sport && sport !== "any") params.set("sport", sport);
    if (location) params.set("location", location);
    navigate(`/venues?${params.toString()}`);
  };

  const handleNearMe = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const params = new URLSearchParams();
        params.set("lat", latitude.toString());
        params.set("lng", longitude.toString());
        if (sport && sport !== "any") params.set("sport", sport);
        setIsLocating(false);
        navigate(`/venues?${params.toString()}`);
      },
      (error) => {
        setIsLocating(false);
        toast.error("Unable to get your location. Please enable location services.");
      }
    );
  };

  const formatPrice = (price: number) => `${price.toLocaleString()} AMD/hr`;

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="bg-background/95 backdrop-blur-md rounded-xl md:rounded-2xl shadow-2xl p-1.5 md:p-3 border border-border/50">
        <div className="flex flex-col md:flex-row gap-1 md:gap-0">
          {/* Location */}
          <div className="flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 md:border-r border-border/50">
            <MapPin className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground block mb-0.5">
                Location
              </label>
              <input
                type="text"
                placeholder="City or neighborhood"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Sport */}
          <div className="flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 md:border-r border-border/50">
            <Search className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground block mb-0.5">
                Sport
              </label>
              <Select value={sport} onValueChange={setSport}>
                <SelectTrigger className="w-full border-0 p-0 h-auto shadow-none bg-transparent text-sm focus:ring-0">
                  <SelectValue placeholder="Any sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any sport</SelectItem>
                  {sportTypes.map((s) => (
                    <SelectItem key={s} value={s.toLowerCase()}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* When */}
          <div className="flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 md:border-r border-border/50">
            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground block mb-0.5">
                When
              </label>
              <Select value={when} onValueChange={setWhen}>
                <SelectTrigger className="w-full border-0 p-0 h-auto shadow-none bg-transparent text-sm focus:ring-0">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this-week">This week</SelectItem>
                  <SelectItem value="this-weekend">This weekend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

      {/* Buttons */}
          <div className="flex gap-2 px-2 py-2">
            <Button 
              onClick={handleNearMe}
              variant="outline"
              size="default"
              disabled={isLocating}
              className="h-10 md:h-12 px-3 md:px-4 rounded-xl text-sm"
            >
              <Navigation className={`h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 ${isLocating ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{isLocating ? "Locating..." : "Near me"}</span>
              <span className="sm:hidden">{isLocating ? "..." : "Near"}</span>
            </Button>
            <Button 
              onClick={handleSearch}
              size="default"
              disabled={searchState === "loading"}
              className="flex-1 md:flex-none h-10 md:h-12 px-6 md:px-8 rounded-xl text-sm md:text-base"
            >
              <Search className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {searchState === "loading" && (
        <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-xl border border-border/50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm font-medium">Searching venues in Yerevan...</span>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {searchState === "results" && results.length > 0 && (
        <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-xl border border-border/50 p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase">
              {results.length} football venues found in Yerevan
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs"
              onClick={() => { setSearchState("idle"); setResults([]); }}
            >
              Clear
            </Button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {results.map((venue) => (
              <Link
                key={venue.name}
                to="/venues"
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                    {venue.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{venue.address}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {venue.rating}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {venue.available}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground">{formatPrice(venue.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSearch;
