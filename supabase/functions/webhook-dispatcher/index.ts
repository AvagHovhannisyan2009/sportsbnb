import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Declare EdgeRuntime for Deno
declare const EdgeRuntime: { waitUntil: (promise: Promise<unknown>) => void } | undefined;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  event_type: string;
  timestamp: string;
  data: Record<string, unknown>;
}

async function sendWebhook(url: string, payload: WebhookPayload): Promise<boolean> {
  try {
    console.log(`Sending webhook to ${url} for event: ${payload.event_type}`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log(`Webhook response status: ${response.status}`);
    return response.ok;
  } catch (error) {
    console.error(`Webhook failed for ${url}:`, error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { event_type, data, venue_id } = await req.json();
    console.log(`Processing webhook dispatch for event: ${event_type}`);

    const webhookUrls: string[] = [];

    // Get global webhook URL based on event type
    let settingKey = "";
    switch (event_type) {
      case "booking_created":
        settingKey = "make_webhook_bookings";
        break;
      case "booking_cancelled":
        settingKey = "make_webhook_cancellations";
        break;
      case "user_signup":
        settingKey = "make_webhook_signups";
        break;
      case "venue_created":
        settingKey = "make_webhook_venues";
        break;
    }

    if (settingKey) {
      const { data: globalSetting } = await supabaseClient
        .from("platform_settings")
        .select("setting_value")
        .eq("setting_key", settingKey)
        .single();

      if (globalSetting?.setting_value) {
        webhookUrls.push(globalSetting.setting_value);
        console.log(`Found global webhook for ${settingKey}`);
      }
    }

    // Get venue-specific webhook if venue_id is provided
    if (venue_id && (event_type === "booking_created" || event_type === "booking_cancelled")) {
      const { data: venue } = await supabaseClient
        .from("venues")
        .select("make_webhook_url, make_webhook_events")
        .eq("id", venue_id)
        .single();

      if (venue?.make_webhook_url && venue.make_webhook_events?.includes(event_type)) {
        webhookUrls.push(venue.make_webhook_url);
        console.log(`Found venue-specific webhook for venue ${venue_id}`);
      }
    }

    if (webhookUrls.length === 0) {
      console.log("No webhook URLs configured for this event");
      return new Response(
        JSON.stringify({ success: true, message: "No webhooks configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const payload: WebhookPayload = {
      event_type,
      timestamp: new Date().toISOString(),
      data,
    };

    // Send webhooks in background
    const webhookPromises = webhookUrls.map((url) => sendWebhook(url, payload));
    
    // Use EdgeRuntime.waitUntil if available for background processing
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(Promise.all(webhookPromises));
      return new Response(
        JSON.stringify({ success: true, webhooks_queued: webhookUrls.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Fallback: wait for webhooks to complete
    const results = await Promise.all(webhookPromises);
    const successCount = results.filter(Boolean).length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        webhooks_sent: successCount,
        webhooks_total: webhookUrls.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Webhook dispatcher error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
