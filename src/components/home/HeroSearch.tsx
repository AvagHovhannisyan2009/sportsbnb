import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Navigation, Loader2, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sportTypes } from "@/data/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const HeroSearch = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [sport, setSport] = useState("");
  const [when, setWhen] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSearch = () => {
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

  return (
    <div className="w-full">
      {/* Desktop/Tablet View */}
      <div className="hidden md:block">
        <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 border border-border/50 transition-all duration-300 hover:shadow-primary/5">
          <div className="flex flex-row">
            {/* Location */}
            <div 
              className={cn(
                "flex-1 flex items-center gap-3 px-4 py-3 border-r border-border/50 rounded-l-xl transition-all duration-200",
                focusedField === "location" && "bg-muted/30"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-colors shrink-0",
                focusedField === "location" ? "bg-primary/10" : "bg-muted/50"
              )}>
                <MapPin className={cn(
                  "h-5 w-5 transition-colors",
                  focusedField === "location" ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground block mb-0.5">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City or neighborhood"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => setFocusedField("location")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/50 text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Sport */}
            <div 
              className={cn(
                "flex-1 flex items-center gap-3 px-4 py-3 border-r border-border/50 transition-all duration-200",
                focusedField === "sport" && "bg-muted/30"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-colors shrink-0",
                focusedField === "sport" ? "bg-primary/10" : "bg-muted/50"
              )}>
                <Search className={cn(
                  "h-5 w-5 transition-colors",
                  focusedField === "sport" ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground block mb-0.5">
                  Sport
                </label>
                <Select 
                  value={sport} 
                  onValueChange={setSport}
                  onOpenChange={(open) => setFocusedField(open ? "sport" : null)}
                >
                  <SelectTrigger className="w-full border-0 p-0 h-auto shadow-none bg-transparent text-sm font-medium focus:ring-0 [&>svg]:hidden">
                    <div className="flex items-center justify-between w-full">
                      <SelectValue placeholder="Any sport" />
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
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
            <div 
              className={cn(
                "flex-1 flex items-center gap-3 px-4 py-3 border-r border-border/50 transition-all duration-200",
                focusedField === "when" && "bg-muted/30"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-colors shrink-0",
                focusedField === "when" ? "bg-primary/10" : "bg-muted/50"
              )}>
                <Calendar className={cn(
                  "h-5 w-5 transition-colors",
                  focusedField === "when" ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground block mb-0.5">
                  When
                </label>
                <Select 
                  value={when} 
                  onValueChange={setWhen}
                  onOpenChange={(open) => setFocusedField(open ? "when" : null)}
                >
                  <SelectTrigger className="w-full border-0 p-0 h-auto shadow-none bg-transparent text-sm font-medium focus:ring-0 [&>svg]:hidden">
                    <div className="flex items-center justify-between w-full">
                      <SelectValue placeholder="Any time" />
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
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
            <div className="flex gap-2 px-2 py-2 items-center">
              <Button 
                onClick={handleNearMe}
                variant="outline"
                size="lg"
                disabled={isLocating}
                className="h-12 px-4 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
              >
                {isLocating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Navigation className="h-5 w-5" />
                )}
                <span className="ml-2 hidden lg:inline">{isLocating ? "Locating..." : "Near me"}</span>
              </Button>
              <Button 
                onClick={handleSearch}
                size="lg"
                className="h-12 px-6 rounded-xl shadow-lg hover:shadow-primary/25 transition-all duration-200"
              >
                <Search className="h-5 w-5" />
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View - Stacked compact layout */}
      <div className="md:hidden">
        <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-xl p-3 border border-border/50 space-y-2">
          {/* Location Input */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="City or neighborhood"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-muted/30 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:bg-muted/50 transition-all"
            />
          </div>

          {/* Sport & When Row */}
          <div className="grid grid-cols-2 gap-2">
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger className="h-11 bg-muted/30 border-border/50 rounded-lg text-sm">
                <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                <SelectValue placeholder="Sport" />
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

            <Select value={when} onValueChange={setWhen}>
              <SelectTrigger className="h-11 bg-muted/30 border-border/50 rounded-lg text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                <SelectValue placeholder="When" />
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

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleNearMe}
              variant="outline"
              disabled={isLocating}
              className="h-11 rounded-lg"
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              {isLocating ? "Locating..." : "Near me"}
            </Button>
            <Button 
              onClick={handleSearch}
              className="h-11 rounded-lg shadow-md"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;