import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Users, Building, ArrowRight, CheckCircle, Shield, Star, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import HeroSearch from "@/components/home/HeroSearch";
import heroImage from "@/assets/hero-sports-premium.jpg";
import venueFootball from "@/assets/venue-football.jpg";
import venueTennis from "@/assets/venue-tennis.jpg";
import venueBasketball from "@/assets/venue-basketball.jpg";
import venueSwimming from "@/assets/venue-swimming.jpg";

const HomePage = () => {
  const { user, isLoading } = useAuth();

  const howItWorks = [
    {
      icon: Search,
      title: "Find Your Venue",
      description: "Browse verified sports facilities with real-time availability. Filter by sport, location, and amenities.",
    },
    {
      icon: Calendar,
      title: "Book Instantly",
      description: "Reserve your slot in seconds. Secure payment, instant confirmation. No phone calls needed.",
    },
    {
      icon: Users,
      title: "Play Together",
      description: "Join open games nearby or invite friends. Build your sports community effortlessly.",
    },
  ];

  const forOwners = [
    {
      icon: Building,
      title: "List Your Venue",
      description: "Reach thousands of active players searching for courts, fields, and facilities.",
    },
    {
      icon: Calendar,
      title: "Manage Bookings",
      description: "One dashboard for schedule, pricing, and reservations. Save hours every week.",
    },
    {
      icon: CheckCircle,
      title: "Grow Revenue",
      description: "Fill empty time slots automatically. Our venues see 40% more bookings on average.",
    },
  ];

  const benefits = [
    { icon: Zap, text: "Instant booking confirmation" },
    { icon: Shield, text: "Secure payment protection" },
    { icon: Star, text: "Verified venues with reviews" },
    { icon: Users, text: "Join games, find teammates" },
    { icon: Calendar, text: "Real-time availability" },
    { icon: CheckCircle, text: "24/7 customer support" },
  ];

  const featuredVenues = [
    { name: "Football", image: venueFootball },
    { name: "Tennis", image: venueTennis },
    { name: "Basketball", image: venueBasketball },
    { name: "Swimming", image: venueSwimming },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="People playing sports together"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>

        <div className="container relative z-10 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center mb-12">

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
              Organizing sports
              <br />
              <span className="text-primary">shouldn't be this hard.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
              Find venues, book courts, and join games in minutes—not hours. 
              Sportsbnb brings the chaos of organizing sports into one simple platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/venues">
                <Button 
                  size="xl" 
                  className="w-full sm:w-auto h-16 px-10 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-primary/25"
                >
                  Find a place to play
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/games">
                <Button 
                  variant="outline" 
                  size="xl" 
                  className="w-full sm:w-auto h-16 px-10 text-lg font-semibold rounded-xl bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                >
                  Browse open games
                </Button>
              </Link>
            </div>
          </div>

          {/* Smart Search Bar */}
          <div className="max-w-4xl mx-auto">
            <HeroSearch />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
              Popular Categories
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
              Every sport. Every venue.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From football fields to swimming pools, find the perfect place for your next game.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredVenues.map((venue) => (
              <Link
                key={venue.name}
                to="/venues"
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden"
              >
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-semibold text-white text-xl">{venue.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Players */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
              For Players
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
              Book your next game in minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No more phone calls, spreadsheets, or endless group chats. Just find, book, and play.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="text-center">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary mb-6">
                    <Icon className="h-10 w-10" />
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link to="/venues">
              <Button size="lg" className="h-14 px-10 text-base rounded-xl">
                Start exploring venues
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - Owners */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div>
              <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
                For Venue Owners
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
                Fill your courts.
                <br />
                Grow your business.
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Join hundreds of facility owners who use Sportsbnb to manage bookings, 
                reach new customers, and maximize revenue—all in one place.
              </p>

              <div className="space-y-6 mb-10">
                {forOwners.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-5">
                      <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg mb-1">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link to="/list-venue">
                <Button size="lg" variant="secondary" className="h-14 px-10 text-base rounded-xl">
                  List your venue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={venueBasketball}
                  alt="Sports venue"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28 bg-secondary">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
              Why Sportsbnb
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-foreground mb-5 tracking-tight">
              Built for players, by players
            </h2>
            <p className="text-lg text-secondary-foreground/70 max-w-2xl mx-auto">
              Every feature designed to make booking and playing sports as simple as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.text}
                  className="flex items-center gap-4 bg-secondary-foreground/5 hover:bg-secondary-foreground/10 transition-colors rounded-2xl p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-secondary-foreground font-medium text-lg">{benefit.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Ready to find your game?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join thousands of players and venue owners already using Sportsbnb. 
              Your next game is just a few clicks away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isLoading && !user ? (
                <Link to="/signup">
                  <Button size="xl" className="w-full sm:w-auto h-16 px-10 text-lg font-semibold rounded-xl">
                    Get started free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button size="xl" className="w-full sm:w-auto h-16 px-10 text-lg font-semibold rounded-xl">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/venues">
                <Button variant="outline" size="xl" className="w-full sm:w-auto h-16 px-10 text-lg rounded-xl">
                  Explore venues
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
