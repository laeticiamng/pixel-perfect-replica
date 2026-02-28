import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { authenticateRequest, isAuthError, corsHeaders } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await authenticateRequest(req);
    if (isAuthError(auth)) return auth;

    console.log("[get-mapbox-token] Authenticated user:", auth.userId);

    const mapboxToken = Deno.env.get("MAPBOX_ACCESS_TOKEN");
    if (!mapboxToken) throw new Error("MAPBOX_ACCESS_TOKEN not configured");

    return new Response(
      JSON.stringify({ token: mapboxToken }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[get-mapbox-token] Error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
