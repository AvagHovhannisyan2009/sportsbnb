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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ 
          subscriptions: [],
          paymentMethods: [],
          message: 'Billing not configured'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's stripe customer ID
    const { data: userData } = await supabaseClient
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ subscriptions: [], paymentMethods: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get customer info from Stripe
    const customerResponse = await fetch(
      `https://api.stripe.com/v1/customers/${userData.stripe_customer_id}`,
      {
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
        },
      }
    )

    const customer = await customerResponse.json()

    // Get payment methods
    const pmResponse = await fetch(
      `https://api.stripe.com/v1/payment_methods?customer=${userData.stripe_customer_id}&type=card`,
      {
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
        },
      }
    )

    const paymentMethods = await pmResponse.json()

    return new Response(
      JSON.stringify({ 
        customer,
        paymentMethods: paymentMethods.data || [],
        subscriptions: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
