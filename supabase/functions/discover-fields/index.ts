import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Geographic tiles across Armenia - major cities and areas
const ARMENIA_TILES = [
  { key: "yerevan-center", lat: 40.1872, lng: 44.5152, radius: 3 },
  { key: "yerevan-north", lat: 40.2100, lng: 44.5200, radius: 2 },
  { key: "yerevan-south", lat: 40.1600, lng: 44.5000, radius: 2 },
  { key: "yerevan-east", lat: 40.1900, lng: 44.5500, radius: 2 },
  { key: "yerevan-west", lat: 40.1800, lng: 44.4800, radius: 2 },
  { key: "gyumri", lat: 40.7929, lng: 43.8465, radius: 3 },
  { key: "vanadzor", lat: 40.8128, lng: 44.4883, radius: 2 },
  { key: "abovyan", lat: 40.2747, lng: 44.6267, radius: 2 },
  { key: "etchmiadzin", lat: 40.1728, lng: 44.2925, radius: 2 },
  { key: "hrazdan", lat: 40.5028, lng: 44.7656, radius: 2 },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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

      const prompt = `You are a sports facility detection system for Armenia. Analyze the geographic area around coordinates (${tile.lat}, ${tile.lng}) with a ${tile.radius}km radius (tile: ${tile.key}).

Based on your knowledge of this area, identify real sports facilities that exist there. Only include facilities you have high confidence actually exist. Types to detect: football fields/cages, basketball courts, tennis courts, volleyball courts, swimming pools, running tracks, multi-sport complexes.

For each facility, provide:
- latitude (precise to 4 decimal places)
- longitude (precise to 4 decimal places)
- sport_type (football, basketball, tennis, volleyball, swimming, running, multi-sport)
- confidence (0.0-1.0, only include if >= 0.6)
- reasoning (brief explanation of why you believe this exists)

CRITICAL RULES:
- Only report facilities you are confident exist based on real-world knowledge
- Do NOT invent or guess locations
- Prefer fewer accurate results over many uncertain ones
- Include well-known stadiums, public courts, school facilities, and sports complexes`;

      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You detect real sports facilities from geographic knowledge. Return ONLY the tool call, no other text." },
              { role: "user", content: prompt },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "report_detected_fields",
                  description: "Report detected sports fields/facilities in a geographic area",
                  parameters: {
                    type: "object",
                    properties: {
                      fields: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            latitude: { type: "number" },
                            longitude: { type: "number" },
                            sport_type: { type: "string", enum: ["football", "basketball", "tennis", "volleyball", "swimming", "running", "multi-sport"] },
                            confidence: { type: "number", minimum: 0, maximum: 1 },
                            reasoning: { type: "string" },
                          },
                          required: ["latitude", "longitude", "sport_type", "confidence", "reasoning"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["fields"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "report_detected_fields" } },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error(`AI error for tile ${tile.key}:`, response.status, errText);
        continue;
      }

      const aiResult = await response.json();
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        console.log(`No tool call for tile ${tile.key}`);
        continue;
      }

      let fields: any[];
      try {
        fields = JSON.parse(toolCall.function.arguments).fields || [];
      } catch {
        console.error(`Failed to parse AI response for tile ${tile.key}`);
        continue;
      }

      // Filter to high-confidence only (>= 0.6)
      const highConfidence = fields.filter((f: any) => f.confidence >= 0.6);

      // Deduplicate against existing candidates (within ~100m)
      for (const field of highConfidence) {
        const { data: nearby } = await supabase
          .from("candidate_fields")
          .select("id")
          .gte("latitude", field.latitude - 0.001)
          .lte("latitude", field.latitude + 0.001)
          .gte("longitude", field.longitude - 0.001)
          .lte("longitude", field.longitude + 0.001)
          .limit(1);

        if (nearby && nearby.length > 0) {
          console.log(`Duplicate candidate near ${field.latitude},${field.longitude}, skipping`);
          continue;
        }

        const { error } = await supabase.from("candidate_fields").insert({
          latitude: field.latitude,
          longitude: field.longitude,
          detected_sport_type: field.sport_type,
          confidence_score: field.confidence,
          detection_source: "ai_discovery",
          tile_key: tile.key,
          status: "pending",
          raw_metadata: { reasoning: field.reasoning },
        });

        if (error) {
          console.error("Insert error:", error);
        } else {
          totalCandidates++;
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
