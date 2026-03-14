import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ======= COMPREHENSIVE ARMENIA TILE GRID =======
// Dense coverage of Yerevan (1km grid) + all major/minor cities + towns/villages
const ARMENIA_TILES = [
  // ---- YEREVAN - Dense 1km grid coverage ----
  // Central Yerevan
  { key: "yer-center", lat: 40.1772, lng: 44.5126, radius: 1000 },
  { key: "yer-republic-sq", lat: 40.1777, lng: 44.5132, radius: 800 },
  { key: "yer-cascade", lat: 40.1920, lng: 44.5150, radius: 1000 },
  { key: "yer-opera", lat: 40.1860, lng: 44.5150, radius: 800 },
  { key: "yer-kentron-n", lat: 40.1850, lng: 44.5050, radius: 1000 },
  { key: "yer-kentron-s", lat: 40.1700, lng: 44.5100, radius: 1000 },
  { key: "yer-kentron-e", lat: 40.1780, lng: 44.5250, radius: 1000 },
  
  // Northern Yerevan
  { key: "yer-arabkir-c", lat: 40.2000, lng: 44.5050, radius: 1200 },
  { key: "yer-arabkir-n", lat: 40.2100, lng: 44.5000, radius: 1200 },
  { key: "yer-arabkir-w", lat: 40.2050, lng: 44.4900, radius: 1000 },
  { key: "yer-kanaker", lat: 40.2150, lng: 44.5250, radius: 1200 },
  { key: "yer-zeytun-c", lat: 40.2050, lng: 44.5200, radius: 1200 },
  { key: "yer-zeytun-n", lat: 40.2150, lng: 44.5150, radius: 1000 },
  { key: "yer-avan-c", lat: 40.2100, lng: 44.5500, radius: 1200 },
  { key: "yer-avan-n", lat: 40.2200, lng: 44.5600, radius: 1200 },
  { key: "yer-avan-e", lat: 40.2050, lng: 44.5650, radius: 1000 },
  { key: "yer-nor-nork-c", lat: 40.2000, lng: 44.5500, radius: 1200 },
  { key: "yer-nor-nork-n", lat: 40.2100, lng: 44.5400, radius: 1000 },
  { key: "yer-nork-c", lat: 40.2000, lng: 44.5350, radius: 1200 },
  { key: "yer-nork-e", lat: 40.1950, lng: 44.5450, radius: 1000 },
  
  // Eastern Yerevan
  { key: "yer-erebuni-c", lat: 40.1550, lng: 44.5300, radius: 1200 },
  { key: "yer-erebuni-s", lat: 40.1450, lng: 44.5250, radius: 1200 },
  { key: "yer-erebuni-e", lat: 40.1500, lng: 44.5450, radius: 1200 },
  { key: "yer-nubarashen", lat: 40.1400, lng: 44.5600, radius: 1500 },
  
  // Southern Yerevan
  { key: "yer-shengavit-c", lat: 40.1600, lng: 44.4950, radius: 1200 },
  { key: "yer-shengavit-s", lat: 40.1500, lng: 44.4900, radius: 1200 },
  { key: "yer-shengavit-w", lat: 40.1550, lng: 44.4800, radius: 1000 },
  { key: "yer-malatia-c", lat: 40.1650, lng: 44.4750, radius: 1200 },
  { key: "yer-malatia-s", lat: 40.1550, lng: 44.4700, radius: 1200 },
  { key: "yer-sebastia", lat: 40.1700, lng: 44.4650, radius: 1200 },
  
  // Western Yerevan
  { key: "yer-davtashen-c", lat: 40.2150, lng: 44.4850, radius: 1200 },
  { key: "yer-davtashen-n", lat: 40.2250, lng: 44.4800, radius: 1000 },
  { key: "yer-ajapnyak-c", lat: 40.2050, lng: 44.4750, radius: 1200 },
  { key: "yer-ajapnyak-n", lat: 40.2150, lng: 44.4700, radius: 1000 },
  { key: "yer-ajapnyak-s", lat: 40.1950, lng: 44.4700, radius: 1000 },
  
  // Yerevan outskirts / edges
  { key: "yer-hrazdan-gorge", lat: 40.1900, lng: 44.4950, radius: 1500 },
  { key: "yer-tsitsernakaberd", lat: 40.1850, lng: 44.4900, radius: 1000 },
  { key: "yer-dalma", lat: 40.1950, lng: 44.5300, radius: 1000 },
  { key: "yer-komitas", lat: 40.2000, lng: 44.5100, radius: 1000 },
  { key: "yer-baghramyan", lat: 40.1920, lng: 44.5050, radius: 800 },
  { key: "yer-monument", lat: 40.2050, lng: 44.5050, radius: 800 },
  
  // ---- MAJOR CITIES ----
  // Gyumri (2nd largest)
  { key: "gyumri-center", lat: 40.7929, lng: 43.8465, radius: 1500 },
  { key: "gyumri-north", lat: 40.8050, lng: 43.8500, radius: 1500 },
  { key: "gyumri-south", lat: 40.7800, lng: 43.8400, radius: 1500 },
  { key: "gyumri-east", lat: 40.7930, lng: 43.8650, radius: 1500 },
  { key: "gyumri-west", lat: 40.7930, lng: 43.8280, radius: 1500 },
  { key: "gyumri-northwest", lat: 40.8100, lng: 43.8300, radius: 1500 },
  
  // Vanadzor (3rd largest)
  { key: "vanadzor-center", lat: 40.8128, lng: 44.4883, radius: 1500 },
  { key: "vanadzor-north", lat: 40.8250, lng: 44.4900, radius: 1500 },
  { key: "vanadzor-south", lat: 40.8000, lng: 44.4850, radius: 1500 },
  { key: "vanadzor-east", lat: 40.8130, lng: 44.5050, radius: 1500 },
  
  // Abovyan
  { key: "abovyan-center", lat: 40.2747, lng: 44.6267, radius: 1500 },
  { key: "abovyan-north", lat: 40.2850, lng: 44.6300, radius: 1500 },
  { key: "abovyan-south", lat: 40.2650, lng: 44.6200, radius: 1500 },
  
  // Etchmiadzin (Vagharshapat)
  { key: "etchmiadzin-center", lat: 40.1728, lng: 44.2925, radius: 1500 },
  { key: "etchmiadzin-north", lat: 40.1850, lng: 44.2950, radius: 1500 },
  { key: "etchmiadzin-south", lat: 40.1600, lng: 44.2900, radius: 1500 },
  
  // Hrazdan
  { key: "hrazdan-center", lat: 40.5028, lng: 44.7656, radius: 1500 },
  { key: "hrazdan-north", lat: 40.5150, lng: 44.7700, radius: 1500 },
  
  // Kapan
  { key: "kapan-center", lat: 39.2075, lng: 46.4064, radius: 2000 },
  { key: "kapan-north", lat: 39.2200, lng: 46.4100, radius: 1500 },
  
  // Armavir
  { key: "armavir-center", lat: 40.1539, lng: 44.0383, radius: 1500 },
  { key: "armavir-suburbs", lat: 40.1650, lng: 44.0450, radius: 1500 },
  
  // Charentsavan
  { key: "charentsavan-c", lat: 40.4100, lng: 44.6400, radius: 1500 },
  
  // Sevan
  { key: "sevan-center", lat: 40.5478, lng: 44.9403, radius: 1500 },
  { key: "sevan-lake", lat: 40.5600, lng: 44.9300, radius: 1500 },
  
  // Artashat
  { key: "artashat-center", lat: 39.9533, lng: 44.5514, radius: 1500 },
  
  // Ashtarak
  { key: "ashtarak-center", lat: 40.2983, lng: 44.3619, radius: 1500 },
  
  // Ararat (city)
  { key: "ararat-center", lat: 39.8303, lng: 44.7050, radius: 1500 },
  
  // Masis
  { key: "masis-center", lat: 40.0661, lng: 44.4197, radius: 1500 },
  
  // Ijevan
  { key: "ijevan-center", lat: 40.8789, lng: 45.1481, radius: 1500 },
  
  // Goris
  { key: "goris-center", lat: 39.5108, lng: 46.3422, radius: 1500 },
  
  // Sisian
  { key: "sisian-center", lat: 39.5264, lng: 46.0289, radius: 1500 },
  
  // Dilijan
  { key: "dilijan-center", lat: 40.7406, lng: 44.8625, radius: 1500 },
  
  // Yeghegnadzor
  { key: "yeghegnadzor-c", lat: 39.7617, lng: 45.3328, radius: 1500 },
  
  // Martuni
  { key: "martuni-center", lat: 40.1406, lng: 45.3069, radius: 1500 },
  
  // Gavar (Kamo)
  { key: "gavar-center", lat: 40.3539, lng: 45.1261, radius: 1500 },
  
  // Vardenis
  { key: "vardenis-center", lat: 40.1831, lng: 45.7186, radius: 1500 },
  
  // Spitak
  { key: "spitak-center", lat: 40.8339, lng: 44.2669, radius: 1500 },
  
  // Alaverdi
  { key: "alaverdi-center", lat: 41.0964, lng: 44.6717, radius: 1500 },
  
  // Stepanavan
  { key: "stepanavan-c", lat: 41.0036, lng: 44.3858, radius: 1500 },
  
  // Tashir
  { key: "tashir-center", lat: 41.1228, lng: 44.2800, radius: 1500 },
  
  // Meghri
  { key: "meghri-center", lat: 38.9028, lng: 46.2444, radius: 1500 },
  
  // Jermuk
  { key: "jermuk-center", lat: 39.8422, lng: 45.6689, radius: 1500 },
  
  // ---- TOWNS & VILLAGES ----
  { key: "byureghavan", lat: 40.3144, lng: 44.5956, radius: 1500 },
  { key: "nor-hachn", lat: 40.3358, lng: 44.5819, radius: 1200 },
  { key: "ptghni", lat: 40.2417, lng: 44.5722, radius: 1200 },
  { key: "garni", lat: 40.1128, lng: 44.7317, radius: 1200 },
  { key: "geghard", lat: 40.1406, lng: 44.8172, radius: 1200 },
  { key: "tsakhkadzor", lat: 40.5322, lng: 44.7272, radius: 1500 },
  { key: "bjni", lat: 40.4544, lng: 44.6500, radius: 1200 },
  { key: "yeghvard", lat: 40.3272, lng: 44.4889, radius: 1500 },
  { key: "nor-geghi", lat: 40.2200, lng: 44.5850, radius: 1200 },
  { key: "metsamor", lat: 40.1400, lng: 44.1150, radius: 1200 },
  { key: "parakar", lat: 40.1900, lng: 44.3400, radius: 1200 },
  { key: "merdzavan", lat: 40.2300, lng: 44.4200, radius: 1200 },
  { key: "proshyan", lat: 40.2600, lng: 44.4700, radius: 1200 },
  { key: "noyemberyan", lat: 41.1753, lng: 44.9986, radius: 1200 },
  { key: "berd", lat: 40.8797, lng: 45.3889, radius: 1200 },
  { key: "chambarak", lat: 40.5922, lng: 45.3539, radius: 1200 },
  { key: "vedi", lat: 39.9139, lng: 44.7275, radius: 1200 },
  { key: "areni", lat: 39.7208, lng: 45.1803, radius: 1200 },
  { key: "vayk", lat: 39.6917, lng: 45.4694, radius: 1200 },
  { key: "agarak", lat: 38.8608, lng: 46.2275, radius: 1200 },
  { key: "kajaran", lat: 39.1508, lng: 46.1542, radius: 1200 },
  { key: "aparan", lat: 40.5928, lng: 44.3592, radius: 1200 },
  { key: "talin", lat: 40.3864, lng: 43.9342, radius: 1200 },
  { key: "maralik", lat: 40.5747, lng: 43.6861, radius: 1200 },
  { key: "artik", lat: 40.6197, lng: 43.7642, radius: 1200 },
];

// Comprehensive search queries for maximum coverage
const SEARCH_QUERIES = [
  // Core sport facility types
  "football field",
  "basketball court",
  "tennis court",
  "swimming pool",
  "sports complex",
  "stadium",
  "soccer field",
  "volleyball court",
  // Public / outdoor / neighborhood
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
  // Armenian-specific / local
  "ֆուdelays",
  "sports school",
  "sport club",
  "fitness center",
  "martial arts gym",
  "boxing gym",
  "wrestling gym",
  "ice rink",
  "skating rink",
  "badminton court",
  "table tennis club",
  "CrossFit gym",
  "gym sports",
  "recreation center",
  "children sports school",
  "Olympic sports school",
  "training field",
  "practice field",
  "multipurpose sports hall",
  "handball court",
  "sport hall",
  "sports arena",
  "football academy",
  "basketball academy",
  "sport park",
  "play field",
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
  if (combined.includes("workout") || combined.includes("gym") || combined.includes("fitness") || combined.includes("crossfit")) return "fitness";
  if (combined.includes("boxing") || combined.includes("wrestling") || combined.includes("martial")) return "martial-arts";
  if (combined.includes("handball")) return "handball";
  if (combined.includes("badminton")) return "badminton";
  if (combined.includes("skating") || combined.includes("ice rink")) return "skating";
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

function getCityFromTileKey(tileKey: string): string {
  if (tileKey.startsWith("yer-")) return "Yerevan";
  if (tileKey.startsWith("gyumri")) return "Gyumri";
  if (tileKey.startsWith("vanadzor")) return "Vanadzor";
  if (tileKey.startsWith("abovyan")) return "Abovyan";
  if (tileKey.startsWith("etchmiadzin")) return "Etchmiadzin";
  if (tileKey.startsWith("hrazdan")) return "Hrazdan";
  if (tileKey.startsWith("kapan")) return "Kapan";
  if (tileKey.startsWith("armavir")) return "Armavir";
  if (tileKey.startsWith("charentsavan")) return "Charentsavan";
  if (tileKey.startsWith("sevan")) return "Sevan";
  if (tileKey.startsWith("artashat")) return "Artashat";
  if (tileKey.startsWith("ashtarak")) return "Ashtarak";
  if (tileKey.startsWith("ararat")) return "Ararat";
  if (tileKey.startsWith("masis")) return "Masis";
  if (tileKey.startsWith("ijevan")) return "Ijevan";
  if (tileKey.startsWith("goris")) return "Goris";
  if (tileKey.startsWith("sisian")) return "Sisian";
  if (tileKey.startsWith("dilijan")) return "Dilijan";
  if (tileKey.startsWith("yeghegnadzor")) return "Yeghegnadzor";
  if (tileKey.startsWith("martuni")) return "Martuni";
  if (tileKey.startsWith("gavar")) return "Gavar";
  if (tileKey.startsWith("vardenis")) return "Vardenis";
  if (tileKey.startsWith("spitak")) return "Spitak";
  if (tileKey.startsWith("alaverdi")) return "Alaverdi";
  if (tileKey.startsWith("stepanavan")) return "Stepanavan";
  if (tileKey.startsWith("tashir")) return "Tashir";
  if (tileKey.startsWith("meghri")) return "Meghri";
  if (tileKey.startsWith("jermuk")) return "Jermuk";
  if (tileKey === "byureghavan") return "Byureghavan";
  if (tileKey === "nor-hachn") return "Nor Hachn";
  if (tileKey === "ptghni") return "Ptghni";
  if (tileKey === "garni") return "Garni";
  if (tileKey === "geghard") return "Geghard";
  if (tileKey === "tsakhkadzor") return "Tsakhkadzor";
  if (tileKey === "bjni") return "Bjni";
  if (tileKey === "yeghvard") return "Yeghvard";
  if (tileKey === "nor-geghi") return "Nor Geghi";
  if (tileKey === "metsamor") return "Metsamor";
  if (tileKey === "parakar") return "Parakar";
  if (tileKey === "merdzavan") return "Merdzavan";
  if (tileKey === "proshyan") return "Proshyan";
  if (tileKey === "noyemberyan") return "Noyemberyan";
  if (tileKey === "berd") return "Berd";
  if (tileKey === "chambarak") return "Chambarak";
  if (tileKey === "vedi") return "Vedi";
  if (tileKey === "areni") return "Areni";
  if (tileKey === "vayk") return "Vayk";
  if (tileKey === "agarak") return "Agarak";
  if (tileKey === "kajaran") return "Kajaran";
  if (tileKey === "aparan") return "Aparan";
  if (tileKey === "talin") return "Talin";
  if (tileKey === "maralik") return "Maralik";
  if (tileKey === "artik") return "Artik";
  return "Armenia";
}

// AI verification using Gemini
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

    const prompt = `You are a sports facility verification expert for Armenia. Analyze this Google Places result and determine if it is ACTUALLY a sports facility (field, court, pool, gym, etc.) or a false positive (hotel, restaurant, shopping mall, residential building, etc.).

Place details:
- Name: "${placeName}"
- Address: "${placeAddress}"
- Google Place types: [${placeTypes}]
- Rating: ${placeRating} (${reviewCount} reviews)
- Found via search query: "${searchQuery}"
- Detected sport: "${detectedSport}"

IMPORTANT: Public sports fields in residential areas, parks, and neighborhoods ARE valid. Hotels, restaurants, malls, and non-sports businesses are NOT valid even if they have "sport" in their name. Schools with sports facilities ARE valid.

Respond in EXACTLY this JSON format (no extra text):
{
  "is_real_sports_facility": true/false,
  "is_suspicious": true/false,
  "suggested_name": "A clear, concise name for this facility in English (e.g. 'Arabkir District Basketball Court', 'Gyumri Central Stadium')",
  "corrected_sport_type": "football|basketball|tennis|volleyball|swimming|running|fitness|martial-arts|handball|badminton|skating|multi-sport",
  "reason": "Brief explanation of your verdict"
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI verification failed:", await aiResponse.text());
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

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
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
    const region = body.region || null; // e.g. "yerevan", "gyumri", "all"
    const force = body.force === true;
    
    // Filter tiles by region or specific key
    let tiles = ARMENIA_TILES;
    if (tileKey) {
      tiles = ARMENIA_TILES.filter((t) => t.key === tileKey);
    } else if (region && region !== "all") {
      tiles = ARMENIA_TILES.filter((t) => t.key.startsWith(region));
    }

    if (tiles.length === 0) {
      return new Response(JSON.stringify({ error: "No matching tiles found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalCandidates = 0;
    let autoApproved = 0;
    let flaggedForReview = 0;
    let rejected = 0;

    for (const tile of tiles) {
      // Check recent scan (7 day cooldown unless forced)
      if (!force) {
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
              maxResultCount: 20,
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

            // Spatial deduplication - candidate_fields (50m radius)
            const { data: nearby } = await supabase
              .from("candidate_fields")
              .select("id")
              .gte("latitude", lat - 0.0005)
              .lte("latitude", lat + 0.0005)
              .gte("longitude", lng - 0.0005)
              .lte("longitude", lng + 0.0005)
              .limit(1);

            if (nearby && nearby.length > 0) continue;

            // Spatial deduplication - verified_fields (50m radius)
            const { data: verifiedNearby } = await supabase
              .from("verified_fields")
              .select("id")
              .gte("latitude", lat - 0.0005)
              .lte("latitude", lat + 0.0005)
              .gte("longitude", lng - 0.0005)
              .lte("longitude", lng + 0.0005)
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

            if (!aiResult.isReal) {
              console.log(`AI rejected: "${place.displayName?.text}" - ${aiResult.reason}`);
              rejected++;
              continue;
            }

            let status: string;
            if (aiResult.isSuspicious) {
              status = "needs_review";
              flaggedForReview++;
            } else {
              status = "auto_approved";
              autoApproved++;
            }

            const city = getCityFromTileKey(tile.key);

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
                  city,
                },
              })
              .select("id")
              .single();

            if (insertError) {
              console.error("Insert error:", insertError);
              continue;
            }

            totalCandidates++;

            // Auto-approved → insert into verified_fields
            if (status === "auto_approved" && insertedCandidate) {
              const { error: verifiedError } = await supabase.from("verified_fields").insert({
                candidate_id: insertedCandidate.id,
                name: aiResult.suggestedName,
                latitude: lat,
                longitude: lng,
                sport_type: aiResult.sportType,
                city,
                address: place.formattedAddress || null,
                is_public: true,
                verification_status: "verified",
              });

              if (verifiedError) {
                console.error("Verified insert error:", verifiedError);
              }
            }

            // Suspicious → notify admins
            if (status === "needs_review") {
              const { data: admins } = await supabase
                .from("user_roles")
                .select("user_id")
                .eq("role", "admin");

              if (admins && admins.length > 0) {
                const notifications = admins.map((admin) => ({
                  user_id: admin.user_id,
                  type: "discovery",
                  title: "🔍 Suspicious field detected",
                  message: `AI flagged "${aiResult.suggestedName}" in ${city} for review: ${aiResult.reason}`,
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
