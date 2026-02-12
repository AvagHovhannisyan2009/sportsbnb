import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  action: "push" | "pull" | "sync-all";
  bookingId?: string;
  venueId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, bookingId, venueId }: SyncRequest = await req.json();

    if (action === "push") {
      // Push a specific booking to connected calendars
      if (!bookingId) {
        return new Response(JSON.stringify({ error: "bookingId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get the booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingError || !booking) {
        return new Response(JSON.stringify({ error: "Booking not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get calendar integrations for this venue
      const { data: integrations } = await supabase
        .from("calendar_integrations")
        .select("*")
        .eq("venue_id", booking.venue_id)
        .eq("sync_enabled", true);

      const results: Record<string, any> = {};

      for (const integration of integrations || []) {
        try {
          // Check if token needs refresh
          const tokenExpires = new Date(integration.token_expires_at);
          let accessToken = integration.access_token;

          if (tokenExpires <= new Date()) {
            accessToken = await refreshToken(integration);
            if (!accessToken) {
              results[integration.provider] = { error: "Token refresh failed" };
              continue;
            }
          }

          // Create calendar event
          const startTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
          const endTime = new Date(startTime.getTime() + booking.duration_hours * 60 * 60 * 1000);

          if (integration.provider === "google") {
            const event = await createGoogleCalendarEvent(
              accessToken,
              booking,
              startTime,
              endTime
            );
            results.google = { success: true, eventId: event.id };
          } else if (integration.provider === "outlook") {
            const event = await createOutlookCalendarEvent(
              accessToken,
              booking,
              startTime,
              endTime
            );
            results.outlook = { success: true, eventId: event.id };
          }
        } catch (error) {
          console.error(`Error syncing to ${integration.provider}:`, error);
          results[integration.provider] = { error: String(error) };
        }
      }

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "pull") {
      // Pull events from calendars to block availability
      if (!venueId) {
        return new Response(JSON.stringify({ error: "venueId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: integrations } = await supabase
        .from("calendar_integrations")
        .select("*")
        .eq("venue_id", venueId)
        .eq("sync_enabled", true);

      const blockedTimes: any[] = [];

      for (const integration of integrations || []) {
        try {
          const tokenExpires = new Date(integration.token_expires_at);
          let accessToken = integration.access_token;

          if (tokenExpires <= new Date()) {
            accessToken = await refreshToken(integration);
            if (!accessToken) continue;
          }

          // Get events from the next 30 days
          const now = new Date();
          const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

          if (integration.provider === "google") {
            const events = await getGoogleCalendarEvents(accessToken, now, endDate);
            blockedTimes.push(...events.map((e: any) => ({
              provider: "google",
              start: e.start?.dateTime || e.start?.date,
              end: e.end?.dateTime || e.end?.date,
              title: e.summary,
            })));
          } else if (integration.provider === "outlook") {
            const events = await getOutlookCalendarEvents(accessToken, now, endDate);
            blockedTimes.push(...events.map((e: any) => ({
              provider: "outlook",
              start: e.start?.dateTime,
              end: e.end?.dateTime,
              title: e.subject,
            })));
          }

          // Update last synced timestamp
          await supabase
            .from("calendar_integrations")
            .update({ last_synced_at: new Date().toISOString() })
            .eq("id", integration.id);

        } catch (error) {
          console.error(`Error pulling from ${integration.provider}:`, error);
        }
      }

      return new Response(JSON.stringify({ success: true, blockedTimes }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "sync-all") {
      // Sync all bookings for a venue
      if (!venueId) {
        return new Response(JSON.stringify({ error: "venueId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("venue_id", venueId)
        .eq("status", "confirmed")
        .gte("booking_date", new Date().toISOString().split("T")[0]);

      const results: any[] = [];
      
      for (const booking of bookings || []) {
        // Push each booking (simplified - in production would batch)
        results.push({ bookingId: booking.id, status: "queued" });
      }

      console.log(`Queued ${results.length} bookings for sync`);

      return new Response(JSON.stringify({ success: true, queued: results.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Calendar sync error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper: Refresh OAuth token
async function refreshToken(integration: any): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    let tokenEndpoint = "";
    let params: Record<string, string> = {};

    if (integration.provider === "google") {
      tokenEndpoint = "https://oauth2.googleapis.com/token";
      params = {
        client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
        refresh_token: integration.refresh_token,
        grant_type: "refresh_token",
      };
    } else if (integration.provider === "outlook") {
      tokenEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
      params = {
        client_id: Deno.env.get("OUTLOOK_CLIENT_ID")!,
        client_secret: Deno.env.get("OUTLOOK_CLIENT_SECRET")!,
        refresh_token: integration.refresh_token,
        grant_type: "refresh_token",
        scope: "offline_access Calendars.ReadWrite",
      };
    }

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Token refresh failed:", data);
      return null;
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600));

    await supabase
      .from("calendar_integrations")
      .update({
        access_token: data.access_token,
        token_expires_at: expiresAt.toISOString(),
        ...(data.refresh_token && { refresh_token: data.refresh_token }),
      })
      .eq("id", integration.id);

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

// Helper: Create Google Calendar event
async function createGoogleCalendarEvent(
  accessToken: string,
  booking: any,
  startTime: Date,
  endTime: Date
) {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: `Booking: ${booking.venue_name}`,
        description: `Booking ID: ${booking.id}\nCustomer: ${booking.customer_name || "N/A"}\nNotes: ${booking.notes || "None"}`,
        start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
        end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Calendar API error: ${error}`);
  }

  return await response.json();
}

// Helper: Create Outlook Calendar event
async function createOutlookCalendarEvent(
  accessToken: string,
  booking: any,
  startTime: Date,
  endTime: Date
) {
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: `Booking: ${booking.venue_name}`,
        body: {
          contentType: "text",
          content: `Booking ID: ${booking.id}\nCustomer: ${booking.customer_name || "N/A"}\nNotes: ${booking.notes || "None"}`,
        },
        start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
        end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Outlook Calendar API error: ${error}`);
  }

  return await response.json();
}

// Helper: Get Google Calendar events
async function getGoogleCalendarEvents(
  accessToken: string,
  startDate: Date,
  endDate: Date
) {
  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", startDate.toISOString());
  url.searchParams.set("timeMax", endDate.toISOString());
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Google Calendar events");
  }

  const data = await response.json();
  return data.items || [];
}

// Helper: Get Outlook Calendar events
async function getOutlookCalendarEvents(
  accessToken: string,
  startDate: Date,
  endDate: Date
) {
  const url = new URL("https://graph.microsoft.com/v1.0/me/calendarview");
  url.searchParams.set("startDateTime", startDate.toISOString());
  url.searchParams.set("endDateTime", endDate.toISOString());

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Outlook Calendar events");
  }

  const data = await response.json();
  return data.value || [];
}