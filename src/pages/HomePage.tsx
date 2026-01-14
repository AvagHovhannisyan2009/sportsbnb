import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Users, Building, ArrowRight, CheckCircle, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-sports.jpg";
import venueFootball from "@/assets/venue-football.jpg";
import venueTennis from "@/assets/venue-tennis.jpg";
import venueBasketball from "@/assets/venue-basketball.jpg";
import venueSwimming from "@/assets/venue-swimming.jpg";
const HomePage = () => {
  const {
    user,
    isLoading
  } = useAuth();
  const howItWorks = [{
    icon: Search,
    title: "Find Your Venue",
    description: "Browse hundreds of sports facilities in your area with real-time availability."
  }, {
    icon: Calendar,
    title: "Book Instantly",
    description: "Reserve your preferred time slot in seconds. No phone calls, no waiting."
  }, {
    icon: Users,
    title: "Play Together",
    description: "Join open games, find teammates, or bring your own team to the court."
  }];
  const forOwners = [{
    icon: Building,
    title: "List Your Venue",
    description: "Add your sports facility to reach thousands of active players."
  }, {
    icon: Calendar,
    title: "Manage Bookings",
    description: "Control your schedule, set pricing, and track reservations in one place."
  }, {
    icon: CheckCircle,
    title: "Grow Revenue",
    description: "Fill empty slots and maximize your facility utilization."
  }];
  const benefits = ["Real-time availability for instant booking", "Secure payments and booking protection", "Verified venues with reviews and ratings", "Join games when you need teammates", "Mobile-friendly for booking on the go", "24/7 customer support"];
  const featuredVenues = [{
    name: "Football Fields",
    image: venueFootball,
    count: "120+ venues"
  }, {
    name: "Tennis Courts",
    image: venueTennis,
    count: "85+ venues"
  }, {
    name: "Basketball Courts",
    image: venueBasketball,
    count: "95+ venues"
  }, {
    name: "Swimming Pools",
    image: venueSwimming,
    count: "60+ venues"
  }];
  return <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Sports facilities" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/40" />
        </div>
        
        <div className="container relative z-10 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground leading-tight mb-6">
              Book sports facilities.
              <br />
              Find your game.
            </h1>
            <p className="text-lg md:text-xl text-secondary-foreground/80 mb-8 leading-relaxed">
              The easiest way to discover and book sports venues, join open games, 
              and connect with players in your area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/discover">
                <Button variant="hero" size="xl">
                  Find a place to play
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/games">
                <Button variant="heroOutline" size="xl" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
                  Browse open games
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Every sport. Every venue.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From football fields to swimming pools, find the perfect place for your next game.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredVenues.map(venue => <Link key={venue.name} to="/discover" className="group relative aspect-[4/3] rounded-xl overflow-hidden">
                <img src={venue.image} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-semibold text-secondary-foreground text-lg">{venue.name}</h3>
                  
                </div>
              </Link>)}
          </div>
        </div>
      </section>

      {/* How It Works - Players */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary mb-2 block">FOR PLAYERS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Book your next game in minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No more phone calls or waiting. Find venues, check availability, and book instantly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {howItWorks.map((step, index) => {
            const Icon = step.icon;
            return <div key={step.title} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Step {index + 1}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>;
          })}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/discover">
              <Button size="lg">
                Start exploring venues
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - Owners */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-sm font-medium text-primary mb-2 block">FOR VENUE OWNERS</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Fill your courts. Grow your business.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Join hundreds of facility owners who use Sportsbnb to manage bookings, 
                reach new customers, and maximize revenue.
              </p>
              
              <div className="space-y-6 mb-8">
                {forOwners.map(item => {
                const Icon = item.icon;
                return <div key={item.title} className="flex gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>;
              })}
              </div>
              
              <Link to="/list-venue">
                <Button size="lg" variant="secondary">
                  List your venue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img src={venueBasketball} alt="Sports venue" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-6 shadow-xl border border-border max-w-xs">
                <div className="text-3xl font-bold text-primary mb-1">+40%</div>
                <p className="text-muted-foreground text-sm">Average increase in bookings for venues on Sportsbnb</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
              Why choose Sportsbnb?
            </h2>
            <p className="text-lg text-secondary-foreground/70 max-w-2xl mx-auto">
              We're building the future of sports booking. Here's what makes us different.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {benefits.map(benefit => <div key={benefit} className="flex items-center gap-3 bg-secondary-foreground/5 rounded-xl p-5">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-secondary-foreground font-medium">{benefit}</span>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to find your game?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of players and venue owners already using Sportsbnb. 
              Your next game is just a few clicks away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isLoading && !user ? <Link to="/signup">
                  <Button variant="hero" size="xl">
                    Get started free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link> : <Link to="/dashboard">
                  <Button variant="hero" size="xl">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>}
              <Link to="/discover">
                <Button variant="outline" size="xl">
                  Explore venues
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default HomePage;