import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Search, Calendar, Users, Building, CheckCircle, Shield, Star,
  Zap, Target, Eye, Heart, Sparkles, Globe, MapPin, Trophy, Bell, Clock,
  BarChart3, Image, Gamepad2, MessageCircle, CreditCard, Repeat, Layers,
  Bot, Wifi, Map, UserPlus, Award, TrendingUp, Split, Flame, CloudSun,
  GitCompare, UserCircle, BrainCircuit, Swords, Activity, Lock, Play,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import HeroSearch from "@/components/home/HeroSearch";
import NearbyPlayers from "@/components/home/NearbyPlayers";
import SEOHead, { createWebsiteJsonLd } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-landing.jpg";
import venueFootball from "@/assets/venue-football.jpg";
import venueTennis from "@/assets/venue-tennis.jpg";
import venueBasketball from "@/assets/venue-basketball.jpg";
import venueSwimming from "@/assets/venue-swimming.jpg";
import founderAvag from "@/assets/founder-avag.jpg";
import founderGor from "@/assets/founder-gor.jpg";
import founderIrina from "@/assets/founder-irina.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const sectionTransition = { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const };

const HomePage = () => {
  const { user, isLoading } = useAuth();

  const stats = [
    { value: "500+", label: "Venues Listed" },
    { value: "15K+", label: "Games Played" },
    { value: "40K+", label: "Active Players" },
    { value: "4.8★", label: "Average Rating" },
  ];

  const howItWorks = [
    { icon: Search, title: "Find Your Venue", description: "Browse verified facilities with real-time availability and transparent pricing.", step: "01" },
    { icon: Calendar, title: "Book Instantly", description: "Reserve your slot in seconds with secure payment — no phone calls needed.", step: "02" },
    { icon: Users, title: "Play Together", description: "Join open games, create teams, and grow your sports network effortlessly.", step: "03" },
  ];

  const forOwners = [
    { icon: Building, title: "List Your Venue", description: "Reach thousands of active players searching for facilities in your area." },
    { icon: BarChart3, title: "Smart Dashboard", description: "One place for schedule, pricing, analytics, and customer management." },
    { icon: TrendingUp, title: "Grow Revenue", description: "Fill empty time slots automatically. Venues see 40% more bookings on average." },
  ];

  const benefits = [
    { icon: Zap, title: "Instant Confirmation", desc: "Book and get confirmed in under 10 seconds." },
    { icon: Shield, title: "Secure Payments", desc: "PCI-compliant processing with refund protection." },
    { icon: Star, title: "Verified Venues", desc: "Every facility reviewed and quality-checked." },
    { icon: Users, title: "Find Teammates", desc: "AI-powered matchmaking for your skill level." },
    { icon: Calendar, title: "Real-Time Availability", desc: "See open slots updated live, never double-booked." },
    { icon: Bot, title: "AI Recommendations", desc: "Smart suggestions based on your sport and location." },
  ];

  const featuredVenues = [
    { name: "Football", image: venueFootball, count: "120+ venues" },
    { name: "Tennis", image: venueTennis, count: "85+ venues" },
    { name: "Basketball", image: venueBasketball, count: "95+ venues" },
    { name: "Swimming", image: venueSwimming, count: "60+ venues" },
  ];

  const testimonials = [
    { name: "Arman K.", role: "Football Player", text: "Found my regular team through Sportsbnb. We play every Tuesday now — booking takes 30 seconds.", rating: 5 },
    { name: "Lusine M.", role: "Venue Owner", text: "Our bookings increased by 45% in the first month. The dashboard is incredibly easy to use.", rating: 5 },
    { name: "Davit S.", role: "Basketball Player", text: "Best sports platform I've used. The AI matchmaking found me players at my exact skill level.", rating: 5 },
  ];

  const featureRows = [
    [
      { icon: Search, label: "Smart Search" }, { icon: Calendar, label: "Instant Booking" },
      { icon: MapPin, label: "Interactive Map" }, { icon: Bot, label: "AI Matchmaking" },
      { icon: Trophy, label: "Leaderboards" }, { icon: Award, label: "XP & Achievements" },
      { icon: Bell, label: "Notifications" }, { icon: Clock, label: "Waitlist" },
      { icon: Star, label: "Reviews" }, { icon: TrendingUp, label: "Dynamic Pricing" },
      { icon: BrainCircuit, label: "Smart Scheduling" }, { icon: CloudSun, label: "Weather" },
    ],
    [
      { icon: BarChart3, label: "Analytics" }, { icon: Image, label: "Photo Gallery" },
      { icon: Layers, label: "Multi-Court" }, { icon: Gamepad2, label: "Open Games" },
      { icon: Users, label: "Teams" }, { icon: MessageCircle, label: "Chat" },
      { icon: CreditCard, label: "Payments" }, { icon: Repeat, label: "Recurring" },
      { icon: Split, label: "Split Payments" }, { icon: Flame, label: "Streaks" },
      { icon: GitCompare, label: "Venue Compare" }, { icon: UserCircle, label: "Player Profiles" },
    ],
    [
      { icon: UserPlus, label: "Referrals" }, { icon: Shield, label: "Verified Venues" },
      { icon: Wifi, label: "Real-Time" }, { icon: Map, label: "Geolocation" },
      { icon: Globe, label: "Multi-Currency" }, { icon: Sparkles, label: "AI Recommendations" },
      { icon: Building, label: "Owner Dashboard" }, { icon: Zap, label: "Embeddable Widgets" },
      { icon: Swords, label: "Challenges" }, { icon: Activity, label: "Live Occupancy" },
      { icon: Lock, label: "Two-Factor Auth" },
    ],
  ];

  return (
    <div className="flex flex-col">
      <SEOHead
        canonical="/"
        jsonLd={createWebsiteJsonLd()}
      />
      <Helmet>
        <link rel="preload" as="image" href={heroImage} />
      </Helmet>

      {/* ── Hero ── */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Modern sports complex at golden hour with athletes playing football, tennis, and basketball"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            width={1920}
            height={1080}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        <div className="container relative z-10 py-16 md:py-0">
          <motion.div
            className="max-w-5xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
          >
            {/* Trust badge */}
            <motion.div
              variants={fadeUp}
              transition={sectionTransition}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-4 py-2 mb-6 md:mb-8"
            >
              <div className="flex -space-x-2">
                {[founderAvag, founderGor, founderIrina].map((img, i) => (
                  <img key={i} src={img} alt="" className="w-6 h-6 rounded-full border-2 border-black/50 object-cover" />
                ))}
              </div>
              <span className="text-xs md:text-sm font-medium text-primary-foreground/90">
                Trusted by 40,000+ players
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={sectionTransition}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-[0.92] tracking-tighter mb-5 md:mb-8"
            >
              Book courts.
              <br />
              <span className="text-primary">Find games.</span>
              <br />
              Play more.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={sectionTransition}
              className="text-base md:text-xl lg:text-2xl text-primary-foreground/60 leading-relaxed max-w-2xl mx-auto mb-8 md:mb-12 px-4"
            >
              The all-in-one platform for grassroots sports — venue booking, team management, 
              and game matchmaking in a single app.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={sectionTransition}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 md:mb-12 px-4"
            >
              <Link to="/venues">
                <Button size="xl" className="w-full sm:w-auto rounded-full font-semibold shadow-2xl hover:shadow-primary/25 gap-2">
                  Start playing today
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/for-owners">
                <Button
                  variant="ghost"
                  size="xl"
                  className="w-full sm:w-auto rounded-full font-semibold text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 border border-primary-foreground/20"
                >
                  <Building className="h-5 w-5 mr-2" />
                  I'm a venue owner
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:block">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="w-6 h-10 rounded-full border-2 border-primary-foreground/20 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-primary-foreground/40 rounded-full animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ── Social Proof Stats ── */}
      <section className="relative z-10 -mt-12 md:-mt-16 pb-8 md:pb-0">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={sectionTransition}
            className="bg-card border border-border/50 rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-10 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-4xl font-bold text-primary tracking-tight">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 md:py-36 bg-background">
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
                From football fields to swimming pools — find the perfect spot to play.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {featuredVenues.map((venue) => (
                <Link key={venue.name} to="/venues" className="group relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden block">
                  <img
                    src={venue.image}
                    alt={`${venue.name} venues on Sportsbnb`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                    width={516}
                    height={688}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h3 className="font-semibold text-primary-foreground text-lg md:text-2xl tracking-tight">{venue.name}</h3>
                    <p className="text-primary-foreground/60 text-xs md:text-sm mt-1">{venue.count}</p>
                  </div>
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 md:py-36 bg-muted/20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} transition={sectionTransition} className="text-center mb-12 md:mb-20">
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3 md:mb-4">
                How It Works
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tighter mb-4 md:mb-6">
                Book in minutes,<br className="hidden md:block" /> not hours.
              </h2>
              <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto">
                No more phone calls, spreadsheets, or endless group chats.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-12 md:mb-16">
              {howItWorks.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="relative bg-card border border-border/50 rounded-2xl md:rounded-3xl p-6 md:p-10 text-center group hover:border-primary/30 transition-colors">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 text-primary mx-auto mb-5 md:mb-6 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="flex flex-col items-center gap-6">
              <Link to="/venues">
                <Button size="lg" className="h-14 px-10 text-base rounded-full gap-2">
                  Start exploring venues
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <NearbyPlayers />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Why Sportsbnb ── */}
      <section className="py-20 md:py-36 bg-background">
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
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tighter mb-4 md:mb-6">
                Built for players,<br className="hidden md:block" /> by players.
              </h2>
              <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto">
                Every feature designed to eliminate friction from sport.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.title} className="bg-card border border-border/40 rounded-2xl p-6 md:p-8 group hover:border-primary/30 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── For Venue Owners ── */}
      <section className="py-20 md:py-36 bg-secondary">
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
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground tracking-tighter leading-[1.05] mb-5 md:mb-8">
                Fill your courts.
                <br />
                Grow your business.
              </h2>
              <p className="text-base md:text-lg text-secondary-foreground/60 mb-8 md:mb-12 leading-relaxed max-w-lg">
                Join hundreds of facility owners who manage bookings, reach new customers, and maximize revenue — all from a single dashboard.
              </p>

              <div className="space-y-5 md:space-y-6 mb-8 md:mb-12">
                {forOwners.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-5">
                      <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/15 flex items-center justify-center text-primary">
                        <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary-foreground text-base md:text-lg mb-1">{item.title}</h3>
                        <p className="text-sm md:text-base text-secondary-foreground/60">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/list-venue">
                  <Button size="lg" className="h-14 px-10 text-base rounded-full gap-2">
                    List your venue free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/for-owners">
                  <Button size="lg" variant="outline" className="h-14 px-10 text-base rounded-full border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10">
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
                <img src={venueBasketball} alt="Basketball venue interior" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="absolute -inset-6 -z-10 bg-primary/10 rounded-[3rem] blur-3xl" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 md:py-36 bg-background">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} transition={sectionTransition} className="text-center mb-12 md:mb-20">
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3 md:mb-4">
                What Players Say
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tighter">
                Loved by the community.
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-card border border-border/40 rounded-2xl md:rounded-3xl p-6 md:p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-sm md:text-base text-foreground leading-relaxed mb-6">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Platform Features ── */}
      <section className="py-20 md:py-32 bg-muted/20 overflow-hidden">
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

            {featureRows.map((row, rowIdx) => (
              <motion.div key={rowIdx} variants={fadeUp} transition={sectionTransition} className="flex flex-wrap justify-center gap-2 md:gap-3 mb-2 md:mb-3">
                {row.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="group flex items-center gap-2 rounded-full border border-border/40 bg-background/60 px-4 py-2.5 md:px-5 md:py-3 hover:bg-primary/10 hover:border-primary/30 transition-colors">
                      <Icon className="h-4 w-4 text-primary shrink-0" strokeWidth={2} />
                      <span className="text-xs md:text-sm font-medium text-foreground whitespace-nowrap">{f.label}</span>
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-20 md:py-36 bg-background">
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
              <div className="bg-card border border-border/40 rounded-3xl p-8 md:p-12">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Target className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">Our Mission</h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  To make it easy for anyone to find, organize, and join sports activity — removing the friction that prevents active people from playing regularly.
                </p>
              </div>

              <div className="bg-card border border-border/40 rounded-3xl p-8 md:p-12">
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
      <section className="py-20 md:py-36 bg-muted/20">
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
                { icon: Globe, title: "Accessibility", desc: "Sport should be for everyone, everywhere." },
                { icon: Heart, title: "Community", desc: "Sport brings people together." },
                { icon: Sparkles, title: "Simplicity", desc: "Book in seconds, not hours." },
                { icon: Shield, title: "Trust", desc: "Verified venues, secure payments." },
              ].map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="bg-card rounded-2xl md:rounded-3xl p-6 md:p-10 text-center border border-border/40">
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
      <section className="py-20 md:py-36 bg-background overflow-hidden">
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
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tighter mb-4 md:mb-6">
                Built by people who<br className="hidden md:block" /> love the game.
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} transition={sectionTransition} className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {[
                { img: founderAvag, alt: "Avag Hovhannisyan", name: "Avag Hovhannisyan", role: "Founder & CEO", bio: "Driving the vision to connect players with venues seamlessly. Passionate about making sport accessible." },
                { img: founderGor, alt: "Gor Meliksetyan", name: "Gor Meliksetyan", role: "Co-Founder & CTO", bio: "Building the technology that powers thousands of bookings. Turns complex problems into simple experiences." },
                { img: founderIrina, alt: "Irina Grigoryan", name: "Irina Grigoryan", role: "Co-Founder & CPO", bio: "Shaping the product and community experience. Every feature starts with the player in mind." },
              ].map((founder) => (
                <div key={founder.name} className="bg-card border border-border/40 rounded-2xl md:rounded-3xl p-6 md:p-8 group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4 mb-5">
                    <img
                      src={founder.img}
                      alt={founder.alt}
                      className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-full border-2 border-primary/15"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="text-sm md:text-base font-semibold text-foreground tracking-tight">{founder.name}</h3>
                      <p className="text-primary font-medium text-xs md:text-sm">{founder.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{founder.bio}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Sports complex"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/80" />
        </div>
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.p variants={fadeUp} transition={sectionTransition} className="text-sm font-semibold text-primary tracking-widest uppercase mb-4">
              Get Started Today
            </motion.p>
            <motion.h2 variants={fadeUp} transition={sectionTransition} className="text-3xl md:text-5xl lg:text-7xl font-bold text-primary-foreground tracking-tighter mb-5 md:mb-8">
              Your next game<br />is one click away.
            </motion.h2>
            <motion.p variants={fadeUp} transition={sectionTransition} className="text-base md:text-xl text-primary-foreground/60 mb-8 md:mb-12 max-w-md mx-auto">
              Join 40,000+ players and 500+ venues already on Sportsbnb. Free to start, no credit card required.
            </motion.p>
            <motion.div variants={fadeUp} transition={sectionTransition} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-20 md:mb-0">
              {!isLoading && !user ? (
                <Link to="/signup">
                  <Button size="xl" className="w-full sm:w-auto rounded-full font-semibold gap-2 shadow-2xl">
                    Create free account
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button size="xl" className="w-full sm:w-auto rounded-full font-semibold gap-2 shadow-2xl">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/venues">
                <Button variant="ghost" size="xl" className="w-full sm:w-auto rounded-full border border-primary-foreground/20 text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10">
                  Explore venues
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
