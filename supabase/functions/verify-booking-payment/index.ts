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
    const { paymentIntentId, bookingId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Stripe API key from environment
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    
    if (!stripeKey) {
      // If no Stripe key, just mark booking as confirmed (for testing)
      const { error } = await supabaseClient
        .from('bookings')
        .update({ 
          status: 'confirmed',
          payment_status: 'succeeded'
        })
        .eq('id', bookingId)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, message: 'Booking confirmed (test mode)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify payment with Stripe
    const stripeResponse = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
      {
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
        },
      }
    )

    const paymentIntent = await stripeResponse.json()

    if (paymentIntent.status === 'succeeded') {
      // Update booking status
      const { error } = await supabaseClient
        .from('bookings')
        .update({ 
          status: 'confirmed',
          payment_status: 'succeeded'
        })
        .eq('id', bookingId)

      if (error) throw error

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
