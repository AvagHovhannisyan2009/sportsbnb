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
      // Return mock data if Stripe not configured
      return new Response(
        JSON.stringify({ 
          canReceivePayouts: true,
          onboardingComplete: true,
          message: 'Stripe Connect not configured (test mode)'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's Connect account
    const { data: userData } = await supabaseClient
      .from('users')
      .select('stripe_connect_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_connect_id) {
      return new Response(
        JSON.stringify({ 
          canReceivePayouts: false,
          onboardingComplete: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get account status from Stripe
    const accountResponse = await fetch(
      `https://api.stripe.com/v1/accounts/${userData.stripe_connect_id}`,
      {
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
        },
      }
    )

    const account = await accountResponse.json()

    return new Response(
      JSON.stringify({
        canReceivePayouts: account.charges_enabled,
        onboardingComplete: account.details_submitted,
        account
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
