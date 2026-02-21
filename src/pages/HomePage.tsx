import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Calendar, Users, Building, CheckCircle, Shield, Star, Zap, Target, Eye, Heart, Sparkles, Globe, MapPin, Trophy, Bell, Clock, BarChart3, Image, Gamepad2, MessageCircle, CreditCard, Repeat, Layers, Bot, Wifi, Map, UserPlus, Award, TrendingUp, Split, Flame, CloudSun, GitCompare, UserCircle, BrainCircuit, Swords, Activity, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import HeroSearch from "@/components/home/HeroSearch";
import NearbyPlayers from "@/components/home/NearbyPlayers";
import SEOHead, { createWebsiteJsonLd } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-sports-premium.jpg";
import venueFootball from "@/assets/venue-football.jpg";
import venueTennis from "@/assets/venue-tennis.jpg";
import venueBasketball from "@/assets/venue-basketball.jpg";
import venueSwimming from "@/assets/venue-swimming.jpg";
import founderAvag from "@/assets/founder-avag.jpg";
import founderGor from "@/assets/founder-gor.jpg";
import founderIrina from "@/assets/founder-irina.jpg";

// Single reusable fade-up variant — one observer per section
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

// Container that staggers its children via CSS-like variants
const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const sectionTransition = { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const };

const HomePage = () => {
  const { user, isLoading } = useAuth();

  const howItWorks = [
    { icon: Search, title: "Find Your Venue", description: "Browse verified facilities with real-time availability." },
    { icon: Calendar, title: "Book Instantly", description: "Reserve your slot in seconds with secure payment." },
    { icon: Users, title: "Play Together", description: "Join open games or invite friends effortlessly." },
  ];

  const forOwners = [
    { icon: Building, title: "List Your Venue", description: "Reach thousands of active players searching for facilities." },
    { icon: Calendar, title: "Manage Bookings", description: "One dashboard for schedule, pricing, and reservations." },
    { icon: CheckCircle, title: "Grow Revenue", description: "Fill empty time slots. Venues see 40% more bookings on average." },
  ];

  const benefits = [
    { icon: Zap, text: "Instant confirmation" },
    { icon: Shield, text: "Secure payments" },
    { icon: Star, text: "Verified venues" },
    { icon: Users, text: "Find teammates" },
    { icon: Calendar, text: "Real-time availability" },
    { icon: CheckCircle, text: "24/7 support" },
  ];

  const featuredVenues = [
    { name: "Football", image: venueFootball },
    { name: "Tennis", image: venueTennis },
    { name: "Basketball", image: venueBasketball },
    { name: "Swimming", image: venueSwimming },
  ];

  return (
    <div className="flex flex-col">
      <SEOHead
        canonical="/"
        jsonLd={createWebsiteJsonLd()}
      />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="People playing sports"
            className="w-full h-full object-cover scale-105"
            loading="eager"
            fetchPriority="high"
            width={1920}
            height={1080}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="container relative z-10 py-20 md:py-0">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
          >
            <motion.p
              variants={fadeUp}
              transition={sectionTransition}
              className="text-sm md:text-base font-medium tracking-widest uppercase text-white/60 mb-4 md:mb-6"
            >
              The future of grassroots sport
            </motion.p>

            <motion.h1
              variants={fadeUp}
              transition={sectionTransition}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tighter mb-6 md:mb-8"
            >
              Organizing sports{" "}
              <span className="text-primary">shouldn't be this hard.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={sectionTransition}
              className="text-base md:text-xl lg:text-2xl text-white/70 leading-relaxed max-w-2xl mx-auto mb-8 md:mb-12 px-2"
            >
              Find venues, book courts, and join games — all in one place.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={sectionTransition}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 md:mb-20 px-2"
            >
              <Link to="/venues">
                <Button size="xl" className="w-full sm:w-auto rounded-full font-semibold shadow-2xl hover:shadow-primary/25">
                  Find a place to play
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/games">
                <Button
                  variant="ghost"
                  size="xl"
                  className="w-full sm:w-auto rounded-full font-semibold text-white/90 hover:text-white hover:bg-white/10 border border-white/20"
                >
                  Browse open games
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={sectionTransition}
              className="max-w-4xl mx-auto px-1"
            >
              <HeroSearch />
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ── Showcase ── */}
      <section className="py-24 md:py-40 bg-background overflow-hidden">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="space-y-12 md:space-y-20"
          >
            <motion.div variants={fadeUp} transition={sectionTransition} className="text-center">
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tighter leading-[1.05]">
                Your next game
                <br />
                <span className="text-primary">starts here.</span>
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="relative max-w-6xl mx-auto">
              <div className="rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=85"
                  alt="Sports venue aerial"
                  className="w-full aspect-[16/9] object-cover"
                  loading="lazy"
                  decoding="async"
                  width={1600}
                  height={900}
                  draggable={false}
                />
              </div>
              <div className="absolute -inset-8 -z-10 bg-primary/5 rounded-[3rem] blur-3xl" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 md:py-40 bg-background">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} transition={sectionTransition} className="text-center mb-12 md:mb-20">
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3 md:mb-4">
                Popular Categories
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tighter mb-4 md:mb-6">
                Every sport. Every venue.
              </h2>
              <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto">
                From football fields to swimming pools.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {featuredVenues.map((venue) => (
                <Link key={venue.name} to="/venues" className="group relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden block">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                    width={516}
                    height={688}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h3 className="font-semibold text-white text-lg md:text-2xl tracking-tight">{venue.name}</h3>
                  </div>
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works — Players ── */}
      <section className="py-20 md:py-40 bg-muted/20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} transition={sectionTransition} className="text-center mb-12 md:mb-20">
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3 md:mb-4">
                For Players
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tighter mb-4 md:mb-6">
                Book in minutes,<br className="hidden md:block" /> not hours.
              </h2>
              <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto">
                No more phone calls, spreadsheets, or endless group chats.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="grid md:grid-cols-3 gap-8 md:gap-16 mb-12 md:mb-16 max-w-5xl mx-auto">
              {howItWorks.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="text-center">
                    <div className="relative inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-primary/10 text-primary mb-5 md:mb-8">
                      <Icon className="h-7 w-7 md:h-9 md:w-9" strokeWidth={1.5} />
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="text-lg md:text-2xl font-semibold text-foreground mb-2 md:mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
                  </div>
                );
              })}
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="flex flex-col items-center gap-6">
              <Link to="/venues">
                <Button size="lg" className="h-14 px-10 text-base rounded-full">
                  Start exploring venues
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <NearbyPlayers />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── For Venue Owners ── */}
      <section className="py-20 md:py-40 bg-background">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center"
          >
            <motion.div variants={fadeUp} transition={sectionTransition}>
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3 md:mb-4">
                For Venue Owners
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tighter leading-[1.05] mb-5 md:mb-8">
                Fill your courts.
                <br />
                Grow your business.
              </h2>
              <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-12 leading-relaxed max-w-lg">
                Join hundreds of facility owners who manage bookings, reach new customers, and maximize revenue — all in one place.
              </p>

              <div className="space-y-5 md:space-y-8 mb-8 md:mb-12">
                {forOwners.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-5">
                      <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-base md:text-lg mb-1">{item.title}</h3>
                        <p className="text-sm md:text-base text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/list-venue">
                  <Button size="lg" variant="secondary" className="h-14 px-10 text-base rounded-full">
                    List your venue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/for-owners">
                  <Button size="lg" variant="outline" className="h-14 px-10 text-base rounded-full">
                    Learn more
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ ...sectionTransition, duration: 0.8 } as any}
              className="relative hidden lg:block"
            >
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
                <img src={venueBasketball} alt="Sports venue" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="absolute -inset-6 -z-10 bg-primary/5 rounded-[3rem] blur-3xl" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-20 md:py-40 bg-secondary">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} transition={sectionTransition} className="text-center mb-12 md:mb-20">
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3 md:mb-4">
                Why Sportsbnb
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-secondary-foreground tracking-tighter mb-4 md:mb-6">
                Built for players,<br className="hidden md:block" /> by players.
              </h2>
              <p className="text-base md:text-xl text-secondary-foreground/60 max-w-xl mx-auto">
                Every feature designed to make sports simple.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 max-w-4xl mx-auto">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.text} className="flex items-center gap-3 md:gap-4 bg-secondary-foreground/5 hover:bg-secondary-foreground/10 transition-colors rounded-2xl p-4 md:p-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <span className="text-secondary-foreground font-medium text-sm md:text-base">{benefit.text}</span>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Platform Features ── */}
      <section className="py-20 md:py-32 bg-background overflow-hidden">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} transition={sectionTransition} className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tighter">
                35+ features.{" "}
                <span className="text-primary">Zero friction.</span>
              </h2>
            </motion.div>

            {/* Row 1 */}
            <motion.div variants={fadeUp} transition={sectionTransition} className="flex flex-wrap justify-center gap-2 md:gap-3 mb-2 md:mb-3">
              {[
                { icon: Search, label: "Smart Search" },
                { icon: Calendar, label: "Instant Booking" },
                { icon: MapPin, label: "Interactive Map" },
                { icon: Bot, label: "AI Matchmaking" },
                { icon: Trophy, label: "Leaderboards" },
                { icon: Award, label: "XP & Achievements" },
                { icon: Bell, label: "Notifications" },
                { icon: Clock, label: "Waitlist" },
                { icon: Star, label: "Reviews" },
                { icon: TrendingUp, label: "Dynamic Pricing" },
                { icon: BrainCircuit, label: "Smart Scheduling" },
                { icon: CloudSun, label: "Weather" },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="group flex items-center gap-2 rounded-full border border-border/40 bg-muted/20 px-4 py-2.5 md:px-5 md:py-3 hover:bg-primary/10 hover:border-primary/30 transition-colors">
                    <Icon className="h-4 w-4 text-primary shrink-0" strokeWidth={2} />
                    <span className="text-xs md:text-sm font-medium text-foreground whitespace-nowrap">{f.label}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* Row 2 */}
            <motion.div variants={fadeUp} transition={sectionTransition} className="flex flex-wrap justify-center gap-2 md:gap-3 mb-2 md:mb-3">
              {[
                { icon: BarChart3, label: "Analytics" },
                { icon: Image, label: "Photo Gallery" },
                { icon: Layers, label: "Multi-Court" },
                { icon: Gamepad2, label: "Open Games" },
                { icon: Users, label: "Teams" },
                { icon: MessageCircle, label: "Chat" },
                { icon: CreditCard, label: "Payments" },
                { icon: Repeat, label: "Recurring" },
                { icon: Split, label: "Split Payments" },
                { icon: Flame, label: "Streaks" },
                { icon: GitCompare, label: "Venue Compare" },
                { icon: UserCircle, label: "Player Profiles" },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="group flex items-center gap-2 rounded-full border border-border/40 bg-muted/20 px-4 py-2.5 md:px-5 md:py-3 hover:bg-primary/10 hover:border-primary/30 transition-colors">
                    <Icon className="h-4 w-4 text-primary shrink-0" strokeWidth={2} />
                    <span className="text-xs md:text-sm font-medium text-foreground whitespace-nowrap">{f.label}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* Row 3 */}
            <motion.div variants={fadeUp} transition={sectionTransition} className="flex flex-wrap justify-center gap-2 md:gap-3">
              {[
                { icon: UserPlus, label: "Referrals" },
                { icon: Shield, label: "Verified Venues" },
                { icon: Wifi, label: "Real-Time" },
                { icon: Map, label: "Geolocation" },
                { icon: Globe, label: "Multi-Currency" },
                { icon: Sparkles, label: "AI Recommendations" },
                { icon: Building, label: "Owner Dashboard" },
                { icon: Zap, label: "Embeddable Widgets" },
                { icon: Swords, label: "Challenges" },
                { icon: Activity, label: "Live Occupancy" },
                { icon: Lock, label: "Two-Factor Auth" },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="group flex items-center gap-2 rounded-full border border-border/40 bg-muted/20 px-4 py-2.5 md:px-5 md:py-3 hover:bg-primary/10 hover:border-primary/30 transition-colors">
                    <Icon className="h-4 w-4 text-primary shrink-0" strokeWidth={2} />
                    <span className="text-xs md:text-sm font-medium text-foreground whitespace-nowrap">{f.label}</span>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-20 md:py-40 bg-background">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} transition={sectionTransition} className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tighter">
                What drives us.
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="grid md:grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto">
              <div className="bg-muted/20 rounded-3xl p-8 md:p-12">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Target className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">Our Mission</h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  To make it easy for anyone to find, organize, and join sports activity — removing the friction that prevents active people from playing regularly.
                </p>
              </div>

              <div className="bg-muted/20 rounded-3xl p-8 md:p-12">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Eye className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">Our Vision</h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  A world where finding a game is as easy as opening an app — one trusted place to discover, connect, and stay active.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 md:py-40 bg-muted/20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} transition={sectionTransition} className="text-center mb-12 md:mb-20">
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3 md:mb-4">
                What We Stand For
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tighter">
                Our Values
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto">
              {[
                { icon: Globe, title: "Accessibility", desc: "Sport should be for everyone." },
                { icon: Heart, title: "Community", desc: "Sport brings people together." },
                { icon: Sparkles, title: "Simplicity", desc: "Book in seconds, not hours." },
                { icon: Shield, title: "Trust", desc: "Verified venues, secure payments." },
              ].map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="bg-background rounded-2xl md:rounded-3xl p-6 md:p-10 text-center border border-border/40">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 md:mb-6">
                      <Icon className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base md:text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground">{value.desc}</p>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Founders ── */}
      <section className="py-20 md:py-40 bg-background">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} transition={sectionTransition} className="text-center mb-12 md:mb-20">
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3 md:mb-4">
                Meet The Team
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tighter mb-4 md:mb-6">
                The Founders
              </h2>
              <p className="text-base md:text-xl text-muted-foreground max-w-lg mx-auto">
                Three ambitious students on a mission to make sports accessible to everyone.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="grid grid-cols-3 gap-4 md:gap-10 max-w-4xl mx-auto">
              {[
                { img: founderAvag, alt: "Avag Hovhannisyan", name: "Avag H.", role: "Founder", bio: "Driving the vision to connect players with venues seamlessly." },
                { img: founderGor, alt: "Gor Meliksetyan", name: "Gor M.", role: "Co-Founder", bio: "Building products that solve real problems in communities." },
                { img: founderIrina, alt: "Irina Grigoryan", name: "Irina G.", role: "Co-Founder", bio: "Focused on user experience and community building." },
              ].map((founder) => (
                <div key={founder.name} className="text-center">
                  <div className="relative mb-4 md:mb-8 mx-auto w-24 h-24 md:w-44 md:h-44">
                    <img
                      src={founder.img}
                      alt={founder.alt}
                      className="w-full h-full object-cover rounded-full border-2 md:border-4 border-primary/15"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-sm md:text-xl font-semibold text-foreground mb-0.5 md:mb-1 tracking-tight">{founder.name}</h3>
                  <p className="text-primary font-medium text-xs md:text-base mb-1 md:mb-3">{founder.role}</p>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed hidden md:block">{founder.bio}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 md:py-48 bg-background">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ ...sectionTransition, duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tighter mb-5 md:mb-8">
              Ready to find<br />your game?
            </h2>
            <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-md mx-auto">
              Your next game is just a few clicks away.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-20 md:mb-0">
              {!isLoading && !user ? (
                <Link to="/signup">
                  <Button size="xl" className="w-full sm:w-auto rounded-full font-semibold">
                    Get started free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button size="xl" className="w-full sm:w-auto rounded-full font-semibold">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/venues">
                <Button variant="outline" size="xl" className="w-full sm:w-auto rounded-full">
                  Explore venues
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
