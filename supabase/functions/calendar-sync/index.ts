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
    const { venueId, accessToken } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'No access token provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get bookings for venue
    const { data: bookings } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('venue_id', venueId)
      .gte('booking_date', new Date().toISOString().split('T')[0])

    // Sync each booking to Google Calendar
    const syncedEvents = []
    for (const booking of bookings || []) {
      const event = {
        summary: `Booking at Venue`,
        start: {
          dateTime: `${booking.booking_date}T${booking.booking_time}`,
          timeZone: 'UTC',
        },
        end: {
          dateTime: `${booking.booking_date}T${booking.booking_time}`,
          timeZone: 'UTC',
        },
      }

      const eventResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      )

      if (eventResponse.ok) {
        syncedEvents.push(await eventResponse.json())
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        syncedCount: syncedEvents.length
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
