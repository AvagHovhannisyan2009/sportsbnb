import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, X, Plus, Loader2, Calendar, MapPin, Users, Clock, LayoutGrid, Map, Navigation, MapPinOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { sportTypes } from "@/data/constants";
import Layout from "@/components/layout/Layout";
import { useGames, type Game } from "@/hooks/useGames";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import GamesMapView from "@/components/games/GamesMapView";
import { toast } from "sonner";

type GameWithDistance = Game & { distance?: number | null };

const GameCard = ({ game }: { game: GameWithDistance }) => {
  const spotsLeft = game.max_players - (game.participant_count || 0);
  const isFull = spotsLeft <= 0;

  const levelColors: Record<string, string> = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    all: "bg-primary/10 text-primary",
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{game.sport}</Badge>
            <Badge className={levelColors[game.skill_level] || levelColors.all}>
              {game.skill_level === "all" ? "All levels" : game.skill_level}
            </Badge>
          </div>
          <h3 className="font-semibold text-foreground text-lg">{game.title}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-lg font-semibold ${isFull ? "text-muted-foreground" : "text-primary"}`}>
            {spotsLeft} spots
          </div>
          <div className="text-sm text-muted-foreground">of {game.max_players} left</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{game.location}</span>
          {game.distance !== null && game.distance !== undefined && (
            <Badge variant="outline" className="ml-auto text-xs">
              {game.distance < 1 
                ? `${Math.round(game.distance * 1000)}m away`
                : `${game.distance.toFixed(1)}km away`
              }
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(game.game_date), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{game.game_time}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Hosted by {game.host?.full_name || "Anonymous"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to={`/game/${game.id}`} className="flex-1">
          <Button variant={isFull ? "secondary" : "default"} className="w-full" disabled={isFull}>
            {isFull ? "Full" : "Request to Join"}
          </Button>
        </Link>
        <Link to={`/game/${game.id}`}>
          <Button variant="outline">Details</Button>
        </Link>
      </div>
    </div>
  );
};

const GamesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const { data: games = [], isLoading } = useGames({
    sport: selectedSport || undefined,
    level: selectedLevel || undefined,
    search: searchQuery || undefined,
    userLocation,
  });

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
        toast.success("Showing games near you!");
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information unavailable");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out");
            break;
          default:
            toast.error("Unable to get your location");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setUserLocation(null);
    toast.info("Location filter cleared");
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSport("");
    setSelectedLevel("");
    setUserLocation(null);
  };

  const hasActiveFilters = searchQuery || selectedSport || selectedLevel || userLocation;

  const handleCreateGame = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/create-game");
  };

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        {/* Search Header */}
        <div className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-16 md:top-16 z-40">
          <div className="container py-3 md:py-4">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              {/* Search Input */}
              <div className="relative flex-1 group">
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/10 opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-200" />
                <div className="relative flex items-center h-11 md:h-12 bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 group-focus-within:border-primary/50">
                  <Search className="ml-3 md:ml-4 h-4 w-4 md:h-5 md:w-5 text-muted-foreground shrink-0" />
                  <input
                    placeholder="Search games or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 h-full px-2 md:px-3 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-sm md:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="pr-3 md:pr-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Desktop Filters */}
              <div className="hidden md:flex items-center gap-2">
                {userLocation ? (
                  <Button 
                    variant="secondary" 
                    className="h-11 md:h-12 rounded-xl"
                    onClick={clearLocation}
                  >
                    <MapPinOff className="h-4 w-4 mr-2" />
                    Near Me
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="h-11 md:h-12 rounded-xl"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                  >
                    {isLocating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4 mr-2" />
                    )}
                    Near Me
                  </Button>
                )}
                
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="w-[140px] h-11 md:h-12 rounded-xl">
                    <SelectValue placeholder="Sport type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportTypes.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[140px] h-11 md:h-12 rounded-xl">
                    <SelectValue placeholder="Skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="all">All levels</SelectItem>
                  </SelectContent>
                </Select>
                
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-xl">
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
                
                <Button onClick={handleCreateGame} className="rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Game
                </Button>
              </div>
              
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                className="md:hidden h-11 rounded-xl"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-2 h-5 w-5 p-0 justify-center rounded-full">
                    {[searchQuery, selectedSport, selectedLevel, userLocation].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
            
            {/* Mobile Filters Panel */}
            {showFilters && (
              <div className="md:hidden pt-3 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                {userLocation ? (
                  <Button 
                    variant="secondary" 
                    className="h-11 w-full rounded-xl"
                    onClick={clearLocation}
                  >
                    <MapPinOff className="h-4 w-4 mr-2" />
                    Near Me (Active)
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="h-11 w-full rounded-xl"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                  >
                    {isLocating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4 mr-2" />
                    )}
                    Games Near Me
                  </Button>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sportTypes.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="all">All levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} className="rounded-xl">
                    <X className="h-4 w-4 mr-1" />
                    Clear all filters
                  </Button>
                )}
                
                <Button className="w-full rounded-xl" onClick={handleCreateGame}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Game
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Results - Pickup Games Listing */}
        <main className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Pickup Games & Sports Matches</h1>
              <p className="text-muted-foreground">
                {games.length} {games.length === 1 ? "game" : "games"} looking for players near you
              </p>
            </div>
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as "grid" | "map")}>
              <ToggleGroupItem value="grid" aria-label="View games as grid">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="map" aria-label="View games on map">
                <Map className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading games...</p>
            </div>
          ) : games.length > 0 ? (
            viewMode === "map" ? (
              <GamesMapView games={games} />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">No games found 😔</h2>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your filters or host your own game"
                  : "Be the first to host a game and find players!"
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
                <Button onClick={handleCreateGame}>
                  <Plus className="h-4 w-4 mr-2" />
                  Host a Game
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default GamesPage;
