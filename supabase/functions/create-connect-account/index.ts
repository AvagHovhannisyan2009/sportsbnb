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
          url: '#',
          message: 'Stripe Connect not configured'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user email
    const { data: userData } = await supabaseClient
      .from('users')
      .select('email, stripe_connect_id')
      .eq('id', user.id)
      .single()

    let accountId = userData?.stripe_connect_id

    // Create Connect account if doesn't exist
    if (!accountId) {
      const accountResponse = await fetch('https://api.stripe.com/v1/accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `type=express&email=${userData.email}&capabilities[card_payments][requested]=true&capabilities[transfers][requested]=true`,
      })

      const account = await accountResponse.json()
      accountId = account.id

      // Save account ID
      await supabaseClient
        .from('users')
        .update({ stripe_connect_id: accountId })
        .eq('id', user.id)
    }

    // Create account link for onboarding
    const linkResponse = await fetch('https://api.stripe.com/v1/account_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `account=${accountId}&refresh_url=${Deno.env.get('SUPABASE_URL')}/owner-dashboard?stripe_refresh=true&return_url=${Deno.env.get('SUPABASE_URL')}/owner-dashboard?stripe_onboarding=complete&type=account_onboarding`,
    })

    const link = await linkResponse.json()

    return new Response(
      JSON.stringify({ url: link.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
