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
    const { bookingId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError) throw bookingError

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (!stripeKey || !booking.payment_intent_id) {
      // No Stripe or no payment - just cancel booking
      const { error } = await supabaseClient
        .from('bookings')
        .update({ 
          status: 'cancelled',
          payment_status: 'refunded',
          cancellation_reason: 'User requested cancellation'
        })
        .eq('id', bookingId)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, message: 'Booking cancelled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create refund in Stripe
    const refundResponse = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `payment_intent=${booking.payment_intent_id}`,
    })

    const refund = await refundResponse.json()

    if (refund.id) {
      // Update booking status
      const { error } = await supabaseClient
        .from('bookings')
        .update({ 
          status: 'cancelled',
          payment_status: 'refunded',
          cancellation_reason: 'User requested cancellation'
        })
        .eq('id', bookingId)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, refund }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error('Refund failed')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
