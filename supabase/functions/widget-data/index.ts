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
    const { venueId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get venue data
    const { data: venue, error: venueError } = await supabaseClient
      .from('venues')
      .select('*, venue_images(*)')
      .eq('id', venueId)
      .single()

    if (venueError) throw venueError

    // Get availability
    const { data: availability } = await supabaseClient
      .from('venue_hours')
      .select('*')
      .eq('venue_id', venueId)

    // Get reviews
    const { data: reviews } = await supabaseClient
      .from('reviews')
      .select('rating')
      .eq('venue_id', venueId)

    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return new Response(
      JSON.stringify({
        venue: {
          ...venue,
          availability,
          rating: avgRating,
          reviewCount: reviews?.length || 0
        }
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
