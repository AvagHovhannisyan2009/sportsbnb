import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Crown, Zap, Rocket, Loader2, ExternalLink } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription, SUBSCRIPTION_TIERS, SubscriptionTier } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const TIER_ICONS: Record<SubscriptionTier, typeof Crown> = {
  free: Zap,
  pro: Crown,
  enterprise: Rocket,
};

const TIER_ORDER: SubscriptionTier[] = ["free", "pro", "enterprise"];

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { tier: currentTier, subscribed, subscriptionEnd, isLoading, startCheckout, openPortal, checkSubscription } = useSubscription();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated! Welcome to the club 🎉");
      checkSubscription();
    }
    if (searchParams.get("canceled") === "true") {
      toast.info("Checkout was canceled.");
    }
  }, [searchParams, checkSubscription]);

  if (isLoading) {
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
        <div className="container py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">Choose Your Plan</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Upgrade your SportsBnB experience with exclusive perks, discounts, and features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TIER_ORDER.map((tierKey) => {
              const tier = SUBSCRIPTION_TIERS[tierKey];
              const Icon = TIER_ICONS[tierKey];
              const isCurrent = currentTier === tierKey;
              const isUpgrade = TIER_ORDER.indexOf(tierKey) > TIER_ORDER.indexOf(currentTier);

              return (
                <Card
                  key={tierKey}
                  className={`relative ${isCurrent ? "border-primary ring-2 ring-primary/20" : ""} ${tierKey === "pro" ? "md:scale-105" : ""}`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="default" className="px-3">Your Plan</Badge>
                    </div>
                  )}
                  {tierKey === "pro" && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="px-3 bg-amber-500 text-amber-950">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pt-8">
                    <Icon className={`h-10 w-10 mx-auto mb-3 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription>
                      {tier.price === 0 ? (
                        <span className="text-3xl font-bold text-foreground">Free</span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-foreground">${(tier.price / 100).toFixed(2)}</span>
                          <span className="text-muted-foreground">/month</span>
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2.5">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4">
                      {isCurrent ? (
                        subscribed ? (
                          <Button variant="outline" className="w-full gap-2" onClick={openPortal}>
                            <ExternalLink className="h-4 w-4" />
                            Manage Subscription
                          </Button>
                        ) : (
                          <Button variant="secondary" className="w-full" disabled>
                            Current Plan
                          </Button>
                        )
                      ) : isUpgrade && tier.price_id ? (
                        <Button
                          className="w-full"
                          onClick={() => startCheckout(tier.price_id!)}
                          disabled={!user}
                        >
                          {user ? `Upgrade to ${tier.name}` : "Sign in to upgrade"}
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          {tierKey === "free" ? "Included" : "Contact us"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {subscribed && subscriptionEnd && (
            <div className="text-center mt-8 text-sm text-muted-foreground">
              Your subscription renews on {new Date(subscriptionEnd).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
