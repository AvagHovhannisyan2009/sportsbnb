import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const YANDEX_GEOSUGGEST_API_KEY = "d2ab23f0-55b3-4d22-b0c3-29c88fd7ce70";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, lang, results, ll, spn, ull } = await req.json();

    if (!text || text.length < 2) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams({
      apikey: YANDEX_GEOSUGGEST_API_KEY,
      text,
      lang: lang || "en",
      results: String(results || 7),
      ll: ll || "44.5152,40.1872",
      spn: spn || "2,2",
      ull: ull || "44.5152,40.1872",
      print_address: "1",
      attrs: "uri",
    });

    const response = await fetch(`https://suggest-maps.yandex.ru/v1/suggest?${params}`);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Geosuggest proxy error:", error);
    return new Response(JSON.stringify({ error: error.message, results: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
