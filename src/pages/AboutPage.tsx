import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Target, Users, Globe, ArrowRight } from "lucide-react";

const AboutPage = () => {
  const values = [
    {
      icon: Target,
      title: "Accessibility",
      description: "We believe everyone should have easy access to sports facilities, regardless of where they live.",
    },
    {
      icon: Users,
      title: "Community",
      description: "Sports bring people together. We're building tools to help you find teammates and make new friends.",
    },
    {
      icon: Globe,
      title: "Simplicity",
      description: "Booking a court should be as easy as booking a restaurant. No phone calls, no hassle.",
    },
  ];

  return (
    <Layout>
      <div className="bg-background">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Making sports more accessible
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Sportsbnb was born from a simple frustration: booking a sports facility shouldn't 
                require phone calls, waiting, and uncertainty. We're building the platform that 
                makes finding and booking sports venues as easy as it should be.
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-sm font-medium text-primary mb-2 block">OUR MISSION</span>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Connecting people through sports
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Sports facilities across the world operate with outdated booking systems. 
                  Courts sit empty while players struggle to find available venues. 
                  Games are cancelled because teams can't find enough players.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  We're solving this by creating a modern platform that connects players with 
                  venues and with each other. Real-time availability, instant booking, and 
                  the ability to find teammates—all in one place.
                </p>
                <Link to="/signup">
                  <Button size="lg">
                    Join Sportsbnb
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="bg-secondary rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-secondary-foreground mb-2">500+</div>
                  <div className="text-secondary-foreground/70 mb-8">Venues on the platform</div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-secondary-foreground mb-1">10K+</div>
                    <div className="text-sm text-secondary-foreground/70">Active players</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-secondary-foreground mb-1">50K+</div>
                    <div className="text-sm text-secondary-foreground/70">Bookings made</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">What we believe in</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-secondary-foreground mb-4">
                Ready to find your game?
              </h2>
              <p className="text-lg text-secondary-foreground/70 mb-8">
                Join thousands of players and venue owners on Sportsbnb.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" variant="hero">
                    Get started free
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="secondaryOutline">
                    Contact us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;
