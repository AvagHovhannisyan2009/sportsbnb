import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Users, Building, ArrowRight, CheckCircle, Shield, Star, Zap, Target, Eye, Heart, Sparkles, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import HeroSearch from "@/components/home/HeroSearch";
import LayeredHero from "@/components/home/premium/LayeredHero";
import ScrollReveal from "@/components/motion/ScrollReveal";
import FadeIn from "@/components/motion/FadeIn";
import StaggerChildren from "@/components/motion/StaggerChildren";
import DepthPanel from "@/components/home/premium/DepthPanel";

import SectionDivider from "@/components/home/premium/SectionDivider";
import heroImage from "@/assets/hero-sports-premium.jpg";
import venueFootball from "@/assets/venue-football.jpg";
import venueTennis from "@/assets/venue-tennis.jpg";
import venueBasketball from "@/assets/venue-basketball.jpg";
import venueSwimming from "@/assets/venue-swimming.jpg";
import founderAvag from "@/assets/founder-avag.jpg";
import founderGor from "@/assets/founder-gor.jpg";
import founderIrina from "@/assets/founder-irina.jpg";

const HomePage = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  const howItWorks = [
    {
      icon: Search,
      title: t('home.step1PlayerTitle'),
      description: t('home.step1PlayerDesc'),
    },
    {
      icon: Calendar,
      title: t('home.step2PlayerTitle'),
      description: t('home.step2PlayerDesc'),
    },
    {
      icon: Users,
      title: t('home.step3PlayerTitle'),
      description: t('home.step3PlayerDesc'),
    },
  ];

  const forOwners = [
    {
      icon: Building,
      title: t('home.step1OwnerTitle'),
      description: t('home.step1OwnerDesc'),
    },
    {
      icon: Calendar,
      title: t('home.step2OwnerTitle'),
      description: t('home.step2OwnerDesc'),
    },
    {
      icon: CheckCircle,
      title: t('home.step3OwnerTitle'),
      description: t('home.step3OwnerDesc'),
    },
  ];

  const benefits = [
    { icon: Zap, text: t('home.benefit1Desc') },
    { icon: Shield, text: t('home.benefit3Desc') },
    { icon: Star, text: t('home.benefit2Desc') },
    { icon: Users, text: t('home.benefit4Desc') },
    { icon: Calendar, text: t('booking.selectDateTime') },
    { icon: CheckCircle, text: t('common.support') },
  ];

  const featuredVenues = [
    { name: t('sports.football'), image: venueFootball },
    { name: t('sports.tennis'), image: venueTennis },
    { name: t('sports.basketball'), image: venueBasketball },
    { name: t('sports.swimming'), image: venueSwimming },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section with Layered Parallax */}
      <LayeredHero
        backgroundImage={heroImage}
        backgroundAlt="Athletes playing basketball, football, and tennis at premium sports facilities - Book sports venues online"
      >
        <div className="container py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn delay={0.1}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
                {t('home.heroTitle')}
                <br />
                <span className="text-primary">{t('home.heroHighlight')}</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-xl mx-auto">
                {t('home.heroDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/venues" aria-label="Search and book sports venues">
                  <Button
                    size="xl"
                    className="w-full sm:w-auto h-16 px-10 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-primary/25 transition-all duration-300"
                  >
                    {t('home.findVenue')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/games" aria-label="Browse pickup games near you">
                  <Button
                    variant="outline"
                    size="xl"
                    className="w-full sm:w-auto h-16 px-10 text-lg font-semibold rounded-xl bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                  >
                    {t('home.browseGames')}
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Search Bar */}
          <FadeIn delay={0.5}>
            <div className="max-w-4xl mx-auto mt-8 lg:mt-16">
              <HeroSearch />
            </div>
          </FadeIn>
        </div>
      </LayeredHero>

      {/* Divider */}
      <SectionDivider className="bg-background" />

      {/* Featured Categories */}
      <section className="py-20 md:py-28 bg-background" aria-labelledby="sports-categories">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
                {t('home.popularCategories')}
              </p>
              <h2 id="sports-categories" className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
                Book Courts & Fields by Sport
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('venues.subtitle')}
              </p>
            </div>
          </ScrollReveal>

          <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" staggerDelay={0.1}>
            {featuredVenues.map((venue) => (
              <Link
                key={venue.name}
                to="/venues"
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden"
                aria-label={`Book ${venue.name} courts and venues`}
              >
                <img
                  src={venue.image}
                  alt={`${venue.name} court rental - Book ${venue.name} venues near you`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-semibold text-white text-xl">{venue.name}</h3>
                </div>
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Divider */}
      <SectionDivider />

      {/* How It Works - Players */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
                {t('home.forPlayers')}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
                {t('home.howItWorks')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('home.heroDescription')}
              </p>
            </div>
          </ScrollReveal>

          <StaggerChildren className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12" staggerDelay={0.15}>
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <DepthPanel key={step.title} className="p-8 text-center" depth="medium">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary mb-6">
                    <Icon className="h-10 w-10" />
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </DepthPanel>
              );
            })}
          </StaggerChildren>

          <ScrollReveal delay={0.4}>
            <div className="text-center">
              <Link to="/venues">
                <Button size="lg" className="h-14 px-10 text-base rounded-xl">
                  {t('venues.bookNow')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works - Owners */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
                  {t('home.forOwners')}
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
                  {t('home.step3OwnerTitle')}
                </h2>
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                  {t('home.step3OwnerDesc')}
                </p>

                <div className="space-y-6 mb-10">
                  {forOwners.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <ScrollReveal key={item.title} delay={index * 0.1} direction="left">
                        <div className="flex gap-5">
                          <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Icon className="h-7 w-7" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-lg mb-1">{item.title}</h3>
                            <p className="text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      </ScrollReveal>
                    );
                  })}
                </div>

                <Link to="/list-venue">
                  <Button size="lg" variant="secondary" className="h-14 px-10 text-base rounded-xl">
                    {t('nav.listVenue')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <DepthPanel className="aspect-[4/5] rounded-3xl overflow-hidden" depth="deep" hover={false}>
                <img src={venueBasketball} alt="Basketball court facility - List your sports venue on Sportsbnb" className="w-full h-full object-cover" loading="lazy" />
              </DepthPanel>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Divider */}
      <SectionDivider />

      {/* Benefits */}
      <section className="py-20 md:py-28 bg-secondary">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
                {t('home.whyChooseUs')}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-foreground mb-5 tracking-tight">
                {t('home.forPlayers')}
              </h2>
              <p className="text-lg text-secondary-foreground/70 max-w-2xl mx-auto">
                {t('home.heroDescription')}
              </p>
            </div>
          </ScrollReveal>

          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.08}>
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <DepthPanel
                  key={benefit.text}
                  className="flex items-center gap-4 p-6 bg-secondary-foreground/5 border-secondary-foreground/10"
                  depth="shallow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-secondary-foreground font-medium text-lg">{benefit.text}</span>
                </DepthPanel>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <StaggerChildren className="grid md:grid-cols-2 gap-8 md:gap-12" staggerDelay={0.15}>
            <DepthPanel className="p-8 md:p-10 bg-muted/30" depth="medium">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                {t('home.ourMission')}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('home.missionText')}
              </p>
            </DepthPanel>

            <DepthPanel className="p-8 md:p-10 bg-muted/30" depth="medium">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                {t('home.ourVision')}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('home.visionText')}
              </p>
            </DepthPanel>
          </StaggerChildren>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
                {t('home.ourValues')}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
                {t('home.ourValues')}
              </h2>
            </div>
          </ScrollReveal>

          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            <DepthPanel className="p-8 text-center" depth="shallow">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-5">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{t('home.value1Title')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('home.value1Desc')}</p>
            </DepthPanel>

            <DepthPanel className="p-8 text-center" depth="shallow">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-5">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{t('home.value2Title')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('home.value2Desc')}</p>
            </DepthPanel>

            <DepthPanel className="p-8 text-center" depth="shallow">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-5">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{t('home.value3Title')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('home.value3Desc')}</p>
            </DepthPanel>

            <DepthPanel className="p-8 text-center" depth="shallow">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-5">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{t('home.benefit3Title')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('home.benefit3Desc')}</p>
            </DepthPanel>
          </StaggerChildren>
        </div>
      </section>

      {/* Team / Founders */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
                {t('home.meetTheTeam')}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
                {t('home.meetTheTeam')}
              </h2>
            </div>
          </ScrollReveal>

          <StaggerChildren className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto" staggerDelay={0.15}>
            <DepthPanel className="text-center p-6" depth="shallow">
              <div className="relative mb-6 mx-auto w-40 h-40">
                <img
                  src={founderAvag}
                  alt="Avag Hovhannisyan"
                  className="w-full h-full object-cover rounded-full border-4 border-primary/20"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Avag Hovhannisyan</h3>
              <p className="text-primary font-medium">Founder</p>
            </DepthPanel>

            <DepthPanel className="text-center p-6" depth="shallow">
              <div className="relative mb-6 mx-auto w-40 h-40">
                <img
                  src={founderGor}
                  alt="Gor Meliksetyan"
                  className="w-full h-full object-cover rounded-full border-4 border-primary/20"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Gor Meliksetyan</h3>
              <p className="text-primary font-medium">Co-Founder</p>
            </DepthPanel>

            <DepthPanel className="text-center p-6" depth="shallow">
              <div className="relative mb-6 mx-auto w-40 h-40">
                <img
                  src={founderIrina}
                  alt="Irina Grigoryan"
                  className="w-full h-full object-cover rounded-full border-4 border-primary/20"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Irina Grigoryan</h3>
              <p className="text-primary font-medium">Co-Founder</p>
            </DepthPanel>
          </StaggerChildren>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
                {t('home.readyToPlay')}
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                {t('home.joinCommunity')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isLoading && !user ? (
                  <Link to="/signup">
                    <Button
                      size="xl"
                      className="w-full sm:w-auto h-16 px-10 text-lg font-semibold rounded-xl"
                    >
                      {t('home.signUpFree')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <Button
                      size="xl"
                      className="w-full sm:w-auto h-16 px-10 text-lg font-semibold rounded-xl"
                    >
                      {t('nav.dashboard')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Link to="/venues">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto h-16 px-10 text-lg rounded-xl">
                    {t('nav.venues')}
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
