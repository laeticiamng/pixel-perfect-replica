import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { authenticateRequest, isAuthError, corsHeaders } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/ratelimit.ts";
import { z, validateBody, isValidationError } from "../_shared/validation.ts";

// Session unitaire - 0.99€
const SESSION_PRICE_ID = "price_1SvGdqDFa5Y9NR1IrL2P71Ms";

const purchaseSchema = z.object({
  quantity: z.number().int().min(1).max(10).optional().default(1),
});

const logStep = (step: string, details?: Record<string, unknown>) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PURCHASE-SESSION] ${step}${d}`);
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
    logStep("User authenticated", { userId, email: userEmail });

    // Rate limit: 5 purchase attempts per minute
    const rl = checkRateLimit(`purchase-session:${userId}`, { maxRequests: 5, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const rawBody = await req.json().catch(() => ({}));
    const parsed = validateBody(rawBody, purchaseSchema);
    if (isValidationError(parsed)) return parsed;

    const sessionQuantity = parsed.quantity;
    logStep("Quantity", { quantity: sessionQuantity });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "https://nearvity.fr";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [{ price: SESSION_PRICE_ID, quantity: sessionQuantity }],
      mode: "payment",
      success_url: `${origin}/premium?session_purchased=${sessionQuantity}&checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium?canceled=true`,
      metadata: {
        user_id: userId,
        sessions_purchased: sessionQuantity.toString(),
        type: "session_purchase",
      },
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
