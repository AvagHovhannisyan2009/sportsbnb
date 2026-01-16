import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-GAME-PAYMENT] ${step}${detailsStr}`);
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
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");
    logStep("Session ID received", { sessionId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { 
      status: session.payment_status, 
      metadata: session.metadata 
    });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const gameId = session.metadata?.game_id;
    const userId = session.metadata?.user_id;

    if (!gameId || !userId) {
      throw new Error("Invalid session metadata");
    }

    // Verify the user making the request is the same as the one who paid
    if (userId !== user.id) {
      throw new Error("User mismatch");
    }

    // Check if already joined (prevent double joining)
    const { data: existingParticipant } = await supabaseClient
      .from("game_participants")
      .select("id")
      .eq("game_id", gameId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingParticipant) {
      logStep("User already joined", { participantId: existingParticipant.id });
      return new Response(JSON.stringify({ 
        success: true, 
        alreadyJoined: true,
        gameId 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Add user to game participants
    const { error: insertError } = await supabaseClient
      .from("game_participants")
      .insert({
        game_id: gameId,
        user_id: userId,
        status: "confirmed",
      });

    if (insertError) {
      logStep("Failed to insert participant", { error: insertError.message });
      throw new Error("Failed to join game");
    }
    logStep("Participant added successfully");

    // Get game details and notify the host
    const { data: game } = await supabaseClient
      .from("games")
      .select("host_id, title")
      .eq("id", gameId)
      .single();

    if (game && game.host_id !== userId) {
      const { data: joiner } = await supabaseClient
        .from("profiles")
        .select("full_name")
        .eq("user_id", userId)
        .single();

      await supabaseClient.from("notifications").insert({
        user_id: game.host_id,
        type: "game",
        title: "New Player Joined! 🎮💰",
        message: `${joiner?.full_name || "Someone"} has paid and joined your game "${game.title}".`,
        link: `/game/${gameId}`,
      });
      logStep("Host notification sent");
    }

    // Notify the user
    await supabaseClient.from("notifications").insert({
      user_id: userId,
      type: "game",
      title: "Successfully Joined Game! 🎉",
      message: `Your payment was successful and you've joined "${game?.title}".`,
      link: `/game/${gameId}`,
    });
    logStep("User notification sent");

    return new Response(JSON.stringify({ 
      success: true, 
      gameId,
      gameTitle: game?.title 
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
