import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { authenticateRequest, isAuthError, corsHeaders } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/ratelimit.ts";
import { normalizeCheckoutPlan } from "./plan.ts";

// Nearvity+ Premium - 9.90€/mois
const NEARVITY_PLUS_PRICE_ID = "price_1T2TExDFa5Y9NR1Id27rDAA8";

// Legacy prices (kept for existing subscribers)
const LEGACY_PRICES = {
  monthly: "price_1SvEe4DFa5Y9NR1ImEz1QUFQ",
  yearly: "price_1SvEe5DFa5Y9NR1IQGnbirFh",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const auth = await authenticateRequest(req);
    if (isAuthError(auth)) return auth;

    const { userId, email: userEmail } = auth;
    if (!userEmail) throw new Error("Email not available in token");
    logStep("User authenticated via claims", { userId, email: userEmail });

    // Rate limit: 5 checkout creations per minute
    const rl = checkRateLimit(`create-checkout:${userId}`, { maxRequests: 5, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const { plan } = await req.json();
    const normalizedPlan = normalizeCheckoutPlan(plan);

    if (plan !== normalizedPlan) {
      logStep("Legacy plan alias mapped", { from: plan, to: normalizedPlan });
    }

    let priceId = NEARVITY_PLUS_PRICE_ID;
    if (normalizedPlan === "yearly") {
      priceId = LEGACY_PRICES.yearly;
    } else if (normalizedPlan === "monthly_legacy") {
      priceId = LEGACY_PRICES.monthly;
    }
    logStep("Plan selected", { rawPlan: plan, normalizedPlan, priceId });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string | undefined;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        logStep("User already has active subscription");
        return new Response(
          JSON.stringify({ error: "Tu as déjà un abonnement Premium actif !" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    const origin = req.headers.get("origin") || "https://nearvity.fr";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/premium?success=true`,
      cancel_url: `${origin}/premium?canceled=true`,
      metadata: { user_id: userId },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url }),
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
