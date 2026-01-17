import { useState, useMemo } from "react";
import { Search, Filter, MapPin, X, Loader2 } from "lucide-react";
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
import VenueCard from "@/components/venues/VenueCard";
import { sportTypes } from "@/data/constants";
import Layout from "@/components/layout/Layout";
import { useVenues, getVenueImage } from "@/hooks/useVenues";
import { useAuth } from "@/hooks/useAuth";

const DiscoverPage = () => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: venues = [], isLoading } = useVenues();

  // Get unique cities from venues
  const cities = useMemo(() => {
    const citySet = new Set(venues.map(v => v.city).filter(Boolean));
    return Array.from(citySet).sort();
  }, [venues]);

  // Auto-set city from user profile on first load
  useState(() => {
    if (profile?.city && !selectedCity) {
      const profileCity = profile.city.toLowerCase();
      const matchingCity = cities.find(c => c.toLowerCase() === profileCity);
      if (matchingCity) {
        setSelectedCity(matchingCity);
      }
    }
  });

  const filteredVenues = venues.filter((venue) => {
    const location = venue.address || venue.city;
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || venue.sports.includes(selectedSport);
    const matchesPrice =
      !selectedPrice ||
      (selectedPrice === "low" && venue.price_per_hour < 40) ||
      (selectedPrice === "medium" && venue.price_per_hour >= 40 && venue.price_per_hour < 55) ||
      (selectedPrice === "high" && venue.price_per_hour >= 55);
    const matchesCity = !selectedCity || venue.city === selectedCity;

    return matchesSearch && matchesSport && matchesPrice && matchesCity;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSport("");
    setSelectedPrice("");
    setSelectedCity("");
  };

  const hasActiveFilters = searchQuery || selectedSport || selectedPrice || selectedCity;

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        {/* Search Header */}
        <div className="bg-card border-b border-border sticky top-16 z-40">
          <div className="container py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search venues or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              
              <div className="hidden md:flex items-center gap-3">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-[160px] h-12">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="w-[160px] h-12">
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
                
                <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                  <SelectTrigger className="w-[160px] h-12">
                    <SelectValue placeholder="Price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Under $40/hr</SelectItem>
                    <SelectItem value="medium">$40 - $55/hr</SelectItem>
                    <SelectItem value="high">$55+/hr</SelectItem>
                  </SelectContent>
                </Select>
                
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-2 h-5 w-5 p-0 justify-center">
                    {[searchQuery, selectedSport, selectedPrice, selectedCity].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
            
            {/* Mobile Filters */}
            {showFilters && (
              <div className="md:hidden pt-4 flex flex-col gap-3">
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="h-12">
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
                
                <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Under $40/hr</SelectItem>
                    <SelectItem value="medium">$40 - $55/hr</SelectItem>
                    <SelectItem value="high">$55+/hr</SelectItem>
                  </SelectContent>
                </Select>
                
                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Venues</h1>
              <p className="text-muted-foreground">
                {filteredVenues.length} {filteredVenues.length === 1 ? "venue" : "venues"} available
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading venues...</p>
            </div>
          ) : filteredVenues.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  id={venue.id}
                  name={venue.name}
                  image={getVenueImage(venue)}
                  location={venue.address || venue.city}
                  sports={venue.sports}
                  price={venue.price_per_hour}
                  rating={venue.rating}
                  reviewCount={venue.review_count}
                  available={venue.is_active}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No venues found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DiscoverPage;
