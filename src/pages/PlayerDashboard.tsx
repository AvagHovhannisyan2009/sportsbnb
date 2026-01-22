import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, MapPin, Star, Users, X, Loader2, Plus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { getCustomerPrice, formatPrice } from "@/lib/pricing";
import { supabase } from "@/integrations/supabase/client";
import { useUserGames } from "@/hooks/useGames";
import { useVenues, getVenueImage } from "@/hooks/useVenues";
import { format } from "date-fns";
import { toast } from "sonner";

interface Booking {
  id: string;
  venue_id: string;
  venue_name: string;
  booking_date: string;
  booking_time: string;
  total_price: number;
  status: string;
  payment_intent_id?: string;
}

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: userGames, isLoading: gamesLoading } = useUserGames(user?.id);
  const { data: allVenues = [] } = useVenues();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
    if (!authLoading && user && profile && !profile.onboarding_completed) {
      navigate("/onboarding/player");
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];

      // Fetch upcoming bookings
      const { data: upcomingData, error: upcomingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .gte("booking_date", today)
        .order("booking_date", { ascending: true });

      if (upcomingError) {
        console.error("Error fetching bookings:", upcomingError);
      } else {
        setBookings(upcomingData || []);
      }

      // Fetch past bookings
      const { data: pastData, error: pastError } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .lt("booking_date", today)
        .order("booking_date", { ascending: false })
        .limit(20);

      if (pastError) {
        console.error("Error fetching past bookings:", pastError);
      } else {
        setPastBookings(pastData || []);
      }

      setIsLoadingBookings(false);
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingBookingId(bookingId);
    try {
      const { data, error } = await supabase.functions.invoke("refund-booking", {
        body: { bookingId },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(t('dashboard.bookingCancelled'));
        setBookings(bookings.filter((b) => b.id !== bookingId));
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(t('booking.cancel.error'));
    } finally {
      setCancellingBookingId(null);
    }
  };

  // Combine hosted and joined games
  const allUserGames = [
    ...(userGames?.hosted || []).map(g => ({ ...g, isHost: true })),
    ...(userGames?.joined || []).map(g => ({ ...g, isHost: false })),
  ].sort((a, b) => new Date(a.game_date).getTime() - new Date(b.game_date).getTime());

  // Get upcoming games (future dates only)
  const upcomingGames = allUserGames.filter(
    g => new Date(g.game_date) >= new Date(new Date().toDateString()) && g.status === "open"
  ).slice(0, 3);

  // Get past games
  const pastGames = allUserGames.filter(
    g => new Date(g.game_date) < new Date(new Date().toDateString())
  ).slice(0, 10);

  // Get recent venues from user's bookings
  const recentVenueIds = [...new Set(bookings.map(b => b.venue_id))];
  const recentVenues = allVenues.filter(v => recentVenueIds.includes(v.id)).slice(0, 3);
  const savedVenues = recentVenues.length > 0 ? recentVenues : allVenues.slice(0, 3);

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  const totalGames = (userGames?.hosted?.length || 0) + (userGames?.joined?.length || 0);

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('dashboard.welcome')}{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-muted-foreground">{t('dashboard.overview')}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: t('dashboard.upcomingBookings'), value: bookings.length.toString() },
              { label: t('common.games'), value: totalGames.toString() },
              { label: t('games.hostedGames'), value: (userGames?.hosted?.length || 0).toString() },
              { label: t('games.joinedGames'), value: (userGames?.joined?.length || 0).toString() },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs for Upcoming and History */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming">{t('common.upcoming')}</TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                {t('common.past')}
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Tab */}
            <TabsContent value="upcoming" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Upcoming Bookings */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">{t('dashboard.upcomingBookings')}</h2>
                    <Link to="/venues" className="text-sm text-primary hover:underline">
                      {t('dashboard.findVenue')}
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {isLoadingBookings ? (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                          <p className="text-muted-foreground">{t('common.loading')}</p>
                        </CardContent>
                      </Card>
                    ) : bookings.length > 0 ? (
                      bookings.slice(0, 3).map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                                <img
                                  src={`https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop`}
                                  alt={booking.venue_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <h3 className="font-semibold text-foreground mb-1 truncate">
                                    {booking.venue_name}
                                  </h3>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                        disabled={cancellingBookingId === booking.id}
                                      >
                                        {cancellingBookingId === booking.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <X className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>{t('dashboard.cancelBooking')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          {t('dashboard.cancelBookingConfirm')}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleCancelBooking(booking.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          {t('common.confirm')}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {format(new Date(booking.booking_date), "EEE, MMM d")}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{booking.booking_time}</span>
                                  </div>
                                </div>
                                <div className="mt-1 text-sm font-medium text-foreground">
                                  ֏{booking.total_price.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-muted-foreground mb-4">{t('dashboard.noUpcomingBookings')}</p>
                          <Link to="/venues">
                            <Button size="sm">{t('dashboard.findVenue')}</Button>
                          </Link>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Your Games */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">{t('games.myGames')}</h2>
                    <Link to="/games" className="text-sm text-primary hover:underline">
                      {t('dashboard.findGame')}
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {gamesLoading ? (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                          <p className="text-muted-foreground">{t('common.loading')}</p>
                        </CardContent>
                      </Card>
                    ) : upcomingGames.length > 0 ? (
                      upcomingGames.map((game) => (
                        <Link key={game.id} to={`/game/${game.id}`}>
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary">{game.sport}</Badge>
                                    {game.isHost && (
                                      <Badge variant="outline">{t('common.host')}</Badge>
                                    )}
                                  </div>
                                  <h3 className="font-semibold text-foreground">{game.title}</h3>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Users className="h-4 w-4" />
                                  <span>{game.max_players}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{format(new Date(game.game_date), "EEE, MMM d")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{game.game_time}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{game.location}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-muted-foreground mb-4">{t('dashboard.noUpcomingGames')}</p>
                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Link to="/games">
                              <Button size="sm" variant="outline">{t('dashboard.findGame')}</Button>
                            </Link>
                            <Link to="/create-game">
                              <Button size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                {t('dashboard.createGame')}
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Past Bookings */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">{t('dashboard.pastBookings')}</h2>
                  <div className="space-y-4">
                    {pastBookings.length > 0 ? (
                      pastBookings.map((booking) => (
                        <Card key={booking.id} className="opacity-80">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                                <img
                                  src={`https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop`}
                                  alt={booking.venue_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground mb-1 truncate">
                                  {booking.venue_name}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{format(new Date(booking.booking_date), "MMM d, yyyy")}</span>
                                  </div>
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                  ֏{booking.total_price.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-muted-foreground">{t('dashboard.noUpcomingBookingsDesc')}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Past Games */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">{t('games.pastGames')}</h2>
                  <div className="space-y-4">
                    {pastGames.length > 0 ? (
                      pastGames.map((game) => (
                        <Card key={game.id} className="opacity-80">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary">{game.sport}</Badge>
                                  {game.isHost && (
                                    <Badge variant="outline">{t('common.host')}</Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-foreground">{game.title}</h3>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(game.game_date), "MMM d, yyyy")}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-muted-foreground">{t('dashboard.noUpcomingGamesDesc')}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Recommended Venues */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">{t('common.recommended')}</h2>
              <Link to="/venues" className="text-sm text-primary hover:underline">
                {t('common.seeAll')}
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {savedVenues.map((venue) => (
                <Link key={venue.id} to={`/venue/${venue.id}`}>
                  <Card className="hover:shadow-md transition-shadow overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={getVenueImage(venue)}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 truncate">{venue.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{venue.city}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-medium">{venue.rating}</span>
                        </div>
                        <span className="text-sm font-medium">{formatPrice(getCustomerPrice(venue.price_per_hour))}/{t('common.hour')}</span>
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
