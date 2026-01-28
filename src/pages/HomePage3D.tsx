import { Suspense, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Search,
  Calendar,
  Users,
  Building,
  ArrowRight,
  CheckCircle,
  Shield,
  Star,
  Zap,
  Target,
  Eye,
  Heart,
  Sparkles,
  Globe,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useTiltEffect, useScrollReveal } from "@/hooks/useInteractions";
import HeroSearch from "@/components/home/HeroSearch";

// 3D Components
import Scene3D from "@/components/3d/Scene3D";
import HeroScene from "@/components/3d/HeroScene";
import ScrollRig from "@/components/3d/ScrollRig";
import ParticleField from "@/components/3d/ParticleField";
import PostProcessing from "@/components/3d/PostProcessing";

// Assets
import heroImage from "@/assets/hero-sports-premium.jpg";
import venueFootball from "@/assets/venue-football.jpg";
import venueTennis from "@/assets/venue-tennis.jpg";
import venueBasketball from "@/assets/venue-basketball.jpg";
import venueSwimming from "@/assets/venue-swimming.jpg";
import founderAvag from "@/assets/founder-avag.jpg";
import founderGor from "@/assets/founder-gor.jpg";
import founderIrina from "@/assets/founder-irina.jpg";

const HomePage3D = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const { scrollProgress } = useSmoothScroll();

  const howItWorks = [
    {
      icon: Search,
      title: t("home.step1PlayerTitle"),
      description: t("home.step1PlayerDesc"),
    },
    {
      icon: Calendar,
      title: t("home.step2PlayerTitle"),
      description: t("home.step2PlayerDesc"),
    },
    {
      icon: Users,
      title: t("home.step3PlayerTitle"),
      description: t("home.step3PlayerDesc"),
    },
  ];

  const forOwners = [
    {
      icon: Building,
      title: t("home.step1OwnerTitle"),
      description: t("home.step1OwnerDesc"),
    },
    {
      icon: Calendar,
      title: t("home.step2OwnerTitle"),
      description: t("home.step2OwnerDesc"),
    },
    {
      icon: CheckCircle,
      title: t("home.step3OwnerTitle"),
      description: t("home.step3OwnerDesc"),
    },
  ];

  const benefits = [
    { icon: Zap, text: t("home.benefit1Desc") },
    { icon: Shield, text: t("home.benefit3Desc") },
    { icon: Star, text: t("home.benefit2Desc") },
    { icon: Users, text: t("home.benefit4Desc") },
    { icon: Calendar, text: t("booking.selectDateTime") },
    { icon: CheckCircle, text: t("common.support") },
  ];

  const featuredVenues = [
    { name: t("sports.football"), image: venueFootball },
    { name: t("sports.tennis"), image: venueTennis },
    { name: t("sports.basketball"), image: venueBasketball },
    { name: t("sports.swimming"), image: venueSwimming },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* 3D Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* 3D Canvas Background */}
        <div className="absolute inset-0 z-0">
          <Scene3D>
            <Suspense fallback={null}>
              <HeroScene scrollProgress={scrollProgress} />
              <ParticleField count={500} scrollProgress={scrollProgress} />
              <ScrollRig scrollProgress={scrollProgress} />
              <PostProcessing />
            </Suspense>
          </Scene3D>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-[1]" />

        {/* Hero Content */}
        <div className="container relative z-10 py-32 md:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="opacity-0 animate-[fadeInUp_1s_ease-out_0.2s_forwards]"
              style={{
                animation: "fadeInUp 1s ease-out 0.2s forwards",
              }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight mb-8 tracking-tight">
                {t("home.heroTitle")}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  {t("home.heroHighlight")}
                </span>
              </h1>
            </div>

            <div
              className="opacity-0"
              style={{
                animation: "fadeInUp 1s ease-out 0.4s forwards",
              }}
            >
              <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
                {t("home.heroDescription")}
              </p>
            </div>

            <div
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16 opacity-0"
              style={{
                animation: "fadeInUp 1s ease-out 0.6s forwards",
              }}
            >
              <Link to="/venues">
                <Button
                  size="xl"
                  className="group w-full sm:w-auto h-16 px-12 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-primary/50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105"
                >
                  {t("home.findVenue")}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/games">
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto h-16 px-12 text-lg font-semibold rounded-2xl bg-white/5 backdrop-blur-xl border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 transform hover:scale-105"
                >
                  {t("home.browseGames")}
                </Button>
              </Link>
            </div>

            <div
              className="max-w-4xl mx-auto opacity-0"
              style={{
                animation: "fadeInUp 1s ease-out 0.8s forwards",
              }}
            >
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-2 border border-white/20 shadow-2xl">
                <HeroSearch />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]">
          <div className="w-8 h-14 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/80 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Featured Categories with Depth Cards */}
      <section className="py-32 bg-gradient-to-b from-black via-slate-950 to-slate-900 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
        </div>

        <div className="container relative z-10">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-blue-400 tracking-widest uppercase mb-4">
              {t("home.popularCategories")}
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Book Courts & Fields by Sport
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              {t("venues.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredVenues.map((venue, index) => (
              <CategoryCard
                key={venue.name}
                venue={venue}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - With Floating Elements */}
      <section className="py-32 bg-slate-900 relative">
        <div className="container relative z-10">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-blue-400 tracking-widest uppercase mb-4">
              {t("home.forPlayers")}
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              {t("home.howItWorks")}
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              {t("home.heroDescription")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-16">
            {howItWorks.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/venues">
              <Button
                size="lg"
                className="h-16 px-12 text-lg rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                {t("venues.bookNow")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Owners Section */}
      <section className="py-32 bg-gradient-to-b from-slate-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-sm font-semibold text-purple-400 tracking-widest uppercase mb-4">
                {t("home.forOwners")}
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
                {t("home.step3OwnerTitle")}
              </h2>
              <p className="text-xl text-white/70 mb-12 leading-relaxed">
                {t("home.step3OwnerDesc")}
              </p>

              <div className="space-y-8 mb-12">
                {forOwners.map((item, index) => (
                  <FeatureItem key={item.title} item={item} index={index} />
                ))}
              </div>

              <Link to="/list-venue">
                <Button
                  size="lg"
                  className="h-16 px-12 text-lg rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105"
                >
                  {t("nav.listVenue")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img
                  src={venueBasketball}
                  alt="Basketball court facility"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -z-10 inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-3xl blur-3xl transform scale-110" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-32 bg-black relative">
        <div className="container">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-blue-400 tracking-widest uppercase mb-4">
              {t("home.whyChooseUs")}
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              {t("home.forPlayers")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <BenefitCard key={benefit.text} benefit={benefit} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <MissionVision />

      {/* Values */}
      <ValuesSection />

      {/* Team */}
      <TeamSection
        founders={[
          { name: "Avag Hovhannisyan", role: "Founder", image: founderAvag },
          { name: "Gor Meliksetyan", role: "Co-Founder", image: founderGor },
          { name: "Irina Grigoryan", role: "Co-Founder", image: founderIrina },
        ]}
      />

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-b from-black via-slate-950 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px]" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
              {t("home.readyToPlay")}
            </h2>
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
              {t("home.joinCommunity")}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {!isLoading && !user ? (
                <Link to="/signup">
                  <Button
                    size="xl"
                    className="w-full sm:w-auto h-16 px-12 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                  >
                    {t("home.signUpFree")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button
                    size="xl"
                    className="w-full sm:w-auto h-16 px-12 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {t("nav.dashboard")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/venues">
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto h-16 px-12 text-lg rounded-2xl border-white/20 text-white hover:bg-white/10"
                >
                  {t("nav.venues")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Component: CategoryCard with 3D hover effect
function CategoryCard({ venue, index }: any) {
  const cardRef = useTiltEffect(8);

  return (
    <Link to="/venues" className="group block">
      <div
        ref={cardRef as any}
        className="relative aspect-[4/5] rounded-2xl overflow-hidden transform transition-all duration-500"
        style={{
          animation: `fadeInUp 0.8s ease-out ${index * 0.1}s backwards`,
        }}
      >
        <img
          src={venue.image}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 transform group-hover:translate-y-0 transition-transform">
          <h3 className="font-bold text-white text-2xl mb-1">{venue.name}</h3>
          <p className="text-white/80 text-sm">Explore venues</p>
        </div>
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-blue-600/30 to-transparent" />
      </div>
    </Link>
  );
}

// Component: StepCard
function StepCard({ step, index }: any) {
  const Icon = step.icon;
  const cardRef = useScrollReveal(0.1);

  return (
    <div
      ref={cardRef as any}
      className="text-center transform transition-all duration-500 opacity-0 translate-y-8 is-visible:opacity-100 is-visible:translate-y-0"
      style={{
        transitionDelay: `${index * 150}ms`,
      }}
    >
      <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-8 transform hover:scale-110 transition-transform duration-300 shadow-2xl">
        <Icon className="h-12 w-12" />
        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white text-lg font-bold flex items-center justify-center shadow-xl">
          {index + 1}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
      <p className="text-white/70 leading-relaxed text-lg">{step.description}</p>
    </div>
  );
}

// Component: FeatureItem
function FeatureItem({ item, index }: any) {
  const Icon = item.icon;

  return (
    <div
      className="flex gap-6 transform transition-all duration-500 opacity-0 translate-x-8 animate-[slideFromLeft_0.8s_ease-out_forwards]"
      style={{
        animationDelay: `${index * 150}ms`,
      }}
    >
      <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl">
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <h3 className="font-bold text-white text-xl mb-2">{item.title}</h3>
        <p className="text-white/70 text-lg leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}

// Component: BenefitCard
function BenefitCard({ benefit, index }: any) {
  const Icon = benefit.icon;
  const cardRef = useTiltEffect(5);

  return (
    <div
      ref={cardRef as any}
      className="flex items-center gap-5 bg-white/5 hover:bg-white/10 backdrop-blur-xl transition-all duration-500 rounded-2xl p-8 border border-white/10 hover:border-white/20 transform hover:scale-105"
      style={{
        animation: `fadeInUp 0.8s ease-out ${index * 0.1}s backwards`,
      }}
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0 shadow-xl">
        <Icon className="h-7 w-7 text-white" />
      </div>
      <span className="text-white font-semibold text-lg">{benefit.text}</span>
    </div>
  );
}

// Component: MissionVision
function MissionVision() {
  const { t } = useTranslation();

  return (
    <section className="py-32 bg-slate-950 relative">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12">
          <MissionCard
            icon={Target}
            title={t("home.ourMission")}
            description={t("home.missionText")}
            gradient="from-blue-600 to-cyan-600"
          />
          <MissionCard
            icon={Eye}
            title={t("home.ourVision")}
            description={t("home.visionText")}
            gradient="from-purple-600 to-pink-600"
          />
        </div>
      </div>
    </section>
  );
}

function MissionCard({ icon: Icon, title, description, gradient }: any) {
  const cardRef = useTiltEffect(6);

  return (
    <div
      ref={cardRef as any}
      className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:scale-105 overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-8 shadow-2xl`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">{title}</h3>
      <p className="text-xl text-white/70 leading-relaxed">{description}</p>
    </div>
  );
}

// Component: ValuesSection
function ValuesSection() {
  const { t } = useTranslation();

  const values = [
    {
      icon: Globe,
      title: t("home.value1Title"),
      description: t("home.value1Desc"),
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      icon: Heart,
      title: t("home.value2Title"),
      description: t("home.value2Desc"),
      gradient: "from-pink-600 to-rose-600",
    },
    {
      icon: Sparkles,
      title: t("home.value3Title"),
      description: t("home.value3Desc"),
      gradient: "from-purple-600 to-indigo-600",
    },
    {
      icon: Shield,
      title: t("home.benefit3Title"),
      description: t("home.benefit3Desc"),
      gradient: "from-green-600 to-emerald-600",
    },
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-black to-slate-950 relative">
      <div className="container">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold text-blue-400 tracking-widest uppercase mb-4">
            {t("home.ourValues")}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            What We Stand For
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <ValueCard key={value.title} value={value} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueCard({ value, index }: any) {
  const Icon = value.icon;
  const cardRef = useTiltEffect(8);

  return (
    <div
      ref={cardRef as any}
      className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:scale-105 overflow-hidden group"
      style={{
        animation: `fadeInUp 0.8s ease-out ${index * 0.1}s backwards`,
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-white mx-auto mb-6 shadow-2xl`}>
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
      <p className="text-white/70 leading-relaxed">{value.description}</p>
    </div>
  );
}

// Component: TeamSection
function TeamSection({ founders }: any) {
  const { t } = useTranslation();

  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold text-blue-400 tracking-widest uppercase mb-4">
            {t("home.meetTheTeam")}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            The Founders
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {founders.map((founder: any, index: number) => (
            <FounderCard key={founder.name} founder={founder} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderCard({ founder, index }: any) {
  const cardRef = useTiltEffect(10);

  return (
    <div
      ref={cardRef as any}
      className="text-center transform transition-all duration-500 hover:scale-105"
      style={{
        animation: `fadeInUp 0.8s ease-out ${index * 0.15}s backwards`,
      }}
    >
      <div className="relative mb-8 mx-auto w-48 h-48 group">
        <img
          src={founder.image}
          alt={founder.name}
          className="w-full h-full object-cover rounded-full border-4 border-blue-600/50 group-hover:border-purple-600/50 transition-all duration-500 shadow-2xl"
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{founder.name}</h3>
      <p className="text-blue-400 font-semibold text-lg">{founder.role}</p>
    </div>
  );
}

// Add keyframes to global CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideFromLeft {
    from {
      opacity: 0;
      transform: translateX(-40px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .is-visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

export default HomePage3D;
