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

// Expanded search queries - now includes public/residential area fields
const SEARCH_QUERIES = [
  // Commercial / professional venues
  "football field",
  "basketball court",
  "tennis court",
  "swimming pool",
  "sports complex",
  "stadium",
  "soccer field",
  "volleyball court",
  // Public / residential area fields
  "outdoor basketball court",
  "public sports ground",
  "neighborhood sports field",
  "park basketball court",
  "park football field",
  "open air gym",
  "street workout park",
  "public playground sports",
  "mini football pitch",
  "futsal court",
  "running track",
  "athletics field",
];

function detectSportType(place: any): string {
  const name = (place.displayName?.text || "").toLowerCase();
  const types = (place.types || []).join(" ").toLowerCase();
  const combined = `${name} ${types}`;

  if (combined.includes("football") || combined.includes("soccer") || combined.includes("futsal")) return "football";
  if (combined.includes("basketball")) return "basketball";
  if (combined.includes("tennis")) return "tennis";
  if (combined.includes("volleyball")) return "volleyball";
  if (combined.includes("swimming") || combined.includes("pool") || combined.includes("aqua")) return "swimming";
  if (combined.includes("running") || combined.includes("track") || combined.includes("athletics")) return "running";
  if (combined.includes("workout") || combined.includes("gym") || combined.includes("fitness")) return "fitness";
  if (combined.includes("stadium")) return "football";
  return "multi-sport";
}

function calculateConfidence(place: any): number {
  let score = 0.6;
  if (place.rating && place.rating > 0) score += 0.1;
  if (place.userRatingCount && place.userRatingCount > 5) score += 0.1;
  if (place.userRatingCount && place.userRatingCount > 20) score += 0.05;
  if (place.formattedAddress) score += 0.05;
  if (place.currentOpeningHours || place.regularOpeningHours) score += 0.05;
  return Math.min(score, 1.0);
}

// AI verification using Gemini to double-check each candidate
async function aiVerifyCandidate(
  place: any,
  detectedSport: string,
  searchQuery: string,
  lovableApiKey: string
): Promise<{ isReal: boolean; isSuspicious: boolean; suggestedName: string; sportType: string; reason: string }> {
  try {
    const placeName = place.displayName?.text || "Unknown";
    const placeAddress = place.formattedAddress || "No address";
    const placeTypes = (place.types || []).join(", ");
    const placeRating = place.rating || "N/A";
    const reviewCount = place.userRatingCount || 0;

    const prompt = `You are a sports facility verification expert. Analyze this Google Places result and determine if it is ACTUALLY a sports facility (field, court, pool, gym, etc.) or a false positive (hotel, restaurant, shopping mall, residential building, etc.).

Place details:
- Name: "${placeName}"
- Address: "${placeAddress}"
- Google Place types: [${placeTypes}]
- Rating: ${placeRating} (${reviewCount} reviews)
- Found via search query: "${searchQuery}"
- Detected sport: "${detectedSport}"

IMPORTANT: Public sports fields in residential areas, parks, and neighborhoods ARE valid. Hotels, restaurants, malls, and non-sports businesses are NOT valid even if they have "sport" in their name.

Respond in EXACTLY this JSON format (no extra text):
{
  "is_real_sports_facility": true/false,
  "is_suspicious": true/false,
  "suggested_name": "A clear, concise name for this facility (e.g. 'Abovyan Park Basketball Court')",
  "corrected_sport_type": "football|basketball|tennis|volleyball|swimming|running|fitness|multi-sport",
  "reason": "Brief explanation of your verdict"
}

Rules:
- is_real_sports_facility: true ONLY if this is genuinely a place where people play sports
- is_suspicious: true if you're unsure or the data seems contradictory (flag for human review)
- suggested_name: Create a proper facility name even if the Google name is generic. Include the sport type and location/neighborhood if possible.
- corrected_sport_type: The actual sport, correcting any misdetection`;

    const response = await fetch("https://aeyqnrwmqmvsfendqypd.supabase.co/functions/v1/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "google/gemini-2.5-flash",
      }),
    });

    // Fallback: call Gemini directly via Lovable AI proxy
    const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI verification failed, defaulting to manual review:", await aiResponse.text());
      return {
        isReal: true,
        isSuspicious: true,
        suggestedName: place.displayName?.text || `${detectedSport} facility`,
        sportType: detectedSport,
        reason: "AI verification unavailable - flagged for manual review",
      };
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not parse AI response:", content);
      return {
        isReal: true,
        isSuspicious: true,
        suggestedName: place.displayName?.text || `${detectedSport} facility`,
        sportType: detectedSport,
        reason: "AI response unparseable - flagged for manual review",
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      isReal: parsed.is_real_sports_facility === true,
      isSuspicious: parsed.is_suspicious === true,
      suggestedName: parsed.suggested_name || place.displayName?.text || `${detectedSport} facility`,
      sportType: parsed.corrected_sport_type || detectedSport,
      reason: parsed.reason || "",
    };
  } catch (err) {
    console.error("AI verification error:", err);
    return {
      isReal: true,
      isSuspicious: true,
      suggestedName: place.displayName?.text || `${detectedSport} facility`,
      sportType: detectedSport,
      reason: "AI verification error - flagged for manual review",
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

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
    let autoApproved = 0;
    let flaggedForReview = 0;
    let rejected = 0;

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

      for (const query of SEARCH_QUERIES) {
        try {
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
            console.error(`Places API error for "${query}" in ${tile.key}:`, searchResponse.status);
            continue;
          }

          const searchResult = await searchResponse.json();
          const places = searchResult.places || [];

          for (const place of places) {
            if (!place.location?.latitude || !place.location?.longitude) continue;

            const lat = place.location.latitude;
            const lng = place.location.longitude;
            const detectedSport = detectSportType(place);
            const confidence = calculateConfidence(place);

            if (confidence < 0.6) continue;

            // Spatial deduplication - candidate_fields
            const { data: nearby } = await supabase
              .from("candidate_fields")
              .select("id")
              .gte("latitude", lat - 0.001)
              .lte("latitude", lat + 0.001)
              .gte("longitude", lng - 0.001)
              .lte("longitude", lng + 0.001)
              .limit(1);

            if (nearby && nearby.length > 0) continue;

            // Spatial deduplication - verified_fields
            const { data: verifiedNearby } = await supabase
              .from("verified_fields")
              .select("id")
              .gte("latitude", lat - 0.001)
              .lte("latitude", lat + 0.001)
              .gte("longitude", lng - 0.001)
              .lte("longitude", lng + 0.001)
              .limit(1);

            if (verifiedNearby && verifiedNearby.length > 0) continue;

            // --- AI Double-Check ---
            let aiResult = {
              isReal: true,
              isSuspicious: true,
              suggestedName: place.displayName?.text || `${detectedSport} facility`,
              sportType: detectedSport,
              reason: "No AI verification available",
            };

            if (LOVABLE_API_KEY) {
              aiResult = await aiVerifyCandidate(place, detectedSport, query, LOVABLE_API_KEY);
            }

            // If AI says it's NOT a real sports facility, reject silently
            if (!aiResult.isReal) {
              console.log(`AI rejected: "${place.displayName?.text}" - ${aiResult.reason}`);
              rejected++;
              continue;
            }

            // Determine status based on AI verdict
            let status: string;
            if (aiResult.isSuspicious) {
              status = "needs_review"; // Admin will see these flagged
              flaggedForReview++;
            } else {
              status = "auto_approved"; // AI confident, auto-approve
              autoApproved++;
            }

            // Insert into candidate_fields with AI metadata
            const { data: insertedCandidate, error: insertError } = await supabase
              .from("candidate_fields")
              .insert({
                latitude: lat,
                longitude: lng,
                detected_sport_type: aiResult.sportType,
                confidence_score: confidence,
                detection_source: "google_places",
                tile_key: tile.key,
                status,
                raw_metadata: {
                  name: place.displayName?.text || null,
                  address: place.formattedAddress || null,
                  rating: place.rating || null,
                  user_rating_count: place.userRatingCount || null,
                  google_types: place.types || [],
                  search_query: query,
                  ai_suggested_name: aiResult.suggestedName,
                  ai_sport_type: aiResult.sportType,
                  ai_reason: aiResult.reason,
                  ai_verified: true,
                },
              })
              .select("id")
              .single();

            if (insertError) {
              console.error("Insert error:", insertError);
              continue;
            }

            totalCandidates++;

            // If auto-approved, also insert into verified_fields immediately
            if (status === "auto_approved" && insertedCandidate) {
              const { error: verifiedError } = await supabase.from("verified_fields").insert({
                candidate_id: insertedCandidate.id,
                name: aiResult.suggestedName,
                latitude: lat,
                longitude: lng,
                sport_type: aiResult.sportType,
                city: tile.key.startsWith("yerevan") ? "Yerevan" :
                  tile.key === "gyumri" ? "Gyumri" :
                  tile.key === "vanadzor" ? "Vanadzor" :
                  tile.key === "abovyan" ? "Abovyan" :
                  tile.key === "etchmiadzin" ? "Etchmiadzin" :
                  tile.key === "hrazdan" ? "Hrazdan" : "Armenia",
                address: place.formattedAddress || null,
                is_public: true,
                verification_status: "verified",
              });

              if (verifiedError) {
                console.error("Verified insert error:", verifiedError);
              }
            }

            // If suspicious, notify admin via notification
            if (status === "needs_review") {
              // Find admin users
              const { data: admins } = await supabase
                .from("user_roles")
                .select("user_id")
                .eq("role", "admin");

              if (admins && admins.length > 0) {
                const notifications = admins.map((admin) => ({
                  user_id: admin.user_id,
                  type: "discovery",
                  title: "🔍 Suspicious field detected",
                  message: `AI flagged "${aiResult.suggestedName}" for review: ${aiResult.reason}`,
                  link: "/admin?tab=discovery",
                }));

                await supabase.from("notifications").insert(notifications);
              }
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
        auto_approved: autoApproved,
        flagged_for_review: flaggedForReview,
        rejected_by_ai: rejected,
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
