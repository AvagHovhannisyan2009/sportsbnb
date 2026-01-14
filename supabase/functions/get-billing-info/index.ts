import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user?.email) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    // Find existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ 
          paymentMethods: [],
          invoices: [],
          hasCustomer: false
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const customer = customers.data[0];

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: "card",
    });

    // Get invoices/charges
    const charges = await stripe.charges.list({
      customer: customer.id,
      limit: 10,
    });

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 5,
    });

    // Format payment methods
    const formattedPaymentMethods = paymentMethods.data.map((pm: Stripe.PaymentMethod) => ({
      id: pm.id,
      brand: pm.card?.brand || "unknown",
      last4: pm.card?.last4 || "****",
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      isDefault: pm.id === customer.invoice_settings?.default_payment_method,
    }));

    // Format invoices/charges
    const formattedInvoices = charges.data.map((charge: Stripe.Charge) => ({
      id: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      description: charge.description,
      created: charge.created,
      receiptUrl: charge.receipt_url,
    }));

    // Format subscriptions
    const formattedSubscriptions = subscriptions.data.map((sub: Stripe.Subscription) => ({
      id: sub.id,
      status: sub.status,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      plan: sub.items.data[0]?.price?.nickname || "Subscription",
      amount: sub.items.data[0]?.price?.unit_amount || 0,
      currency: sub.items.data[0]?.price?.currency || "usd",
      interval: sub.items.data[0]?.price?.recurring?.interval || "month",
    }));

    return new Response(
      JSON.stringify({ 
        paymentMethods: formattedPaymentMethods,
        invoices: formattedInvoices,
        subscriptions: formattedSubscriptions,
        hasCustomer: true,
        customerEmail: customer.email,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error fetching billing info:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
