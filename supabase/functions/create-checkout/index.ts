import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { normalizeCheckoutPlan } from "./plan.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Nearvity+ Premium - 9.90€/mois
const NEARVITY_PLUS_PRICE_ID = "price_1SvGdpDFa5Y9NR1I1qP73OYs";

// Legacy prices (kept for existing subscribers)
const LEGACY_PRICES = {
  monthly: "price_1SvEe4DFa5Y9NR1ImEz1QUFQ",
  yearly: "price_1SvEe5DFa5Y9NR1IQGnbirFh",
};


const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    // Use getClaims for JWT validation without server round-trip
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims?.sub) {
      logStep("JWT validation failed", { error: claimsError?.message });
      throw new Error("Session expirée, veuillez vous reconnecter");
    }
    
    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email as string;
    
    if (!userEmail) throw new Error("Email not available in token");
    
    logStep("User authenticated via claims", { userId, email: userEmail });

    const { plan } = await req.json();
    const normalizedPlan = normalizeCheckoutPlan(plan);

    if (plan !== normalizedPlan) {
      logStep("Legacy plan alias mapped", { from: plan, to: normalizedPlan });
    }

    // Use Nearvity+ price by default, fall back to legacy for existing plans
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
    
    // Check if customer already exists
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
      
      // Check if already has active subscription
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
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/premium?success=true`,
      cancel_url: `${origin}/premium?canceled=true`,
      metadata: {
        user_id: userId,
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
