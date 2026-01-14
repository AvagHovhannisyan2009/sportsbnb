import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-CONNECT-STATUS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get user's profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id, stripe_onboarding_completed')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw new Error(`Profile error: ${profileError.message}`);

    if (!profile.stripe_account_id) {
      logStep("No Stripe account found");
      return new Response(JSON.stringify({
        hasAccount: false,
        onboardingComplete: false,
        payoutsEnabled: false,
        chargesEnabled: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const account = await stripe.accounts.retrieve(profile.stripe_account_id);
    
    // Check identity verification status
    const requirements = account.requirements;
    const hasIdentityVerification = !requirements?.currently_due?.some(
      (req: string) => req.includes('individual.verification') || req.includes('identity')
    );
    const pendingVerification = requirements?.pending_verification?.length > 0;
    
    logStep("Stripe account retrieved", {
      accountId: account.id,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      hasIdentityVerification,
      pendingVerification,
      currentlyDue: requirements?.currently_due,
    });

    // Full verification requires: bank account linked + ID verified
    const isFullyVerified = account.payouts_enabled && account.charges_enabled && hasIdentityVerification && !pendingVerification;
    
    // Update profile if onboarding is complete
    if (isFullyVerified && !profile.stripe_onboarding_completed) {
      await supabaseClient
        .from('profiles')
        .update({ stripe_onboarding_completed: true })
        .eq('user_id', user.id);
      logStep("Profile updated with completed onboarding status");
      
      // Activate all user's venues now that verification is complete
      await supabaseClient
        .from('venues')
        .update({ is_active: true })
        .eq('owner_id', user.id);
      logStep("Activated user's venues");
    }

    return new Response(JSON.stringify({
      hasAccount: true,
      onboardingComplete: account.payouts_enabled && account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      identityVerified: hasIdentityVerification && !pendingVerification,
      pendingVerification,
      fullyVerified: isFullyVerified,
      accountId: account.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
