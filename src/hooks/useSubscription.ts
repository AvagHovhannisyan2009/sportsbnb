import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Stripe product/price mapping
export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price_id: null,
    product_id: null,
    price: 0,
    features: [
      "Browse & book venues",
      "Join public games",
      "Basic player profile",
      "Community chat access",
    ],
  },
  pro: {
    name: "Pro",
    price_id: "price_1T3MjzDf5cNWGY0l9kCq3Hd6",
    product_id: "prod_U1PZ49DHS1TyNN",
    price: 1499,
    features: [
      "Everything in Free",
      "10% booking discounts",
      "Priority support",
      "Player stats dashboard",
      "Advanced game filters",
      "2x referral credits",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price_id: "price_1T3MkSDf5cNWGY0l2bIincCU",
    product_id: "prod_U1PZRuxToEcTkt",
    price: 3999,
    features: [
      "Everything in Pro",
      "20% booking discounts",
      "Unlimited referral credits",
      "Promoted player profile",
      "Priority matchmaking",
      "Exclusive venues access",
    ],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

interface SubscriptionState {
  subscribed: boolean;
  tier: SubscriptionTier;
  productId: string | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    tier: "free",
    productId: null,
    subscriptionEnd: null,
    isLoading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      let tier: SubscriptionTier = "free";
      if (data?.subscribed && data?.product_id) {
        if (data.product_id === SUBSCRIPTION_TIERS.enterprise.product_id) {
          tier = "enterprise";
        } else if (data.product_id === SUBSCRIPTION_TIERS.pro.product_id) {
          tier = "pro";
        }
      }

      setState({
        subscribed: data?.subscribed || false,
        tier,
        productId: data?.product_id || null,
        subscriptionEnd: data?.subscription_end || null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    // Auto-refresh every 60 seconds
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const startCheckout = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to start checkout");
    }
  };

  const openPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening portal:", error);
      toast.error("Failed to open subscription management");
    }
  };

  return {
    ...state,
    checkSubscription,
    startCheckout,
    openPortal,
  };
};
