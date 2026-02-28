import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { authenticateRequest, isAuthError, corsHeaders } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/ratelimit.ts";
import { z, validateBody, isValidationError } from "../_shared/validation.ts";

const confirmSchema = z.object({
  sessions_purchased: z.number().int().min(1).max(10),
  checkout_session_id: z.string().min(1).max(200),
});

const logStep = (step: string, details?: Record<string, unknown>) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CONFIRM-SESSION-PURCHASE] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const auth = await authenticateRequest(req);
    if (isAuthError(auth)) return auth;

    const { userId } = auth;
    logStep("User authenticated", { userId });

    // Rate limit: 5 confirmations per minute
    const rl = checkRateLimit(`confirm-session:${userId}`, { maxRequests: 5, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const rawBody = await req.json();
    const parsed = validateBody(rawBody, confirmSchema);
    if (isValidationError(parsed)) return parsed;

    const { sessions_purchased: count, checkout_session_id } = parsed;

    logStep("Verifying Stripe checkout session", { checkout_session_id });

    const Stripe = (await import("https://esm.sh/stripe@18.5.0")).default;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const checkoutSession = await stripe.checkout.sessions.retrieve(checkout_session_id);

    if (checkoutSession.payment_status !== "paid") {
      logStep("Payment not completed", { status: checkoutSession.payment_status });
      throw new Error("Payment not completed");
    }

    if (checkoutSession.metadata?.user_id !== userId) {
      logStep("User ID mismatch", { expected: userId, got: checkoutSession.metadata?.user_id });
      throw new Error("Unauthorized: checkout session does not belong to this user");
    }

    const metaCount = parseInt(checkoutSession.metadata?.sessions_purchased || "0", 10);
    if (metaCount !== count) {
      logStep("Count mismatch", { expected: count, got: metaCount });
      throw new Error("Sessions count does not match checkout session");
    }

    logStep("Stripe verification passed, adding sessions", { count });

    const { data: newTotal, error: addError } = await supabaseClient.rpc(
      "add_purchased_sessions",
      { p_user_id: userId, p_count: count }
    );

    if (addError) throw addError;

    logStep("Sessions added successfully", { newTotal });

    return new Response(
      JSON.stringify({ success: true, sessions_added: count, new_total: newTotal }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
