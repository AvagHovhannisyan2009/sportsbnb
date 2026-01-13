import { useState } from "react";
import { Search, Filter, X, Plus } from "lucide-react";
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
import GameCard from "@/components/games/GameCard";
import { games, sportTypes } from "@/data/mockData";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";

const GamesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || game.sport === selectedSport;
    const matchesLevel = !selectedLevel || game.level === selectedLevel;

    return matchesSearch && matchesSport && matchesLevel;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSport("");
    setSelectedLevel("");
  };

  const hasActiveFilters = searchQuery || selectedSport || selectedLevel;

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
                  placeholder="Search games or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              
              <div className="hidden md:flex items-center gap-3">
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
                
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[160px] h-12">
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
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
                
                <Link to="/create-game">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Game
                  </Button>
                </Link>
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
                    {[searchQuery, selectedSport, selectedLevel].filter(Boolean).length}
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
                
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="h-12">
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
                  <Button variant="ghost" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear all filters
                  </Button>
                )}
                
                <Link to="/create-game">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Game
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Open Games</h1>
              <p className="text-muted-foreground">
                {filteredGames.length} {filteredGames.length === 1 ? "game" : "games"} looking for players
              </p>
            </div>
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No games found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or create your own game
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
                <Link to="/create-game">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Game
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GamesPage;
