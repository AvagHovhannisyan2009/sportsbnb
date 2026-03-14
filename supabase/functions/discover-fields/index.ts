import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Geographic tiles across Armenia
const ARMENIA_TILES = [
  { key: "yerevan-center", lat: 40.1872, lng: 44.5152, radius: 3000 },
  { key: "yerevan-north", lat: 40.2100, lng: 44.5200, radius: 2000 },
  { key: "yerevan-south", lat: 40.1600, lng: 44.5000, radius: 2000 },
  { key: "yerevan-east", lat: 40.1900, lng: 44.5500, radius: 2000 },
  { key: "yerevan-west", lat: 40.1800, lng: 44.4800, radius: 2000 },
  { key: "gyumri", lat: 40.7929, lng: 43.8465, radius: 3000 },
  { key: "vanadzor", lat: 40.8128, lng: 44.4883, radius: 2000 },
  { key: "abovyan", lat: 40.2747, lng: 44.6267, radius: 2000 },
  { key: "etchmiadzin", lat: 40.1728, lng: 44.2925, radius: 2000 },
  { key: "hrazdan", lat: 40.5028, lng: 44.7656, radius: 2000 },
];

// Google Places types that map to sports facilities
const SPORTS_PLACE_TYPES = [
  "stadium",
  "sports_complex",
  "sports_club",
  "athletic_field",
  "fitness_center",
  "gym",
  "swimming_pool",
];

// Text search queries to find sports-specific facilities
const SEARCH_QUERIES = [
  "football field",
  "basketball court",
  "tennis court",
  "swimming pool",
  "sports complex",
  "stadium",
  "soccer field",
  "volleyball court",
];

function detectSportType(place: any): string {
  const name = (place.displayName?.text || "").toLowerCase();
  const types = (place.types || []).join(" ").toLowerCase();
  const combined = `${name} ${types}`;

  if (combined.includes("football") || combined.includes("soccer") || combined.includes("ֆուdelays")) return "football";
  if (combined.includes("basketball")) return "basketball";
  if (combined.includes("tennis")) return "tennis";
  if (combined.includes("volleyball")) return "volleyball";
  if (combined.includes("swimming") || combined.includes("pool") || combined.includes("aqua")) return "swimming";
  if (combined.includes("running") || combined.includes("track") || combined.includes("athletics")) return "running";
  if (combined.includes("stadium")) return "football";
  return "multi-sport";
}

function calculateConfidence(place: any): number {
  let score = 0.6; // base

  // Has user ratings → more likely real
  if (place.rating && place.rating > 0) score += 0.1;
  if (place.userRatingCount && place.userRatingCount > 5) score += 0.1;
  if (place.userRatingCount && place.userRatingCount > 20) score += 0.05;

  // Has address → more verified
  if (place.formattedAddress) score += 0.05;

  // Currently open info available
  if (place.currentOpeningHours || place.regularOpeningHours) score += 0.05;

  return Math.min(score, 1.0);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GOOGLE_MAPS_API_KEY) throw new Error("GOOGLE_MAPS_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const tileKey = body.tile_key || null;
    const tiles = tileKey
      ? ARMENIA_TILES.filter((t) => t.key === tileKey)
      : ARMENIA_TILES;

    if (tiles.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid tile_key" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalCandidates = 0;

    for (const tile of tiles) {
      // Check if this tile was already scanned recently (within 7 days)
      const { data: existing } = await supabase
        .from("candidate_fields")
        .select("id")
        .eq("tile_key", tile.key)
        .gte("detection_timestamp", new Date(Date.now() - 7 * 86400000).toISOString())
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`Tile ${tile.key} already scanned recently, skipping`);
        continue;
      }

      // Use Google Places API (New) - Nearby Search
      const placesUrl = "https://places.googleapis.com/v1/places:searchNearby";

      for (const query of SEARCH_QUERIES) {
        try {
          // Use Text Search for more specific results
          const textSearchUrl = "https://places.googleapis.com/v1/places:searchText";
          const searchResponse = await fetch(textSearchUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
              "X-Goog-FieldMask": "places.displayName,places.location,places.types,places.formattedAddress,places.rating,places.userRatingCount,places.currentOpeningHours,places.regularOpeningHours",
            },
            body: JSON.stringify({
              textQuery: `${query} in Armenia`,
              locationBias: {
                circle: {
                  center: { latitude: tile.lat, longitude: tile.lng },
                  radius: tile.radius,
                },
              },
              maxResultCount: 10,
              languageCode: "en",
            }),
          });

          if (!searchResponse.ok) {
            const errText = await searchResponse.text();
            console.error(`Places API error for "${query}" in ${tile.key}:`, searchResponse.status, errText);
            continue;
          }

          const searchResult = await searchResponse.json();
          const places = searchResult.places || [];

          for (const place of places) {
            if (!place.location?.latitude || !place.location?.longitude) continue;

            const lat = place.location.latitude;
            const lng = place.location.longitude;
            const sportType = detectSportType(place);
            const confidence = calculateConfidence(place);

            // Skip low confidence
            if (confidence < 0.6) continue;

            // Deduplicate against existing candidates (within ~100m)
            const { data: nearby } = await supabase
              .from("candidate_fields")
              .select("id")
              .gte("latitude", lat - 0.001)
              .lte("latitude", lat + 0.001)
              .gte("longitude", lng - 0.001)
              .lte("longitude", lng + 0.001)
              .limit(1);

            if (nearby && nearby.length > 0) continue;

            // Also check verified_fields to avoid duplicating already-verified places
            const { data: verifiedNearby } = await supabase
              .from("verified_fields")
              .select("id")
              .gte("latitude", lat - 0.001)
              .lte("latitude", lat + 0.001)
              .gte("longitude", lng - 0.001)
              .lte("longitude", lng + 0.001)
              .limit(1);

            if (verifiedNearby && verifiedNearby.length > 0) continue;

            const { error } = await supabase.from("candidate_fields").insert({
              latitude: lat,
              longitude: lng,
              detected_sport_type: sportType,
              confidence_score: confidence,
              detection_source: "google_places",
              tile_key: tile.key,
              status: "pending",
              raw_metadata: {
                name: place.displayName?.text || null,
                address: place.formattedAddress || null,
                rating: place.rating || null,
                user_rating_count: place.userRatingCount || null,
                google_types: place.types || [],
                search_query: query,
              },
            });

            if (error) {
              console.error("Insert error:", error);
            } else {
              totalCandidates++;
            }
          }
        } catch (queryErr) {
          console.error(`Query "${query}" failed for tile ${tile.key}:`, queryErr);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        candidates_added: totalCandidates,
        tiles_scanned: tiles.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("discover-fields error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
