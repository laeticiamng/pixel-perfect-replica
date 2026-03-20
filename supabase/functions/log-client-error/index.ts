import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/auth.ts";

/**
 * Edge Function: log-client-error
 * Receives client-side errors and logs them into analytics_events.
 * Accepts both authenticated (with JWT) and anonymous reports.
 */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { message, stack, component, url, userAgent, level = "error" } = body;

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to extract user id from JWT (optional - anonymous errors are accepted)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const anonClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data } = await anonClient.auth.getUser(token);
      userId = data?.user?.id ?? null;
    }

    // Insert into analytics_events using service role (bypasses RLS)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await serviceClient
      .from("analytics_events")
      .insert({
        event_name: `client_${level}`,
        event_category: "error",
        user_id: userId,
        page_path: url ?? null,
        event_data: {
          message: message.substring(0, 1000),
          stack: stack?.substring(0, 2000) ?? null,
          component: component ?? null,
          user_agent: userAgent?.substring(0, 500) ?? null,
          level,
          reported_at: new Date().toISOString(),
        },
      });

    if (insertError) {
      console.error("[log-client-error] Insert failed:", insertError.message);
      return new Response(JSON.stringify({ error: "Failed to log error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[log-client-error] Unexpected:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function serve(handler: (req: Request) => Promise<Response>) {
  // @ts-expect-error Deno global is provided in the Supabase Edge runtime
  Deno.serve(handler);
}
