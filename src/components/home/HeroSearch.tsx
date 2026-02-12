import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Navigation } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sportTypes } from "@/data/constants";
import { toast } from "sonner";

const HeroSearch = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [sport, setSport] = useState("");
  const [when, setWhen] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (sport) params.set("sport", sport);
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
        if (sport) params.set("sport", sport);
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
    <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 md:p-3 border border-border/50">
      <div className="flex flex-col md:flex-row gap-2 md:gap-0">
        {/* Location */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 md:border-r border-border/50">
          <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
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
        <div className="flex-1 flex items-center gap-3 px-4 py-3 md:border-r border-border/50">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
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
        <div className="flex-1 flex items-center gap-3 px-4 py-3 md:border-r border-border/50">
          <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
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
            size="lg"
            disabled={isLocating}
            className="h-12 px-4 rounded-xl"
          >
            <Navigation className={`h-5 w-5 mr-2 ${isLocating ? 'animate-pulse' : ''}`} />
            {isLocating ? "Locating..." : "Near me"}
          </Button>
          <Button 
            onClick={handleSearch}
            size="lg"
            className="w-full md:w-auto h-12 px-8 rounded-xl"
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
