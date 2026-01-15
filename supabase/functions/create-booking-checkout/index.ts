import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-BOOKING-CHECKOUT] ${step}${detailsStr}`);
};

interface BookingRequest {
  venueId: string;
  venueName: string;
  venueLocation: string;
  price: number;
  bookingDate: string;
  bookingTime: string;
  dateLabel: string;
}

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

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { venueId, venueName, venueLocation, price, bookingDate, bookingTime, dateLabel }: BookingRequest = await req.json();
    logStep("Booking request received", { venueId, venueName, price, bookingDate, bookingTime });

    // Get venue owner's Stripe account
    const { data: venue, error: venueError } = await supabaseClient
      .from('venues')
      .select('owner_id')
      .eq('id', venueId)
      .single();

    if (venueError) throw new Error(`Failed to fetch venue: ${venueError.message}`);
    logStep("Venue fetched", { ownerId: venue.owner_id });

    // Get owner's Stripe Connect account
    const { data: ownerProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id, stripe_onboarding_completed')
      .eq('user_id', venue.owner_id)
      .single();

    if (profileError) throw new Error(`Failed to fetch owner profile: ${profileError.message}`);
    
    // If owner doesn't have Stripe setup, create a fake/demo booking directly
    if (!ownerProfile.stripe_account_id || !ownerProfile.stripe_onboarding_completed) {
      logStep("Owner has no Stripe account - creating demo booking");
      
      // Create the booking directly (fake/demo mode)
      const { data: booking, error: bookingError } = await supabaseClient
        .from("bookings")
        .insert({
          user_id: user.id,
          venue_id: venueId,
          venue_name: venueName,
          booking_date: bookingDate,
          booking_time: bookingTime,
          duration_hours: 1,
          total_price: price,
          status: "confirmed",
          payment_intent_id: `demo_${Date.now()}`, // Fake payment ID for demo
        })
        .select()
        .single();

      if (bookingError) {
        logStep("Demo booking insert error", { error: bookingError.message });
        throw new Error("Failed to create demo booking");
      }

      logStep("Demo booking created successfully", { bookingId: booking.id });

      // Create notification for the user
      const formattedDate = new Date(bookingDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      
      try {
        await supabaseClient.from("notifications").insert({
          user_id: user.id,
          type: "booking",
          title: "Demo Booking Confirmed! 🎉",
          message: `Your demo booking at ${venueName} on ${formattedDate} at ${bookingTime} has been confirmed.`,
          link: `/dashboard`,
        });
      } catch (notifError) {
        logStep("Failed to create notification", { error: notifError });
      }

      return new Response(JSON.stringify({ 
        demo: true, 
        booking,
        message: "Demo booking created successfully" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    logStep("Owner Stripe account found", { stripeAccountId: ownerProfile.stripe_account_id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }
    logStep("Customer lookup complete", { customerId: customerId || "new customer" });

    // Calculate amounts: 90% to owner, 10% platform fee
    const totalAmountCents = Math.round(price * 100);
    const platformFeeCents = Math.round(totalAmountCents * 0.10); // 10% platform fee
    logStep("Amount calculation", { 
      totalAmountCents, 
      platformFeeCents, 
      ownerReceives: totalAmountCents - platformFeeCents 
    });

    // Create checkout session with destination charge (90% to owner)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "amd",
            product_data: {
              name: `Venue Booking: ${venueName}`,
              description: `${dateLabel} at ${bookingTime} - ${venueLocation}`,
            },
            unit_amount: totalAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: ownerProfile.stripe_account_id,
        },
        metadata: {
          userId: user.id,
          venueId,
          venueName,
          bookingDate,
          bookingTime,
          price: price.toString(),
          ownerId: venue.owner_id,
          ownerStripeAccount: ownerProfile.stripe_account_id,
        },
      },
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/venue/${venueId}`,
      metadata: {
        userId: user.id,
        venueId,
        venueName,
        bookingDate,
        bookingTime,
        price: price.toString(),
        userEmail: user.email,
        ownerId: venue.owner_id,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
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
