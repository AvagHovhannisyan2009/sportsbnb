import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { paymentIntentId, gameId, userId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (!stripeKey || paymentIntentId === 'free-join') {
      // Free join - add player to game
      const { error } = await supabaseClient
        .from('game_players')
        .insert({
          game_id: gameId,
          user_id: userId,
          status: 'joined'
        })

      if (error) throw error

      // Increment current_players
      await supabaseClient.rpc('increment_game_players', { game_id: gameId })

      return new Response(
        JSON.stringify({ success: true, message: 'Joined game successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify payment with Stripe
    const paymentResponse = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
      {
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
        },
      }
    )

    const paymentIntent = await paymentResponse.json()

    if (paymentIntent.status === 'succeeded') {
      // Add player to game
      const { error } = await supabaseClient
        .from('game_players')
        .insert({
          game_id: gameId,
          user_id: userId,
          status: 'joined'
        })

      if (error) throw error

      // Increment current_players
      await supabaseClient.rpc('increment_game_players', { game_id: gameId })

      return new Response(
        JSON.stringify({ success: true, paymentIntent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Payment not completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
