import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-GAME-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { gameId } = await req.json();
    if (!gameId) throw new Error("Game ID is required");
    logStep("Game ID received", { gameId });

    // Fetch game details
    const { data: game, error: gameError } = await supabaseClient
      .from("games")
      .select("id, title, price_per_player, host_id, max_players, status")
      .eq("id", gameId)
      .single();

    if (gameError || !game) {
      throw new Error("Game not found");
    }
    logStep("Game fetched", { title: game.title, price: game.price_per_player });

    // Check if game is still open
    if (game.status !== "open") {
      throw new Error("This game is no longer available");
    }

    // Check if user is already a participant
    const { data: existingParticipant } = await supabaseClient
      .from("game_participants")
      .select("id")
      .eq("game_id", gameId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingParticipant) {
      throw new Error("You have already joined this game");
    }

    // Check if game is full
    const { count: participantCount } = await supabaseClient
      .from("game_participants")
      .select("id", { count: "exact", head: true })
      .eq("game_id", gameId)
      .eq("status", "confirmed");

    if ((participantCount || 0) >= game.max_players) {
      throw new Error("This game is full");
    }

    // If the game is free, just add the participant directly
    if (!game.price_per_player || game.price_per_player <= 0) {
      logStep("Free game, adding participant directly");
      
      const { error: insertError } = await supabaseClient
        .from("game_participants")
        .insert({
          game_id: gameId,
          user_id: user.id,
          status: "confirmed",
        });

      if (insertError) throw insertError;

      // Notify the host
      if (game.host_id !== user.id) {
        const { data: joiner } = await supabaseClient
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .single();

        await supabaseClient.from("notifications").insert({
          user_id: game.host_id,
          type: "game",
          title: "New Player Joined! 🎮",
          message: `${joiner?.full_name || "Someone"} has joined your game "${game.title}".`,
          link: `/game/${gameId}`,
        });
      }

      return new Response(JSON.stringify({ success: true, free: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Initialize Stripe for paid games
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    logStep("Stripe initialized");

    // Check if Stripe customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    }

    // Convert price to cents (assuming price_per_player is in AMD dram)
    const amountInCents = Math.round(game.price_per_player * 100);

    // Create checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "amd",
            product_data: {
              name: `Join Game: ${game.title}`,
              description: `Participation fee for the game`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/game/${gameId}/join-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/game/${gameId}`,
      metadata: {
        game_id: gameId,
        user_id: user.id,
        type: "game_participation",
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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
