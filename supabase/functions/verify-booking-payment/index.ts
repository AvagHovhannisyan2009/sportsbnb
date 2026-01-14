import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Check if booking already exists for this session
    const { data: existingBooking } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .eq("venue_id", session.metadata?.venueId)
      .eq("booking_date", session.metadata?.bookingDate)
      .eq("booking_time", session.metadata?.bookingTime)
      .single();

    if (existingBooking) {
      return new Response(JSON.stringify({ booking: existingBooking }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .insert({
        user_id: user.id,
        venue_id: session.metadata?.venueId || "",
        venue_name: session.metadata?.venueName || "",
        booking_date: session.metadata?.bookingDate || "",
        booking_time: session.metadata?.bookingTime || "",
        duration_hours: 1,
        total_price: parseFloat(session.metadata?.price || "0"),
        status: "confirmed",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking insert error:", bookingError);
      throw new Error("Failed to create booking");
    }

    return new Response(JSON.stringify({ booking }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Verification error:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
