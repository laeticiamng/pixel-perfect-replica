import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticateRequest, isAuthError, getCorsHeaders, errorResponse } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/ratelimit.ts";
import { z, validateBody, isValidationError } from "../_shared/validation.ts";

const referralSchema = z.object({
  code: z.string().min(4).max(20),
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const auth = await authenticateRequest(req);
    if (isAuthError(auth)) return auth;

    // Rate limit: 5 referral attempts per minute
    const rl = checkRateLimit(`apply-referral:${auth.userId}`, { maxRequests: 5, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!, req);

    const rawBody = await req.json();
    const parsed = validateBody(rawBody, referralSchema, req);
    if (isValidationError(parsed)) return parsed;

    const { code } = parsed;

    // Use service role to call the RPC
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: success, error } = await adminClient.rpc("apply_referral", {
      p_referrer_code: code.toUpperCase(),
      p_referred_id: auth.userId,
    });

    if (error) {
      console.error("[apply-referral] RPC error:", error.message);
      return errorResponse(500, "Failed to apply referral", req);
    }

    return new Response(
      JSON.stringify({ success: !!success, applied: !!success }),
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[apply-referral] Error:", err instanceof Error ? err.message : err);
    return errorResponse(500, "Internal error", req);
  }
});
