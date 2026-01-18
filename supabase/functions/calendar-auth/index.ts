import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, provider, code, venueId, redirectUri } = await req.json();
    
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

    if (action === "get-auth-url") {
      // Generate OAuth authorization URL
      let authUrl = "";
      const state = btoa(JSON.stringify({ userId: user.id, venueId, provider }));
      
      if (provider === "google") {
        const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
        if (!clientId) {
          return new Response(JSON.stringify({ error: "Google OAuth not configured" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        const scopes = [
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/calendar.events"
        ].join(" ");
        
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${clientId}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent(scopes)}` +
          `&access_type=offline` +
          `&prompt=consent` +
          `&state=${encodeURIComponent(state)}`;
          
      } else if (provider === "outlook") {
        const clientId = Deno.env.get("OUTLOOK_CLIENT_ID");
        if (!clientId) {
          return new Response(JSON.stringify({ error: "Outlook OAuth not configured" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        const scopes = [
          "offline_access",
          "Calendars.ReadWrite"
        ].join(" ");
        
        authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
          `client_id=${clientId}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent(scopes)}` +
          `&state=${encodeURIComponent(state)}`;
      }

      console.log(`Generated ${provider} auth URL for user ${user.id}`);
      
      return new Response(JSON.stringify({ authUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "exchange-code") {
      // Exchange authorization code for tokens
      let tokenEndpoint = "";
      let tokenParams: Record<string, string> = {};
      
      if (provider === "google") {
        tokenEndpoint = "https://oauth2.googleapis.com/token";
        tokenParams = {
          client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
          client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        };
      } else if (provider === "outlook") {
        tokenEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
        tokenParams = {
          client_id: Deno.env.get("OUTLOOK_CLIENT_ID")!,
          client_secret: Deno.env.get("OUTLOOK_CLIENT_SECRET")!,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          scope: "offline_access Calendars.ReadWrite",
        };
      }

      console.log(`Exchanging code for ${provider} tokens`);

      const tokenResponse = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(tokenParams),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error("Token exchange error:", tokenData);
        return new Response(JSON.stringify({ error: "Failed to exchange code", details: tokenData }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Calculate token expiration
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 3600));

      // Store tokens in database
      const { error: upsertError } = await supabase
        .from("calendar_integrations")
        .upsert({
          user_id: user.id,
          venue_id: venueId,
          provider,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt.toISOString(),
          sync_enabled: true,
        }, {
          onConflict: "user_id,venue_id,provider"
        });

      if (upsertError) {
        console.error("Database error:", upsertError);
        return new Response(JSON.stringify({ error: "Failed to save integration" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Successfully connected ${provider} calendar for user ${user.id}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "disconnect") {
      const { error: deleteError } = await supabase
        .from("calendar_integrations")
        .delete()
        .eq("user_id", user.id)
        .eq("venue_id", venueId)
        .eq("provider", provider);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        return new Response(JSON.stringify({ error: "Failed to disconnect" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Disconnected ${provider} calendar for user ${user.id}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-status") {
      const { data: integrations, error: fetchError } = await supabase
        .from("calendar_integrations")
        .select("*")
        .eq("user_id", user.id)
        .eq("venue_id", venueId);

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        return new Response(JSON.stringify({ error: "Failed to fetch integrations" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const status: Record<string, boolean> = {};
      for (const integration of integrations || []) {
        status[integration.provider] = integration.sync_enabled;
      }

      return new Response(JSON.stringify({ integrations: status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Calendar auth error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});