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

    const { bookingId } = await req.json();
    console.log("Processing refund for booking:", bookingId);

    // Get the booking with payment intent
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found or unauthorized");
    }

    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    if (!booking.payment_intent_id) {
      throw new Error("No payment intent found for this booking");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create refund
    console.log("Creating Stripe refund for payment intent:", booking.payment_intent_id);
    const refund = await stripe.refunds.create({
      payment_intent: booking.payment_intent_id,
      reason: "requested_by_customer",
    });

    console.log("Refund created:", refund.id);

    // Update booking status
    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking status:", updateError);
      throw new Error("Failed to update booking status");
    }

    // Trigger Make.com webhook for booking cancellation
    try {
      const webhookPayload = {
        event_type: "booking_cancelled",
        venue_id: booking.venue_id,
        data: {
          booking: {
            id: booking.id,
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
            venue_name: booking.venue_name,
            total_price: booking.total_price,
            refund_amount: refund.amount / 100,
            refund_id: refund.id,
          },
          venue: {
            id: booking.venue_id,
            name: booking.venue_name,
          },
          customer: {
            user_id: user.id,
          },
        },
      };
      
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/webhook-dispatcher`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify(webhookPayload),
        }
      );
      console.log("Webhook dispatcher called for booking_cancelled");
    } catch (webhookError) {
      console.error("Failed to call webhook dispatcher:", webhookError);
      // Don't throw - refund is still successful
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        refundId: refund.id,
        amount: refund.amount / 100 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Refund error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
