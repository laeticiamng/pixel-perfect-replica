import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Session unitaire - 0.99€
const SESSION_PRICE_ID = "price_1SvGdqDFa5Y9NR1IrL2P71Ms";

// Rate limiting: 5 purchase attempts per minute per user
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitCache.get(userId);
  if (!entry || now > entry.resetTime) {
    rateLimitCache.set(userId, { count: 1, resetTime: now + 60000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PURCHASE-SESSION] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims?.sub) {
      logStep("JWT validation failed", { error: claimsError?.message });
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;
    if (!userEmail) throw new Error("Email not available in token");
    
    logStep("User authenticated", { userId, email: userEmail });

    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: "Trop de tentatives, réessaie dans 1 minute" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    const { quantity = 1 } = await req.json().catch(() => ({ quantity: 1 }));
    const sessionQuantity = Math.min(Math.max(1, quantity), 10); // Limit 1-10 sessions per purchase
    logStep("Quantity", { quantity: sessionQuantity });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check if customer already exists
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
      line_items: [
        {
          price: SESSION_PRICE_ID,
          quantity: sessionQuantity,
        },
      ],
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
