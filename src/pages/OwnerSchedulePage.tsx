import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerVenues, getVenueImage } from "@/hooks/useVenues";

const OwnerSchedulePage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: myVenues = [], isLoading: venuesLoading } = useOwnerVenues(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || venuesLoading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Manage Schedule</h1>
            <p className="text-muted-foreground">
              Set availability, block dates, and manage operating hours for your venues.
            </p>
          </div>

          {/* Venue List */}
          {myVenues.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No venues to manage</h3>
                <p className="text-muted-foreground mb-6">
                  Add a venue first to manage its schedule and availability.
                </p>
                <Link to="/add-venue">
                  <Button>Add Venue</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Select a venue to manage its schedule:
              </p>
              {myVenues.map((venue) => (
                <Link key={venue.id} to={`/venue/${venue.id}/availability`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={getVenueImage(venue)}
                            alt={venue.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1">{venue.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{venue.address || venue.city}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {venue.is_active ? (
                              <span className="inline-flex items-center text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                Draft
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OwnerSchedulePage;
