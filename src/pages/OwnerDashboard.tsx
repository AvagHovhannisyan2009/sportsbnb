import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, DollarSign, TrendingUp, Users, Plus, Settings, MapPin, Clock, MoreHorizontal, Loader2, AlertTriangle, ShieldCheck, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerVenues, getVenueImage } from "@/hooks/useVenues";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { StripeConnectBanner } from "@/components/stripe/StripeConnectBanner";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isFullyVerified, isCheckingStatus, canListVenues } = useStripeConnect();
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
    // Check if onboarding is completed
    if (!authLoading && user && profile && !profile.onboarding_completed) {
      navigate("/onboarding/owner");
    }
  }, [user, profile, authLoading, navigate]);

  const { data: myVenues = [], isLoading: venuesLoading } = useOwnerVenues(user?.id);
  
  // Separate active and pending venues
  const activeVenues = myVenues.filter(v => v.is_active);
  const pendingVenues = myVenues.filter(v => !v.is_active);

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  const upcomingReservations = [
    {
      id: "1",
      venue: "Downtown Sports Complex",
      customer: "Mike Johnson",
      date: "Today",
      time: "6:00 PM - 7:00 PM",
      sport: "Football",
      amount: 45,
    },
    {
      id: "2",
      venue: "Downtown Sports Complex",
      customer: "Sarah Williams",
      date: "Today",
      time: "8:00 PM - 9:00 PM",
      sport: "Basketball",
      amount: 45,
    },
    {
      id: "3",
      venue: "Riverside Tennis Club",
      customer: "David Chen",
      date: "Tomorrow",
      time: "10:00 AM - 11:00 AM",
      sport: "Tennis",
      amount: 35,
    },
  ];

  const stats = [
    { label: "Total Revenue", value: "$4,250", change: "+12%", icon: DollarSign },
    { label: "Total Bookings", value: "86", change: "+8%", icon: Calendar },
    { label: "Unique Customers", value: "54", change: "+15%", icon: Users },
    { label: "Occupancy Rate", value: "72%", change: "+5%", icon: TrendingUp },
  ];

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="container py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Owner Dashboard</h1>
              <p className="text-muted-foreground">Manage your venues and track performance.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/add-venue">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Venue
                </Button>
              </Link>
            </div>
          </div>

          {/* Stripe Connect Banner */}
          <div className="mb-6">
            <StripeConnectBanner />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upcoming Reservations */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Upcoming Reservations</CardTitle>
                  <Link to="/owner-reservations" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingReservations.map((reservation, index) => (
                      <div key={reservation.id}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">
                                {reservation.customer}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {reservation.sport}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              {reservation.venue}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{reservation.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{reservation.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-semibold text-foreground">
                              ${reservation.amount}
                            </div>
                          </div>
                        </div>
                        {index < upcomingReservations.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/add-venue" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Venue
                    </Button>
                  </Link>
                  <Link to="/owner-schedule" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Schedule
                    </Button>
                  </Link>
                  <Link to="/settings" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Today's Occupancy */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Occupancy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {myVenues.slice(0, 2).map((venue) => {
                    const occupancy = Math.floor(Math.random() * 40) + 50;
                    return (
                      <div key={venue.id}>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-medium text-foreground truncate pr-2">
                            {venue.name}
                          </span>
                          <span className="text-muted-foreground shrink-0">{occupancy}%</span>
                        </div>
                        <Progress value={occupancy} className="h-2" />
                      </div>
                    );
                  })}
                  {myVenues.length === 0 && (
                    <p className="text-sm text-muted-foreground">No venues yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* My Venues */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">My Venues</h2>
              <Link to="/my-venues" className="text-sm text-primary hover:underline">
                Manage all
              </Link>
            </div>

            {venuesLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              </div>
            ) : myVenues.length > 0 ? (
              <div className="space-y-6">
                {/* Draft Venues (no bank account linked) */}
                {!canListVenues && pendingVenues.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileEdit className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium text-foreground">Draft Venues ({pendingVenues.length})</h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingVenues.map((venue) => (
                        <Card key={venue.id} className="overflow-hidden border-muted bg-muted/20">
                          <div className="aspect-[16/9] relative">
                            <img
                              src={getVenueImage(venue)}
                              alt={venue.name}
                              className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <Badge variant="secondary" className="absolute top-3 left-3 bg-muted text-muted-foreground">
                              <FileEdit className="h-3 w-3 mr-1" />
                              Draft
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-1">{venue.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{venue.address || venue.city}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              Link your bank account to publish this venue
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="font-medium text-foreground">${venue.price_per_hour}</span>
                                <span className="text-muted-foreground">/hr</span>
                              </div>
                              <Link to={`/venue/${venue.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Verification Venues (bank account linked but not verified) */}
                {canListVenues && pendingVenues.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <h3 className="font-medium text-foreground">Pending Verification ({pendingVenues.length})</h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingVenues.map((venue) => (
                        <Card key={venue.id} className="overflow-hidden border-amber-500/30 bg-amber-500/5">
                          <div className="aspect-[16/9] relative">
                            <img
                              src={getVenueImage(venue)}
                              alt={venue.name}
                              className="w-full h-full object-cover opacity-75"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <Badge variant="secondary" className="absolute top-3 left-3 bg-amber-500 text-white">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-1">{venue.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{venue.address || venue.city}</span>
                            </div>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                              {isFullyVerified 
                                ? "Activating venue..." 
                                : "Complete identity verification to make this venue visible"
                              }
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="font-medium text-foreground">${venue.price_per_hour}</span>
                                <span className="text-muted-foreground">/hr</span>
                              </div>
                              <Link to={`/venue/${venue.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Venues */}
                {activeVenues.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <h3 className="font-medium text-foreground">Active Venues ({activeVenues.length})</h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeVenues.map((venue) => (
                        <Card key={venue.id} className="overflow-hidden">
                          <div className="aspect-[16/9] relative">
                            <img
                              src={getVenueImage(venue)}
                              alt={venue.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3">
                              <Button variant="secondary" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-1">{venue.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{venue.address || venue.city}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="font-medium text-foreground">${venue.price_per_hour}</span>
                                <span className="text-muted-foreground">/hr</span>
                              </div>
                              <Link to={`/venue/${venue.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">You haven't added any venues yet.</p>
                <Link to="/add-venue">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Venue
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OwnerDashboard;
