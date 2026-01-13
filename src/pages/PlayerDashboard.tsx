import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, ArrowRight, Star, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { venues, games } from "@/data/mockData";

const PlayerDashboard = () => {
  const upcomingBookings = venues.slice(0, 2).map((venue, index) => ({
    id: `booking-${index}`,
    venue,
    date: index === 0 ? "Today, Jan 13" : "Tomorrow, Jan 14",
    time: index === 0 ? "6:00 PM" : "10:00 AM",
  }));

  const joinedGames = games.slice(0, 2);

  const savedVenues = venues.slice(2, 5);

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h1>
            <p className="text-muted-foreground">Here's what's coming up for you.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Upcoming Bookings", value: "2" },
              { label: "Games Joined", value: "5" },
              { label: "Total Hours Played", value: "24" },
              { label: "Venues Visited", value: "8" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upcoming Bookings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Upcoming Bookings</h2>
                <Link to="/discover" className="text-sm text-primary hover:underline">
                  Book more
                </Link>
              </div>

              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={booking.venue.image}
                            alt={booking.venue.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1 truncate">
                            {booking.venue.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{booking.venue.location}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{booking.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {upcomingBookings.length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                      <Link to="/discover">
                        <Button size="sm">Find a venue</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Joined Games */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Your Games</h2>
                <Link to="/games" className="text-sm text-primary hover:underline">
                  Find more
                </Link>
              </div>

              <div className="space-y-4">
                {joinedGames.map((game) => (
                  <Card key={game.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <Badge variant="secondary" className="mb-2">{game.sport}</Badge>
                          <h3 className="font-semibold text-foreground">{game.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{game.spotsTaken}/{game.spotsTotal}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{game.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{game.time}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Saved Venues */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Saved Venues</h2>
              <Link to="/discover" className="text-sm text-primary hover:underline">
                See all
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {savedVenues.map((venue) => (
                <Link key={venue.id} to={`/venue/${venue.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={venue.image}
                            alt={venue.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground text-sm mb-1 truncate">
                            {venue.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span>{venue.rating}</span>
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            ${venue.price}/hr
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlayerDashboard;
